import {
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  PlaneGeometry,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  Vector2,
  Vector4,
} from 'three';
import type { FrameInfo, SceneContext, Surface } from './webgl-surface';

// A case-study screenshot drawn as a mosaic of tiles. At rest the tiles meet
// exactly and the picture is simply the picture. The first time a card comes
// into view the tiles settle into place, and while it is hovered or focused
// the tiles nearest the pointer (or the centre, for keyboard focus) lift apart,
// the same move the hero sculpture makes. The <img> underneath stays in the
// document: it carries the alt text, it is what shows without WebGL, and it
// only steps aside once the texture is drawn.

export const WORK_IMAGE_FOV = 24;

const vertexShader = /* glsl */ `
  attribute vec2 aCell;
  attribute float aDelay;
  uniform vec2 uGrid;
  uniform vec2 uSize;
  uniform vec2 uPointer;
  uniform float uHover;
  uniform float uReveal;
  uniform vec4 uCover;
  varying vec2 vUv;
  varying float vAlpha;
  varying float vLift;

  void main() {
    vec2 cell = uSize / uGrid;
    vec2 centre = ((aCell + 0.5) / uGrid - 0.5) * uSize;

    float settle = clamp((uReveal - aDelay) / 0.45, 0.0, 1.0);
    settle = 1.0 - pow(1.0 - settle, 3.0);

    vec2 toPointer = centre - uPointer;
    float reach = min(uSize.x, uSize.y) * 0.2;
    float lift = uHover * exp(-dot(toPointer, toPointer) / (reach * reach));

    float scale = mix(0.55, 1.0, settle) * (1.0 - lift * 0.14) * 1.004;
    vec3 p = position * vec3(cell * scale, 1.0);
    // Tilt away from the pointer, and lift toward the viewer.
    vec2 away = normalize(toPointer + 0.0001);
    p.z += p.x * away.x * lift * 0.35 + p.y * away.y * lift * 0.35;
    p.xy += centre + away * lift * cell * 0.12;
    p.z += lift * cell.x * 0.6 + (1.0 - settle) * cell.x * 3.0;

    vUv = uCover.xy + ((aCell + uv) / uGrid) * uCover.zw;
    vAlpha = settle;
    vLift = lift;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  varying vec2 vUv;
  varying float vAlpha;
  varying float vLift;

  void main() {
    vec4 color = texture2D(uMap, vUv);
    // A lifted tile catches a little light, so the gaps read as depth.
    color.rgb = mix(color.rgb, vec3(1.0), vLift * 0.06);
    gl_FragColor = vec4(color.rgb, color.a * vAlpha);
    #include <colorspace_fragment>
  }
`;

// Parse CSS object-position ("18% 0%", "center", "top") into 0..1 fractions.
function objectPosition(img: HTMLImageElement): Vector2 {
  const [x = '50%', y = '50%'] = getComputedStyle(img)
    .objectPosition.split(' ')
    .map((part) => part.trim());
  const fraction = (value: string) =>
    value.endsWith('%') ? parseFloat(value) / 100 : 0.5;
  return new Vector2(fraction(x), fraction(y));
}

export function createWorkImageScene({
  scene,
  host,
  signal,
  invalidate,
}: SceneContext): Surface {
  const img = host.querySelector('img');
  const link = host.closest('a') ?? host;
  const geometry = new PlaneGeometry(1, 1);
  const texture = new Texture();
  texture.colorSpace = SRGBColorSpace;
  const uniforms = {
    uMap: { value: texture },
    uGrid: { value: new Vector2(1, 1) },
    uSize: { value: new Vector2(1, 1) },
    uPointer: { value: new Vector2() },
    uHover: { value: 0 },
    uReveal: { value: 0 },
    // x, y: UV offset; z, w: UV scale, matching object-fit: cover.
    uCover: { value: new Vector4(0, 0, 1, 1) },
  };
  const material = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
  });

  const MAX = 40 * 30;
  const mesh = new InstancedMesh(geometry, material, MAX);
  mesh.frustumCulled = false;
  const cells = new InstancedBufferAttribute(new Float32Array(MAX * 2), 2);
  const delays = new InstancedBufferAttribute(new Float32Array(MAX), 1);
  geometry.setAttribute('aCell', cells);
  geometry.setAttribute('aDelay', delays);
  const identity = new Matrix4();
  for (let i = 0; i < MAX; i++) mesh.setMatrixAt(i, identity);
  scene.add(mesh);

  let ready = false;
  let revealFrom: number | null = null;
  let hoverTarget = 0;
  let width = 1;
  let height = 1;
  const pointerTarget = new Vector2();

  // Hover follows the pointer; keyboard focus lifts the centre instead, so the
  // same feedback reaches people who are not using a mouse.
  link.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType === 'touch') return;
      const rect = host.getBoundingClientRect();
      pointerTarget.set(
        ((event.clientX - rect.left) / rect.width - 0.5) * width,
        (0.5 - (event.clientY - rect.top) / rect.height) * height,
      );
      hoverTarget = 1;
    },
    { signal },
  );
  link.addEventListener('pointerleave', () => (hoverTarget = 0), { signal });
  link.addEventListener(
    'focusin',
    () => {
      if (!link.matches(':focus-visible')) return;
      pointerTarget.set(0, 0);
      hoverTarget = 1;
    },
    { signal },
  );
  link.addEventListener('focusout', () => (hoverTarget = 0), { signal });

  function layout(): void {
    const columns = Math.max(8, Math.min(40, Math.round(width / 26)));
    const rows = Math.max(
      6,
      Math.min(30, Math.round((height / width) * columns)),
    );
    uniforms.uGrid.value.set(columns, rows);
    uniforms.uSize.value.set(width, height);
    let i = 0;
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        cells.setXY(i, column, row);
        // Settle in a diagonal sweep from the bottom left, with a little noise.
        const noise = Math.sin(column * 12.9898 + row * 78.233) * 43758.5453;
        delays.setX(
          i,
          ((column / columns + row / rows) / 2) * 0.7 +
            (noise - Math.floor(noise)) * 0.15,
        );
        i++;
      }
    }
    mesh.count = i;
    cells.needsUpdate = true;
    delays.needsUpdate = true;
    cover();
  }

  // Match CSS object-fit: cover and object-position exactly, so switching
  // between the <img> and the canvas is invisible.
  function cover(): void {
    if (!img?.naturalWidth) return;
    const imageAspect = img.naturalWidth / img.naturalHeight;
    const boxAspect = width / height;
    const position = objectPosition(img);
    const u = uniforms.uCover.value;
    if (imageAspect > boxAspect) {
      u.z = boxAspect / imageAspect;
      u.w = 1;
      u.x = (1 - u.z) * position.x;
      u.y = 0;
    } else {
      u.z = 1;
      u.w = imageAspect / boxAspect;
      u.x = 0;
      // UVs run bottom-up; object-position runs top-down.
      u.y = (1 - u.w) * (1 - position.y);
    }
  }

  async function load(): Promise<void> {
    if (!img) return;
    try {
      if (!img.complete) await img.decode();
    } catch {
      return;
    }
    if (signal.aborted || !img.naturalWidth) return;
    // Copy the picture into a canvas of fixed size. The <img> is responsive and
    // can switch to a larger srcset candidate later; a texture sized from the
    // first candidate would then be re-uploaded at the wrong dimensions.
    const scale = Math.min(
      1,
      2048 / Math.max(img.naturalWidth, img.naturalHeight),
    );
    const copy = document.createElement('canvas');
    copy.width = Math.round(img.naturalWidth * scale);
    copy.height = Math.round(img.naturalHeight * scale);
    const context = copy.getContext('2d');
    if (!context) return;
    context.drawImage(img, 0, 0, copy.width, copy.height);
    texture.image = copy;
    texture.needsUpdate = true;
    cover();
    ready = true;
    // Only play the settle if the card has not been seen yet; appearing mid-view
    // would make a picture that was already there vanish and rebuild.
    const rect = host.getBoundingClientRect();
    const seen = rect.top < innerHeight && rect.bottom > 0;
    if (seen) uniforms.uReveal.value = 2;
    host.dataset.texture = 'ready';
    invalidate();
  }
  // The <img> is lazy; start once it has been asked for.
  if (img) {
    if (img.complete) void load();
    else
      img.addEventListener('load', () => void load(), { signal, once: true });
  }

  return {
    update(time: number, _pointer: unknown, frame?: FrameInfo) {
      if (!ready) return;
      const still = frame?.still ?? false;
      const delta = frame?.delta ?? 0;
      if (still) {
        uniforms.uReveal.value = 2;
        uniforms.uHover.value = 0;
        return;
      }
      if (uniforms.uReveal.value < 2 && delta > 0) {
        revealFrom ??= time;
        uniforms.uReveal.value = Math.min(2, (time - revealFrom) / 0.9);
      }
      // Lift in about 200ms, settle back a little faster.
      const rate = hoverTarget > uniforms.uHover.value ? 12 : 16;
      const ease = delta === 0 ? 0 : 1 - Math.exp(-delta * rate);
      uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * ease;
      uniforms.uPointer.value.lerp(pointerTarget, ease || 0);
    },
    resize(w, h, camera) {
      width = w;
      height = h;
      camera.position.z = h / 2 / Math.tan((camera.fov * Math.PI) / 360);
      camera.near = 1;
      camera.far = camera.position.z * 3;
      layout();
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      texture.dispose();
      mesh.dispose();
    },
  };
}
