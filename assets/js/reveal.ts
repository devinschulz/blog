// Scroll reveals for blocks marked data-reveal. The page only hides them once
// this has run (the reveal-ready class), so without JavaScript, or with
// reduced motion (see site.css), everything is simply there.
let observer: IntersectionObserver | undefined;

function observe(): void {
  observer?.disconnect();
  if (!('IntersectionObserver' in window)) return;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.revealed = '';
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  for (const element of document.querySelectorAll<HTMLElement>(
    '[data-reveal]:not([data-revealed])',
  ))
    observer.observe(element);
}

export function startReveals(): void {
  document.documentElement.classList.add('reveal-ready');
  // Turbo swaps <body> on each visit, so the new blocks need observing.
  document.addEventListener('turbo:load', observe);
  document.addEventListener('turbo:render', observe);
  observe();
}
