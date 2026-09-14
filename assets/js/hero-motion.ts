import { createKineticScene } from './kinetic-scene.js';
import { createWebGLSurface } from './webgl-surface.js';

const hero = document.querySelector('[data-hero-motion]');

if (hero) {
  createWebGLSurface({
    host: hero,
    canvas: hero.querySelector('[data-hero-canvas]'),
    measure: hero.querySelector('[data-hero-art]'),
    fov: 38,
    pointer: true,
    build: createKineticScene,
  });
}
