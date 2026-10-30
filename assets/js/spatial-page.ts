import { createSpatialField } from './spatial-field';
import { mountSpatialTitle } from './spatial-title';
import { mountProjectPreviews } from './project-lens';

let disposePage: (() => void) | undefined;
let mountedBody: HTMLElement | undefined;
function mountPage() {
  // A deferred script and Turbo's initial load can both announce the same body.
  if (mountedBody === document.body && disposePage) return;
  disposePage?.();
  disposePage = undefined;
  mountedBody = undefined;
  if (
    !document.querySelector('.hero, .archive-hero, .case-hero, .article-hero')
  )
    return;
  mountedBody = document.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const forcedColors = matchMedia('(forced-colors: active)');
  let clearProjects: (() => void) | undefined;
  let clearSurfaces: (() => void) | undefined;
  function update() {
    clearSurfaces?.();
    clearSurfaces = undefined;
    if (document.documentElement.hasAttribute('data-inspect-active')) {
      clearProjects?.();
      clearProjects = undefined;
      return;
    }
    clearProjects ??= mountProjectPreviews();
    if (reduce.matches || forcedColors.matches) return;
    const field = createSpatialField();
    const title = mountSpatialTitle(field);
    clearSurfaces = () => {
      field.dispose();
      title();
    };
  }
  update();
  reduce.addEventListener('change', update);
  forcedColors.addEventListener('change', update);
  document.addEventListener('portfolio:inspect', update);
  disposePage = () => {
    clearProjects?.();
    document.removeEventListener('portfolio:inspect', update);
    reduce.removeEventListener('change', update);
    forcedColors.removeEventListener('change', update);
    clearSurfaces?.();
  };
}
document.addEventListener('turbo:load', mountPage);
function unmountPage() {
  disposePage?.();
  disposePage = undefined;
  mountedBody = undefined;
}
document.addEventListener('turbo:before-cache', unmountPage);
document.addEventListener('turbo:before-render', unmountPage);
if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', mountPage, { once: true });
else mountPage();
