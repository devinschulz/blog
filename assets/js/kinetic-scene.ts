import {
  DirectionalLight,
  HemisphereLight,
  type PerspectiveCamera,
  type Vector2,
} from 'three';
import { createKineticSculpture } from './kinetic-sculpture';
import type { SceneContext, Surface } from './webgl-surface';

// The hero and the sharing cards are the same artwork under the same lights, so
// both build their scene here. scripts/build-social-background.mjs imports this
// module directly in a headless browser.
export function createKineticScene({ scene, camera }: SceneContext): Surface {
  camera.position.z = 10.8;
  const sculpture = createKineticSculpture();
  scene.add(sculpture.group);
  scene.add(new HemisphereLight('#ffffff', '#4a4a55', 2.5));
  const keyLight = new DirectionalLight('#ffffff', 2.6);
  keyLight.position.set(-3, 5, 6);
  scene.add(keyLight);
  const rimLight = new DirectionalLight('#ffd9cf', 2.2);
  rimLight.position.set(4, 1, -3);
  scene.add(rimLight);
  const fillLight = new DirectionalLight('#e6e6ee', 0.8);
  fillLight.position.set(1, -4, 3);
  scene.add(fillLight);
  return {
    dispose: () => sculpture.dispose(),
    update: (elapsed: number, pointer: Vector2) =>
      sculpture.update(elapsed, pointer),
    // Keep the whole sculpture in frame even in tall, narrow windows.
    resize: (_width: number, _height: number, camera: PerspectiveCamera) => {
      camera.position.z = Math.max(9.8, 7.5 / camera.aspect);
    },
  };
}
