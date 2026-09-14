import {
  Color,
  DirectionalLight,
  DynamicDrawUsage,
  Group,
  HemisphereLight,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createWebGLSurface } from './webgl-surface.js';

// Each project tile gets the same tile vocabulary as the hero, arranged into a
// form that echoes the work: a conversation gathering into a sphere, a calm
// drift of owned things, a design grid under a travelling ripple. The CSS
// illustration underneath stays as the fallback when there is no renderer.
const TILES = {
  cape: {
    form: 'orb',
    colors: ['#635bff', '#b2a2ff'],
    count: 170,
    offset: [0.95, 0.8],
  },
  warranties: {
    form: 'drift',
    colors: ['#635bff', '#b2a2ff'],
    count: 54,
    offset: [0, 0],
  },
  invision: {
    form: 'grid',
    colors: ['#635bff', '#bad4e9'],
    count: 156,
    offset: [0, 0],
  },
};

const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const GRID_COLUMNS = 13;

function place(form, index, count, time, target) {
  if (form === 'orb') {
    const y = 1 - (index / (count - 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = GOLDEN * index + time * 0.18;
    const breathe = 1.35 + Math.sin(time * 0.5 + index * 0.08) * 0.06;
    return target
      .set(Math.cos(theta) * ring, y, Math.sin(theta) * ring)
      .multiplyScalar(breathe);
  }
  if (form === 'drift') {
    const rows = 5;
    const row = index % rows;
    const lane = Math.floor(index / rows);
    const lanes = Math.ceil(count / rows);
    const span = 4.6;
    // Each row slides at its own pace and wraps, and a per-tile offset keeps the
    // rows from reading as a barcode.
    const jitter = Math.sin(index * 41.7) * 0.28;
    const travel = (lane / lanes + time * (0.015 + row * 0.004)) % 1;
    return target.set(
      travel * span - span / 2,
      (row / (rows - 1) - 0.5) * 2.6 + jitter,
      Math.sin(travel * 6 + row) * 0.3,
    );
  }
  const column = index % GRID_COLUMNS;
  const row = Math.floor(index / GRID_COLUMNS);
  const rows = Math.ceil(count / GRID_COLUMNS);
  const x = (column / (GRID_COLUMNS - 1) - 0.5) * 3.6;
  const y = (row / (rows - 1) - 0.5) * 3.6;
  return target.set(
    x,
    y,
    Math.sin(x * 1.5 + time * 0.9) * Math.cos(y * 1.2 - time * 0.5) * 0.26,
  );
}

for (const host of document.querySelectorAll('[data-work-tile]')) {
  const config = TILES[host.dataset.workTile];
  if (!config) continue;

  createWebGLSurface({
    host,
    canvas: host.querySelector('[data-work-tile-canvas]'),
    fov: 34,
    build({ scene, camera }) {
      const { form, count, offset } = config;
      const group = new Group();
      group.position.set(offset[0], offset[1], 0);
      group.rotation.set(-0.18, 0, form === 'orb' ? 0 : -0.05);
      const geometry = new RoundedBoxGeometry(1, 1, 0.34, 2, 0.12);
      const material = new MeshStandardMaterial({
        roughness: 0.34,
        metalness: 0.22,
      });
      const tiles = new InstancedMesh(geometry, material, count);
      tiles.instanceMatrix.setUsage(DynamicDrawUsage);
      tiles.frustumCulled = false;
      group.add(tiles);
      scene.add(group);
      scene.add(new HemisphereLight('#fff9ef', '#655889', 2.4));
      const keyLight = new DirectionalLight('#ffffff', 2.5);
      keyLight.position.set(-2, 4, 6);
      scene.add(keyLight);
      const rimLight = new DirectionalLight('#b8b0ff', 1.9);
      rimLight.position.set(3, 1, -3);
      scene.add(rimLight);

      const [near, far] = config.colors.map((hex) => new Color(hex));
      const dummy = new Object3D();
      const color = new Color();
      const position = new Vector3();
      const zAxis = new Vector3(0, 0, 1);
      const size = form === 'orb' ? 0.15 : 0.19;

      function update(time) {
        for (let index = 0; index < count; index++) {
          place(form, index, count, time, position);
          dummy.position.copy(position);
          if (form === 'orb')
            dummy.quaternion.setFromUnitVectors(
              zAxis,
              position.clone().normalize(),
            );
          else dummy.rotation.set(0, 0, Math.sin(time * 0.4 + index) * 0.05);
          const pulse = 1 + Math.sin(time * 1.2 + index * 0.4) * 0.07;
          dummy.scale.set(size * pulse * 1.5, size * pulse, size * 0.6);
          dummy.updateMatrix();
          tiles.setMatrixAt(index, dummy.matrix);
          color
            .copy(near)
            .lerp(far, (Math.sin(index * 0.35 + time * 0.25) + 1) / 2);
          tiles.setColorAt(index, color);
        }
        tiles.instanceMatrix.needsUpdate = true;
        tiles.instanceColor.needsUpdate = true;
      }

      update(0);
      return {
        update,
        // Hold a constant world height so the art scales with the tile box.
        resize: (width, height, camera) => {
          camera.position.z = 2.3 / Math.tan((camera.fov * Math.PI) / 360);
        },
      };
    },
  });
}
