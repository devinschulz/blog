import {
  Color, DynamicDrawUsage, Group, InstancedMesh, MeshBasicMaterial, Object3D,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createWebGLSurface } from './webgl-surface.js';

// A quiet version of the hero's tiles for the Current chapter panel.
//
// It sits behind body copy, and the note text starts at only 4.67:1 on the
// panel's own #5146df, so there is almost no contrast to spend. The material is
// therefore unlit and every tile colour is darker than the panel: an unlit tile
// renders exactly its own colour, so compositing it over the panel can only
// ever darken, and light text over a darker backdrop can only gain contrast.
// That makes the AA floor safe by construction rather than by tuning. Lit
// materials do not work here — the lights pushed tiles brighter than their base
// colour and dropped the note to 4.15:1. axe cannot catch any of this: it reads
// the CSS background, not canvas pixels.
const NEAR = new Color('#4a40cf');
const FAR = new Color('#382fa4');
const COUNT = 44;

const backdrop = document.querySelector('[data-chapter-backdrop]');

if (backdrop) {
  createWebGLSurface({
    host: backdrop,
    canvas: backdrop.querySelector('[data-chapter-canvas]'),
    fov: 34,
    build({ scene, camera }) {
      const group = new Group();
      group.rotation.set(-0.16, 0, -0.04);
      const geometry = new RoundedBoxGeometry(1, 1, 0.3, 2, 0.16);
      const material = new MeshBasicMaterial();
      const tiles = new InstancedMesh(geometry, material, COUNT);
      tiles.instanceMatrix.setUsage(DynamicDrawUsage);
      tiles.frustumCulled = false;
      group.add(tiles);
      scene.add(group);

      const dummy = new Object3D();
      const color = new Color();
      let halfWidth = 5;

      function update(time) {
        for (let index = 0; index < COUNT; index++) {
          // Slow lateral drift with a per-tile lane, wrapping across the panel.
          // The lane is hashed rather than derived from the index, so the tiles
          // scatter instead of tracing an arc across the panel.
          const hash = Math.sin(index * 12.9898) * 43758.5453;
          const lane = (hash - Math.floor(hash)) * 2 - 1;
          const travel = (index / COUNT + time * 0.012) % 1;
          const span = halfWidth * 2.4;
          dummy.position.set(
            travel * span - span / 2,
            lane * 2.6,
            Math.sin(index * 7.3) * 0.6 - 0.3,
          );
          dummy.rotation.set(0, 0, time * 0.06 + index);
          const size = 0.26 + Math.abs(Math.sin(index * 3.1)) * 0.22;
          dummy.scale.set(size * 1.6, size, size * 0.4);
          dummy.updateMatrix();
          tiles.setMatrixAt(index, dummy.matrix);
          color.copy(NEAR).lerp(FAR, (Math.sin(index * 0.9 + time * 0.15) + 1) / 2);
          tiles.setColorAt(index, color);
        }
        tiles.instanceMatrix.needsUpdate = true;
        tiles.instanceColor.needsUpdate = true;
      }

      update(0);
      return {
        update,
        // Cover the panel at any width without crowding the column of text.
        resize: (width, height, camera) => {
          camera.position.z = 3.2 / Math.tan((camera.fov * Math.PI) / 360);
          halfWidth = 3.2 * camera.aspect;
        },
      };
    },
  });
}
