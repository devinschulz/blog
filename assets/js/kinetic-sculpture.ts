import {
  Color,
  DynamicDrawUsage,
  Group,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Hundreds of little interface tiles fold between a precise grid and a living
// vortex. Shared geometry and one instanced draw keep the sculpture lightweight.
export function createKineticSculpture() {
  const group = new Group();
  const columns = 42;
  const rows = 13;
  const count = columns * rows;
  const geometry = new RoundedBoxGeometry(1, 1, 0.34, 2, 0.1);
  const material = new MeshStandardMaterial({
    roughness: 0.32,
    metalness: 0.25,
  });
  const tiles = new InstancedMesh(geometry, material, count);
  tiles.instanceMatrix.setUsage(DynamicDrawUsage);
  tiles.frustumCulled = false;
  group.add(tiles);

  // Graphite into silver, with one warm band of the site's redline accent
  // travelling through it and the odd tile caught fully in that colour.
  const graphite = new Color('#3b3b43');
  const silver = new Color('#c8c8d0');
  const redline = new Color('#d4502f');
  const flare = new Color('#f0907a');
  const color = new Color();
  const dummy = new Object3D();
  const center = new Vector3();
  const along = new Vector3();
  const across = new Vector3();
  const normal = new Vector3();
  const zAxis = new Vector3(0, 0, 1);
  const TAU = Math.PI * 2;

  function surface(
    u: number,
    v: number,
    time: number,
    fold: number,
    target: Vector3,
  ): void {
    const angle = u * TAU + Math.sin(v * 3 + time * 0.25) * 0.16;
    const twist = angle * 1.5 + time * 0.18;
    const width = (v - 0.5) * 1.6;
    const radius = 1.92 + width * Math.cos(twist);
    const curlX = Math.cos(angle) * radius;
    const curlY = Math.sin(angle) * radius;
    const curlZ =
      width * Math.sin(twist) + Math.sin(angle * 3 + time * 0.35) * 0.36;
    const gridX = (u - 0.5) * 5.1;
    const gridY = (v - 0.5) * 3.8;
    const wave =
      Math.sin(u * 7 + time * 0.8) * Math.cos(v * 5 - time * 0.5) * 0.45;
    target.set(
      gridX + (curlX - gridX) * fold,
      gridY + (curlY - gridY) * fold,
      wave + (curlZ - wave) * fold,
    );
  }

  function update(
    time: number,
    pointer: { x: number; y: number } = { x: 0, y: 0 },
  ): void {
    // Linger at each composition, then unfold with a slow, smooth transition.
    const cycle = 0.5 + Math.cos(time * 0.23) * 0.5;
    const fold = cycle * cycle * (3 - 2 * cycle);
    group.rotation.set(
      -0.28 + Math.sin(time * 0.21) * 0.15 + pointer.y * 0.14,
      -0.26 + Math.sin(time * 0.17) * 0.32 + pointer.x * 0.22,
      -0.22 + Math.sin(time * 0.13) * 0.16,
    );
    group.position.y = Math.sin(time * 0.6) * 0.1;

    for (let column = 0; column < columns; column++) {
      for (let row = 0; row < rows; row++) {
        const index = column * rows + row;
        const u = column / columns;
        const v = row / (rows - 1);
        surface(u, v, time, fold, center);
        surface(u + 0.001, v, time, fold, along);
        surface(u, v + 0.001, time, fold, across);
        along.sub(center);
        across.sub(center);
        normal.crossVectors(along, across).normalize();
        const distance =
          (center.x - pointer.x * 5) ** 2 + (center.y + pointer.y * 5) ** 2;
        const touch = Math.exp(-distance * 1.2);
        center.addScaledVector(normal, touch * 0.25);
        dummy.position.copy(center);
        dummy.quaternion.setFromUnitVectors(zAxis, normal);
        dummy.rotateZ(
          Math.atan2(along.y, along.x) * (1 - fold) +
            Math.sin(time * 0.6 + u * 9) * 0.06,
        );
        const pulse =
          1 + Math.sin(time * 1.1 - column * 0.2 + row * 0.35) * 0.055;
        dummy.scale.set(
          (0.105 + fold * 0.115) * pulse,
          (0.26 - fold * 0.16) * pulse,
          0.2,
        );
        dummy.updateMatrix();
        tiles.setMatrixAt(index, dummy.matrix);

        const warmth = 0.5 + 0.5 * Math.sin(u * TAU - 0.7 + time * 0.12);
        color
          .copy(graphite)
          .lerp(silver, v * 0.72)
          .lerp(redline, warmth ** 3 * 0.9);
        if ((column + row * 3) % 37 === 0) color.lerp(flare, 0.95);
        tiles.setColorAt(index, color);
      }
    }
    tiles.instanceMatrix.needsUpdate = true;
    if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true;
  }

  function dispose(): void {
    geometry.dispose();
    material.dispose();
    tiles.dispose();
  }

  update(0);
  return { group, update, dispose };
}
