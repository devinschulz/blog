import { createKineticScene } from './kinetic-scene';
import { createWebGLSurface } from './webgl-surface';

const hero = document.querySelector<HTMLElement>('[data-hero-motion]');
const canvas = hero?.querySelector<HTMLCanvasElement>('[data-hero-canvas]');

if (hero && canvas) {
  createWebGLSurface({
    host: hero,
    canvas,
    measure: hero.querySelector('[data-hero-art]'),
    fov: 38,
    pointer: true,
    build: createKineticScene,
  });
}
