import {
  DirectionalLight, HemisphereLight, PerspectiveCamera, Scene, Vector2, WebGLRenderer,
} from 'three';
import { createKineticSculpture } from './kinetic-sculpture.js';

const hero = document.querySelector('[data-hero-motion]');
if (hero) initHero(hero);

function initHero(hero) {
  const art = hero.querySelector('[data-hero-art]');
  const canvas = hero.querySelector('[data-hero-canvas]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const forcedColors = matchMedia('(forced-colors: active)');
  let renderer;

  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    // The static illustration also works without JavaScript or a graphics context.
    return;
  }

  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 40);
  camera.position.z = 10.8;
  const sculpture = createKineticSculpture();
  scene.add(sculpture.group);
  const pointer = new Vector2();
  const targetPointer = new Vector2();
  scene.add(new HemisphereLight('#fff9ef', '#655889', 2.5));
  const keyLight = new DirectionalLight('#ffffff', 2.6);
  keyLight.position.set(-3, 5, 6);
  scene.add(keyLight);
  const rimLight = new DirectionalLight('#b8b0ff', 2.2);
  rimLight.position.set(4, 1, -3);
  scene.add(rimLight);
  const fillLight = new DirectionalLight('#ffd5b8', 0.8);
  fillLight.position.set(1, -4, 3);
  scene.add(fillLight);

  let visible = false;
  let lost = false;
  let frame = null;
  let lastTime = null;
  let elapsed = 0;

  function draw() {
    sculpture.update(elapsed, pointer);
    renderer.render(scene, camera);
  }

  function animate(now) {
    frame = null;
    if (hero.dataset.motion !== 'running') return;
    const delta = lastTime === null ? 0 : Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    elapsed += delta;
    pointer.lerp(targetPointer, 1 - Math.exp(-delta * 4));
    draw();
    frame = requestAnimationFrame(animate);
  }

  function syncMotion() {
    const active = visible && !document.hidden && !reducedMotion.matches && !forcedColors.matches && !lost;
    hero.dataset.motion = active ? 'running' : 'paused';
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
    const { width, height } = art.getBoundingClientRect();
    if (!width || !height || lost) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Keep the whole sculpture in frame even in tall, narrow windows.
    camera.position.z = Math.max(9.8, 7.5 / camera.aspect);
    camera.updateProjectionMatrix();
    if (!forcedColors.matches) draw();
  }

  hero.addEventListener('pointermove', event => {
    if (reducedMotion.matches || event.pointerType === 'touch') return;
    const rect = art.getBoundingClientRect();
    targetPointer.set(
      Math.max(-0.5, Math.min(0.5, (event.clientX - rect.left) / rect.width - 0.5)),
      Math.max(-0.5, Math.min(0.5, (event.clientY - rect.top) / rect.height - 0.5)),
    );
  });
  hero.addEventListener('pointerleave', () => targetPointer.set(0, 0));
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    lost = true;
    delete hero.dataset.renderer;
    syncMotion();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    lost = false;
    resize();
    hero.dataset.renderer = 'webgl';
    syncMotion();
  });
  new ResizeObserver(resize).observe(art);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncMotion();
  }).observe(hero);
  reducedMotion.addEventListener('change', syncMotion);
  forcedColors.addEventListener('change', () => { resize(); syncMotion(); });
  document.addEventListener('visibilitychange', syncMotion);
  resize();
  hero.dataset.renderer = 'webgl';
}
