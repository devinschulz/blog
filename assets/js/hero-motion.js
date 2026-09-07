(() => {
  const hero = document.querySelector('[data-hero-motion]');
  if (!hero) return;

  const circles = [...hero.querySelectorAll('[data-parallax]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let active = false;
  let frame = null;

  function render() {
    frame = null;
    if (!active) return;

    // Read layout once before writing either circle's compositor transform.
    const distance = Math.max(0, Math.min(window.scrollY, hero.getBoundingClientRect().height));
    circles.forEach((circle) => {
      circle.style.setProperty('--parallax-y', `${(distance * Number(circle.dataset.parallax)).toFixed(2)}px`);
    });
  }

  function schedule() {
    if (active && frame === null) frame = window.requestAnimationFrame(render);
  }

  function syncMotion() {
    active = visible && !document.hidden && !reducedMotion.matches;
    hero.dataset.motion = active ? 'running' : 'paused';

    if (active) {
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule);
      schedule();
    } else {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = null;
    }

    if (reducedMotion.matches) {
      circles.forEach((circle) => circle.style.removeProperty('--parallax-y'));
    }
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncMotion();
  });

  observer.observe(hero);
  reducedMotion.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
})();
