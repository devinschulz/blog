import { Controller } from '@hotwired/stimulus';
import {
  createWebGLSurface,
  type SceneContext,
  type Surface,
  type WebGLSurfaceHandle,
} from '../webgl-surface';
import { createKineticScene } from '../kinetic-scene';
import { createLatticeScene, LATTICE_FOV } from '../states-lattice';
import { createWorkTileScene, WORK_TILE_FOV, TILES } from '../work-tiles';
import { createBackdropScene, BACKDROP_FOV } from '../chapter-backdrop';

const HERO_FOV = 38;

interface SceneSpec {
  fov: number;
  pointer?: boolean;
  build(context: SceneContext): Surface;
}

// Every WebGL surface on the site runs through this one controller. The scene
// is chosen by value, and disconnect() releases the context — which is what
// makes these safe under Turbo, where the body is replaced without a reload.
export default class extends Controller<HTMLElement> {
  static override targets = ['canvas', 'measure'];
  static override values = { scene: String, variant: String };

  declare readonly canvasTarget: HTMLCanvasElement;
  declare readonly hasCanvasTarget: boolean;
  declare readonly measureTarget: HTMLElement;
  declare readonly hasMeasureTarget: boolean;
  declare readonly sceneValue: string;
  declare readonly variantValue: string;

  private handle?: WebGLSurfaceHandle;

  override connect(): void {
    const spec = this.spec();
    if (!spec || !this.hasCanvasTarget) return;
    this.handle = createWebGLSurface({
      host: this.element,
      canvas: this.canvasTarget,
      measure: this.hasMeasureTarget ? this.measureTarget : undefined,
      fov: spec.fov,
      pointer: spec.pointer,
      build: spec.build,
    });
  }

  override disconnect(): void {
    this.handle?.destroy();
    this.handle = undefined;
  }

  private spec(): SceneSpec | undefined {
    switch (this.sceneValue) {
      case 'hero':
        return { fov: HERO_FOV, pointer: true, build: createKineticScene };
      case 'lattice':
        return {
          fov: LATTICE_FOV,
          build: createLatticeScene(
            this.element.dataset.latticeMode === 'scattered',
          ),
        };
      case 'work-tile': {
        const config = TILES[this.variantValue];
        return config
          ? { fov: WORK_TILE_FOV, build: createWorkTileScene(config) }
          : undefined;
      }
      case 'backdrop':
        return { fov: BACKDROP_FOV, build: createBackdropScene() };
      default:
        return undefined;
    }
  }
}
