import { PerspectiveCamera, Scene, Vector2, WebGLRenderer } from 'three';

// One motion harness behind every WebGL surface on the site. Each canvas gets
// the same guarantees: it pauses offscreen and in hidden tabs, honours reduced
// motion and forced colours, recovers from a lost context, and marks itself
// unavailable so the static fallback can take over.
export function createWebGLSurface({
  host,
  canvas,
  measure = canvas.parentElement,
  fov,
  near = 0.1,
  far = 40,
  pointer: usePointer = false,
  build,
}) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const forcedColors = matchMedia('(forced-colors: active)');
  let renderer;

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
    return;
  }

  const scene = new Scene();
  const camera = new PerspectiveCamera(fov, 1, near, far);
  const surface = build({ scene, camera, renderer });
  const pointer = new Vector2();
  const targetPointer = new Vector2();

  let visible = false;
  let lost = false;
  let frame = null;
  let lastTime = null;
  let elapsed = 0;

  function draw() {
    surface.update(elapsed, pointer);
    renderer.render(scene, camera);
  }

  function animate(now) {
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

  function syncMotion() {
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

  function resize() {
    const { width, height } = measure.getBoundingClientRect();
    if (!width || !height || lost) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    surface.resize?.(width, height, camera);
    camera.updateProjectionMatrix();
    if (!forcedColors.matches) draw();
  }

  if (usePointer) {
    host.addEventListener('pointermove', (event) => {
      if (reducedMotion.matches || event.pointerType === 'touch') return;
      const rect = measure.getBoundingClientRect();
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
    });
    host.addEventListener('pointerleave', () => targetPointer.set(0, 0));
  }

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    lost = true;
    delete host.dataset.renderer;
    syncMotion();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    lost = false;
    resize();
    host.dataset.renderer = 'webgl';
    syncMotion();
  });
  new ResizeObserver(resize).observe(measure);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncMotion();
  }).observe(host);
  reducedMotion.addEventListener('change', syncMotion);
  forcedColors.addEventListener('change', () => {
    resize();
    syncMotion();
  });
  document.addEventListener('visibilitychange', syncMotion);
  resize();
  host.dataset.renderer = 'webgl';
}
