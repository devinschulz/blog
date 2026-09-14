import { PerspectiveCamera, Scene, Vector2, WebGLRenderer } from 'three';

/** What a scene module receives when the harness builds it. */
export interface SceneContext {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
}

/** What a scene module hands back. Only `update` is required. */
export interface Surface {
  update(elapsed: number, pointer: Vector2): void;
  resize?(width: number, height: number, camera: PerspectiveCamera): void;
  /** Free geometry, materials and textures. Called on teardown. */
  dispose?(): void;
}

/** Returned so a Stimulus controller can tear the surface down on disconnect. */
export interface WebGLSurfaceHandle {
  destroy(): void;
}

export interface WebGLSurfaceOptions {
  /** Carries the data-motion and data-renderer attributes, and the pointer. */
  host: HTMLElement;
  canvas: HTMLCanvasElement;
  /** Element whose box drives the canvas size. Defaults to the canvas parent. */
  measure?: Element | null;
  fov: number;
  near?: number;
  far?: number;
  /** Track the pointer and hand it to `update`. */
  pointer?: boolean;
  build(context: SceneContext): Surface;
}

// One motion harness behind every WebGL surface on the site. Each canvas gets
// the same guarantees: it pauses offscreen and in hidden tabs, honours reduced
// motion and forced colours, recovers from a lost context, and marks itself
// unavailable so the static fallback can take over.
//
// Teardown matters as much as setup. Turbo replaces the <body> on navigation
// without reloading the document, so a surface that never released its context
// would leak one per visit — and browsers keep only a handful alive before they
// start dropping the oldest. Every listener here joins one AbortSignal, and the
// returned handle releases the context itself.
export function createWebGLSurface({
  host,
  canvas,
  measure,
  fov,
  near = 0.1,
  far = 40,
  pointer: usePointer = false,
  build,
}: WebGLSurfaceOptions): WebGLSurfaceHandle | undefined {
  const parent = measure ?? canvas.parentElement;
  if (!parent) return undefined;
  // Declared non-null so the hoisted closures below see it that way; narrowing
  // from the guard does not reach inside a function declaration.
  const box: Element = parent;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const forcedColors = matchMedia('(forced-colors: active)');
  const listeners = new AbortController();
  const { signal } = listeners;
  let renderer: WebGLRenderer;

  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
  } catch {
    // Without a graphics context the surface stays out of the layout entirely.
    host.dataset.renderer = 'none';
    return undefined;
  }

  const scene = new Scene();
  const camera = new PerspectiveCamera(fov, 1, near, far);
  const surface = build({ scene, camera, renderer });
  const pointer = new Vector2();
  const targetPointer = new Vector2();

  let visible = false;
  let lost = false;
  let frame: number | null = null;
  let lastTime: number | null = null;
  let elapsed = 0;

  function draw(): void {
    surface.update(elapsed, pointer);
    renderer.render(scene, camera);
  }

  function animate(now: number): void {
    frame = null;
    if (host.dataset.motion !== 'running') return;
    const delta =
      lastTime === null ? 0 : Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    elapsed += delta;
    pointer.lerp(targetPointer, 1 - Math.exp(-delta * 4));
    draw();
    frame = requestAnimationFrame(animate);
  }

  function syncMotion(): void {
    const active =
      visible &&
      !document.hidden &&
      !reducedMotion.matches &&
      !forcedColors.matches &&
      !lost;
    host.dataset.motion = active ? 'running' : 'paused';
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    lastTime = null;
    if (reducedMotion.matches) {
      pointer.set(0, 0);
      targetPointer.set(0, 0);
    }
    if (active) frame = requestAnimationFrame(animate);
  }

  function resize(): void {
    const { width, height } = box.getBoundingClientRect();
    if (!width || !height || lost) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    surface.resize?.(width, height, camera);
    camera.updateProjectionMatrix();
    if (!forcedColors.matches) draw();
  }

  if (usePointer) {
    host.addEventListener(
      'pointermove',
      (event) => {
        if (reducedMotion.matches || event.pointerType === 'touch') return;
        const rect = box.getBoundingClientRect();
        targetPointer.set(
          Math.max(
            -0.5,
            Math.min(0.5, (event.clientX - rect.left) / rect.width - 0.5),
          ),
          Math.max(
            -0.5,
            Math.min(0.5, (event.clientY - rect.top) / rect.height - 0.5),
          ),
        );
      },
      { signal },
    );
    host.addEventListener('pointerleave', () => targetPointer.set(0, 0), {
      signal,
    });
  }

  canvas.addEventListener(
    'webglcontextlost',
    (event) => {
      event.preventDefault();
      lost = true;
      delete host.dataset.renderer;
      syncMotion();
    },
    { signal },
  );
  canvas.addEventListener(
    'webglcontextrestored',
    () => {
      lost = false;
      resize();
      host.dataset.renderer = 'webgl';
      syncMotion();
    },
    { signal },
  );

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(box);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncMotion();
  });
  intersectionObserver.observe(host);

  reducedMotion.addEventListener('change', syncMotion, { signal });
  forcedColors.addEventListener(
    'change',
    () => {
      resize();
      syncMotion();
    },
    { signal },
  );
  document.addEventListener('visibilitychange', syncMotion, { signal });
  resize();
  host.dataset.renderer = 'webgl';

  return {
    destroy(): void {
      listeners.abort();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      surface.dispose?.();
      renderer.dispose();
      // dispose() alone leaves the context alive in some browsers; this hands
      // it back so a later visit can claim one.
      renderer.forceContextLoss();
      delete host.dataset.renderer;
      delete host.dataset.motion;
    },
  };
}
