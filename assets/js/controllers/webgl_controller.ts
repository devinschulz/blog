import { Controller } from '@hotwired/stimulus';
import {
  createWebGLSurface,
  type SceneContext,
  type Surface,
  type WebGLSurfaceHandle,
} from '../webgl-surface';
import { createKineticScene } from '../kinetic-scene';
import { createLatticeScene, LATTICE_FOV } from '../states-lattice';
import { createStatesFieldScene, STATES_FIELD_FOV } from '../states-field';
import { createWorkImageScene, WORK_IMAGE_FOV } from '../work-image';

const HERO_FOV = 38;

interface SceneSpec {
  fov: number;
  pointer?: boolean;
  lazy?: boolean;
  build(context: SceneContext): Surface;
}

// Every WebGL surface on the site runs through this one controller. The scene
// is chosen by value, and disconnect() releases the context — which is what
// makes these safe under Turbo, where the body is replaced without a reload.
export default class extends Controller<HTMLElement> {
  static override targets = ['canvas', 'measure'];
  static override values = { scene: String };

  declare readonly canvasTarget: HTMLCanvasElement;
  declare readonly hasCanvasTarget: boolean;
  declare readonly measureTarget: HTMLElement;
  declare readonly hasMeasureTarget: boolean;
  declare readonly sceneValue: string;

  private handle?: WebGLSurfaceHandle;
  private approach?: IntersectionObserver;

  override connect(): void {
    const spec = this.spec();
    if (!spec || !this.hasCanvasTarget) return;
    // Surfaces further down the page take a context only once they are close
    // to the viewport, so a first visit doesn't spend six at once.
    if (spec.lazy) {
      this.approach = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          this.approach?.disconnect();
          this.approach = undefined;
          this.start(spec);
        },
        { rootMargin: '600px 0px' },
      );
      this.approach.observe(this.element);
    } else this.start(spec);
  }

  private start(spec: SceneSpec): void {
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
    this.approach?.disconnect();
    this.approach = undefined;
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
      case 'states-field':
        return {
          fov: STATES_FIELD_FOV,
          lazy: true,
          build: createStatesFieldScene,
        };
      case 'work-image':
        return { fov: WORK_IMAGE_FOV, lazy: true, build: createWorkImageScene };
      default:
        return undefined;
    }
  }
}
