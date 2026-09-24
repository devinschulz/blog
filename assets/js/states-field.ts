import {
  Color,
  DynamicDrawUsage,
  InstancedMesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
} from 'three';
import type { FrameInfo, SceneContext, Surface } from './webgl-surface';

// A field of flat interface tiles around the State Shift demo. It reads the
// demo's own data-state, so the artwork shows the same thing the panel says:
// settled when ready, tracing the edge for keyboard focus, knocked loose on an
// error, rippling while waiting, and snapping square when done. The panel sits
// on top and stays opaque; only the margin around it shows the field.

type DemoState = 'default' | 'focus' | 'error' | 'processing' | 'success';

export const STATES_FIELD_FOV = 20;

// Each state is a small set of weights the tiles blend toward, so a change of
// state is one short eased transition rather than a cut.
interface Pose {
  scatter: number;
  ripple: number;
  trace: number;
  grid: number;
  tint: number;
}

const POSES: Record<DemoState, Pose> = {
  default: { scatter: 0, ripple: 0, trace: 0, grid: 0, tint: 0 },
  focus: { scatter: 0, ripple: 0, trace: 1, grid: 0, tint: 0 },
  error: { scatter: 1, ripple: 0, trace: 0, grid: 0, tint: 1 },
  processing: { scatter: 0, ripple: 1, trace: 0, grid: 0, tint: 0 },
  success: { scatter: 0, ripple: 0, trace: 0, grid: 1, tint: 1 },
};

const TILE = 18;
const MAX_TILES = 2400;

const hash = (x: number, y: number): number => {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
};

export function createStatesFieldScene({
  scene,
  host,
  signal,
  invalidate,
}: SceneContext): Surface {
  const panel = host.querySelector<HTMLElement>('[data-demo]');
  const geometry = new PlaneGeometry(1, 1);
  const material = new MeshBasicMaterial({ transparent: true });
  const tiles = new InstancedMesh(geometry, material, MAX_TILES);
  tiles.instanceMatrix.setUsage(DynamicDrawUsage);
  tiles.frustumCulled = false;
  scene.add(tiles);

  const dummy = new Object3D();
  const color = new Color();
  const base = new Color();
  const lift = new Color();
  const alarm = new Color();
  const done = new Color();

  // Colours come from the page's own tokens, so the field follows light and
  // dark mode and never introduces a colour the rest of the site lacks.
  function readColors(): void {
    const style = getComputedStyle(host);
    const token = (name: string) => style.getPropertyValue(name).trim();
    const surface = new Color(token('--color-surface') || '#eaeaec');
    const ink = new Color(token('--color-ink') || '#18181b');
    base.copy(surface).lerp(ink, 0.12);
    lift.copy(surface).lerp(ink, 0.55);
    alarm.set(token('--color-accent') || '#b93a1e');
    done.set(token('--color-success') || '#17693a');
  }
  readColors();
  matchMedia('(prefers-color-scheme: dark)').addEventListener(
    'change',
    () => {
      readColors();
      invalidate();
    },
    { signal },
  );

  const current: Pose = { ...POSES.default };
  let target: Pose = POSES.default;
  let stateChangedAt = 0;
  let now = 0;
  const readState = (): DemoState =>
    (panel?.dataset.state as DemoState | undefined) ?? 'default';
  let state = readState();
  target = POSES[state];

  if (panel) {
    // The panel grows when an error message appears; the hole follows it.
    const panelSize = new ResizeObserver(() => {
      measureHole();
      invalidate();
    });
    panelSize.observe(panel);
    signal.addEventListener('abort', () => panelSize.disconnect());
    const stateWatch = new MutationObserver(() => {
      state = readState();
      target = POSES[state];
      stateChangedAt = now;
      invalidate();
    });
    stateWatch.observe(panel, {
      attributes: true,
      attributeFilter: ['data-state'],
    });
    signal.addEventListener('abort', () => stateWatch.disconnect());
  }

  let width = 1;
  let height = 1;
  let columns = 1;
  let rows = 1;
  // The panel's box inside the field, in field pixels, so tiles know how far
  // they are from its edge.
  const hole = { left: 0, top: 0, right: 0, bottom: 0 };

  function measureHole(): void {
    if (!panel) return;
    const field = host.querySelector('.states-field')?.getBoundingClientRect();
    const box = panel.getBoundingClientRect();
    if (!field) return;
    hole.left = box.left - field.left;
    hole.top = box.top - field.top;
    hole.right = box.right - field.left;
    hole.bottom = box.bottom - field.top;
  }

  function update(time: number, _pointer: unknown, frame?: FrameInfo): void {
    now = time;
    const still = frame?.still ?? false;
    const delta = frame?.delta ?? 0;
    // About 220ms to settle: quick enough to read as the panel's response.
    const ease = still || delta === 0 ? 1 : 1 - Math.exp(-delta * 14);
    for (const key of Object.keys(current) as (keyof Pose)[])
      current[key] += (target[key] - current[key]) * ease;

    const t = still ? 0 : time;
    const since = Math.max(0, time - stateChangedAt);
    const cx = (hole.left + hole.right) / 2;
    const cy = (hole.top + hole.bottom) / 2;
    const perimeter =
      2 * (hole.right - hole.left + (hole.bottom - hole.top)) || 1;
    // The traced point runs once around the panel every four seconds.
    const traceAt = ((t * 0.25) % 1) * perimeter;

    let index = 0;
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        if (index >= MAX_TILES) break;
        const x = (column + 0.5) * TILE;
        const y = (row + 0.5) * TILE;
        const inside =
          x > hole.left - 2 &&
          x < hole.right + 2 &&
          y > hole.top - 2 &&
          y < hole.bottom + 2;
        if (inside) continue;

        const noise = hash(column, row);
        // Distance to the panel edge, and where along the edge this tile sits.
        const dx = Math.max(hole.left - x, 0, x - hole.right);
        const dy = Math.max(hole.top - y, 0, y - hole.bottom);
        const edge = Math.hypot(dx, dy);
        const near = Math.exp(-edge / 60);
        const along = alongPerimeter(x, y);
        let gap = Math.abs(along - traceAt);
        gap = Math.min(gap, perimeter - gap);
        const traced = Math.exp(-((gap / 120) ** 2)) * near;
        const radius = Math.hypot(x - cx, y - cy);
        const wave = Math.sin(radius / 26 - t * 5) * 0.5 + 0.5;
        const sweep = Math.exp(-(((radius - since * 900) / 90) ** 2));

        const breathe = Math.sin(t * 0.8 + noise * 6.28) * 0.5 + 0.5;
        let size = 0.46 + breathe * 0.08 * (1 - current.grid);
        size += current.ripple * wave * 0.32 * near;
        size += current.trace * traced * 0.4;
        size += current.grid * 0.18;
        size += current.scatter * noise * 0.2;

        const jitter = current.scatter * near;
        const px =
          x +
          (hash(row, column) - 0.5) * 16 * jitter +
          Math.sin(t * 9 + noise * 20) * 1.5 * jitter;
        const py = y + (noise - 0.5) * 16 * jitter;

        dummy.position.set(px - width / 2, height / 2 - py, 0);
        dummy.rotation.set(0, 0, (noise - 0.5) * 1.2 * current.scatter);
        const side = TILE * Math.min(0.86, size);
        dummy.scale.set(side, side, 1);
        dummy.updateMatrix();
        tiles.setMatrixAt(index, dummy.matrix);

        color.copy(base);
        color.lerp(
          lift,
          Math.min(
            1,
            current.trace * traced * 1.4 + current.ripple * wave * near * 0.7,
          ),
        );
        if (state === 'error')
          color.lerp(alarm, current.tint * (noise > 0.82 ? 0.9 : 0) * near);
        if (state === 'success')
          color.lerp(done, current.tint * Math.max(sweep, near * 0.25));
        tiles.setColorAt(index, color);
        index++;
      }
    }
    tiles.count = index;
    tiles.instanceMatrix.needsUpdate = true;
    if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true;
  }

  // Unwrap the panel's outline into one line, clockwise from the top left, and
  // return where the nearest point on it falls along that line.
  function alongPerimeter(x: number, y: number): number {
    const w = hole.right - hole.left;
    const h = hole.bottom - hole.top;
    const cx = Math.max(hole.left, Math.min(hole.right, x));
    const cy = Math.max(hole.top, Math.min(hole.bottom, y));
    const top = Math.abs(cy - hole.top);
    const right = Math.abs(cx - hole.right);
    const bottom = Math.abs(cy - hole.bottom);
    const left = Math.abs(cx - hole.left);
    const nearest = Math.min(top, right, bottom, left);
    if (nearest === top) return cx - hole.left;
    if (nearest === right) return w + (cy - hole.top);
    if (nearest === bottom) return w + h + (hole.right - cx);
    return 2 * w + h + (hole.bottom - cy);
  }

  return {
    update,
    resize(w, h, cam) {
      width = w;
      height = h;
      columns = Math.ceil(w / TILE);
      rows = Math.ceil(h / TILE);
      measureHole();
      // One world unit per CSS pixel, so tiles stay a fixed, crisp size.
      cam.position.z = h / 2 / Math.tan((cam.fov * Math.PI) / 360);
      cam.near = 1;
      cam.far = cam.position.z * 2;
      readColors();
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      tiles.dispose();
    },
  };
}
