import {
  Color,
  DirectionalLight,
  DynamicDrawUsage,
  Group,
  HemisphereLight,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { SceneContext, Surface } from './webgl-surface';

// Every interface tile walks the same path a real one does. Empty, ready,
// focused, working, recovering, done — one full lifecycle spans the band, so
// the claim the headline beside it makes is shown rather than stated. The empty
// state earns its place twice: it is a real state, and it keeps the wrap from
// done back to ready from lerping through mud.
const STATES = [
  '#5a5a66',
  '#8e8e9a',
  '#c8c8d0',
  '#d4502f',
  '#f0907a',
  '#dcdce1',
].map((hex) => new Color(hex));
const HEIGHTS = [1, 1.2, 0.86, 1.3, 0.7, 0.5];
const PROCESSING = 2;
const MAX_COLUMNS = 32;
const ROWS = 4;

const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

// A tile's own place in the run. Scattered drops the orderly left-to-right
// lifecycle for per-tile noise: every state is still there, just no longer in
// any order — which is what a 404 is.
const offsetFor = (
  scattered: boolean,
  column: number,
  row: number,
  u: number,
  v: number,
): number => {
  if (!scattered) return u * STATES.length + v * 0.4;
  const hash = Math.sin(column * 12.9898 + row * 78.233) * 43758.5453;
  return (hash - Math.floor(hash)) * STATES.length;
};

export const LATTICE_FOV = 30;

/** Scattered drops the ordered lifecycle for per-tile noise; see offsetFor. */
export function createLatticeScene(scattered: boolean) {
  return function build({ scene }: SceneContext): Surface {
    const group = new Group();
    group.rotation.set(-0.2, 0, -0.015);
    const geometry = new RoundedBoxGeometry(1, 1, 0.3, 2, 0.14);
    const material = new MeshStandardMaterial({
      roughness: 0.36,
      metalness: 0.2,
    });
    const tiles = new InstancedMesh(geometry, material, MAX_COLUMNS * ROWS);
    tiles.instanceMatrix.setUsage(DynamicDrawUsage);
    tiles.frustumCulled = false;
    group.add(tiles);
    scene.add(group);
    scene.add(new HemisphereLight('#ffffff', '#4a4a55', 2.4));
    const keyLight = new DirectionalLight('#ffffff', 2.4);
    keyLight.position.set(-2, 4, 6);
    scene.add(keyLight);
    const rimLight = new DirectionalLight('#ffd9cf', 1.8);
    rimLight.position.set(3, 1, -2);
    scene.add(rimLight);

    const dummy = new Object3D();
    const color = new Color();
    const halfWidth = 6.4;
    let halfHeight = 1;
    // Narrow screens get fewer, larger tiles rather than an unreadable mesh.
    let columns = MAX_COLUMNS;

    function update(time: number): void {
      const spacingX = (halfWidth * 2) / columns;
      // A tall, narrow band needs its rows spread across more of the frame,
      // or the tiles huddle in a stripe through the middle of it.
      const airy = columns >= 20;
      const spanY = halfHeight * (airy ? 0.86 : 1.45);
      const spacingY = spanY / (ROWS - 1);
      // At the narrow end the tiles are few and small, so they take a larger
      // share of their cell: a phone needs weight more than it needs air.
      const tileWidth = spacingX * (airy ? 0.6 : 0.72);
      const tileHeight = spacingY * (airy ? 0.46 : 0.6);

      for (let column = 0; column < MAX_COLUMNS; column++) {
        for (let row = 0; row < ROWS; row++) {
          const index = column * ROWS + row;
          if (column >= columns) {
            dummy.scale.set(0, 0, 0);
            dummy.updateMatrix();
            tiles.setMatrixAt(index, dummy.matrix);
            continue;
          }
          const u = (column + 0.5) / columns;
          const v = row / (ROWS - 1);

          // Tiles linger on each state, then hand over quickly, so the change
          // reads as a transition rather than a shimmer.
          const phase = time * 0.4 + offsetFor(scattered, column, row, u, v);
          const step = Math.floor(phase);
          const handoff = smoothstep(0.84, 1, phase - step);
          const current =
            ((step % STATES.length) + STATES.length) % STATES.length;
          const next = (current + 1) % STATES.length;

          color.copy(STATES[current]).lerp(STATES[next], handoff);
          tiles.setColorAt(index, color);

          let height =
            HEIGHTS[current] + (HEIGHTS[next] - HEIGHTS[current]) * handoff;
          if (current === PROCESSING)
            height += Math.sin(time * 6 - u * 4) * 0.07 * (1 - handoff);

          dummy.position.set(
            (u - 0.5) * halfWidth * 2,
            (v - 0.5) * spanY,
            Math.sin(u * 5 + time * 0.5) * 0.12 + handoff * 0.18,
          );
          dummy.rotation.set(0, 0, handoff * 0.08);
          dummy.scale.set(tileWidth, tileHeight * height, 0.12);
          dummy.updateMatrix();
          tiles.setMatrixAt(index, dummy.matrix);
        }
      }
      tiles.instanceMatrix.needsUpdate = true;
      if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true;
    }

    update(0);
    return {
      update,
      dispose: () => {
        geometry.dispose();
        material.dispose();
        tiles.dispose();
      },
      // Hold the full run of tiles in frame, at a density the width can carry.
      resize: (width, height, camera) => {
        halfHeight = halfWidth / camera.aspect;
        columns = Math.max(12, Math.min(MAX_COLUMNS, Math.round(width / 44)));
        camera.position.z = halfHeight / Math.tan((camera.fov * Math.PI) / 360);
      },
    };
  };
}
