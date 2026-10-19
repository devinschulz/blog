import { createSpatialField } from './spatial-field';
import { mountSpatialTitle } from './spatial-title';
import { mountProjectPreviews } from './project-lens';

let disposePage: (() => void) | undefined;
function mountPage() {
  disposePage?.();
  disposePage = undefined;
  if (
    !document.querySelector('.hero, .archive-hero, .case-hero, .article-hero')
  )
    return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const clearProjects = mountProjectPreviews();
  let clearSurfaces: (() => void) | undefined;
  function update() {
    clearSurfaces?.();
    clearSurfaces = undefined;
    if (reduce.matches) return;
    const field = createSpatialField();
    const title = mountSpatialTitle(field);
    clearSurfaces = () => {
      field.dispose();
      title();
    };
  }
  update();
  reduce.addEventListener('change', update);
  disposePage = () => {
    clearProjects();
    reduce.removeEventListener('change', update);
    clearSurfaces?.();
  };
}
document.addEventListener('turbo:load', mountPage);
function unmountPage() {
  disposePage?.();
  disposePage = undefined;
}
document.addEventListener('turbo:before-cache', unmountPage);
document.addEventListener('turbo:before-render', unmountPage);
if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', mountPage, { once: true });
else mountPage();
