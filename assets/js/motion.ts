(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = [
    ...document.querySelectorAll<HTMLElement>('[data-animated-image]'),
  ];

  const imageIn = (container: HTMLElement) => container.querySelector('img');
  const buttonIn = (container: HTMLElement) =>
    container.querySelector('button');

  function stopAnimation(container: HTMLElement): void {
    const img = imageIn(container);
    const button = buttonIn(container);
    if (!img || !button) return;
    if (img.dataset.staticSrc) img.src = img.dataset.staticSrc;
    button.textContent = 'Play animation';
    container.dataset.playing = 'false';
  }

  function syncMotion(): void {
    const paused = reducedMotion.matches;
    animations.forEach((container) => {
      const button = buttonIn(container);
      if (!button) return;
      button.hidden = false;
      button.disabled = paused;
      if (paused) stopAnimation(container);
      if (paused) button.textContent = 'Animation paused by motion preference';
      else
        button.textContent =
          container.dataset.playing === 'true'
            ? 'Stop animation'
            : 'Play animation';
    });
  }

  animations.forEach((container) =>
    buttonIn(container)?.addEventListener('click', () => {
      if (reducedMotion.matches) return;
      if (container.dataset.playing === 'true') stopAnimation(container);
      else {
        const img = imageIn(container);
        const button = buttonIn(container);
        if (!img || !button) return;
        if (img.dataset.animatedSrc) img.src = img.dataset.animatedSrc;
        container.dataset.playing = 'true';
        button.textContent = 'Stop animation';
      }
    }),
  );
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) animations.forEach(stopAnimation);
  });
  reducedMotion.addEventListener('change', syncMotion);
  syncMotion();
})();
