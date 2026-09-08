(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = [...document.querySelectorAll('[data-animated-image]')];

  function stopAnimation(container) {
    const img = container.querySelector('img');
    img.src = img.dataset.staticSrc;
    container.querySelector('button').textContent = 'Play animation';
    container.dataset.playing = 'false';
  }

  function syncMotion() {
    const paused = reducedMotion.matches;
    animations.forEach(container => {
      const button = container.querySelector('button');
      button.hidden = false;
      button.disabled = paused;
      if (paused) stopAnimation(container);
      if (paused) button.textContent = 'Animation paused by motion preference';
      else button.textContent = container.dataset.playing === 'true' ? 'Stop animation' : 'Play animation';
    });
  }

  animations.forEach(container => container.querySelector('button').addEventListener('click', () => {
    if (reducedMotion.matches) return;
    if (container.dataset.playing === 'true') stopAnimation(container);
    else {
      const img = container.querySelector('img');
      img.src = img.dataset.animatedSrc;
      container.dataset.playing = 'true';
      container.querySelector('button').textContent = 'Stop animation';
    }
  }));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) animations.forEach(stopAnimation);
  });
  reducedMotion.addEventListener('change', syncMotion);
  syncMotion();
})();
