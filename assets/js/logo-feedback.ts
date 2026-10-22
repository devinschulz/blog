let count = 0;
const bursts = new Map<HTMLElement, () => void>();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function clear() {
  for (const remove of [...bursts.values()]) remove();
}

export function showLogoCount(brand: HTMLElement): void {
  count++;
  if (reducedMotion.matches) clear();
  const bounds = brand.getBoundingClientRect();
  const style = getComputedStyle(brand);
  const pop = document.createElement('span');
  pop.className = 'logo-count';
  pop.dataset.logoCount = String(count);
  pop.setAttribute('aria-hidden', 'true');
  pop.textContent = `+${count}`;
  pop.style.color = style.color;
  pop.style.left = `${Math.min(bounds.right + 1, innerWidth - 32)}px`;
  pop.style.top = `${Math.max(30, bounds.top + 6)}px`;
  document.body.append(pop);
  let animation: Animation | undefined;
  let timer = 0;
  const remove = () => {
    bursts.delete(pop);
    clearTimeout(timer);
    animation?.cancel();
    pop.remove();
  };
  bursts.set(pop, remove);
  if (reducedMotion.matches) {
    timer = window.setTimeout(remove, 900);
    return;
  }
  const easing = style.getPropertyValue('--ease-snappy').trim();
  animation = pop.animate(
    [
      {
        transform: 'translate(-50%, 6px) scale(.95)',
        opacity: 0,
        offset: 0,
        easing,
      },
      {
        transform: 'translate(-50%, -12px) scale(1.04)',
        opacity: 1,
        offset: 0.22,
        easing,
      },
      {
        transform: 'translate(-50%, -8px) scale(1)',
        opacity: 1,
        offset: 0.42,
        easing,
      },
      {
        transform: 'translate(-50%, -15px) scale(1)',
        opacity: 0.9,
        offset: 0.7,
      },
      {
        transform: 'translate(-50%, -26px) scale(.98)',
        opacity: 0,
        offset: 1,
      },
    ],
    { duration: 560, easing: 'linear' },
  );
  void animation.finished.then(remove, () => {});
}

reducedMotion.addEventListener('change', clear);
document.addEventListener('portfolio:inspect', () => {
  clear();
  count = 0;
});
document.addEventListener('turbo:before-cache', clear);
document.addEventListener('turbo:before-render', clear);
window.addEventListener('pagehide', clear);
