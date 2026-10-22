import type { Inspector } from './inspect-mode';

let inspector: Inspector | undefined;
let opening = false;
let keys = '';
let lastKey = 0;
let taps = 0;
let lastTap = 0;

async function toggle(): Promise<void> {
  if (opening) return;
  taps = 0;
  keys = '';
  opening = true;
  try {
    const { createInspector } = await import('./inspect-mode');
    inspector ??= createInspector();
    inspector.toggle();
  } finally {
    opening = false;
  }
}

document.addEventListener('keydown', (event) => {
  const target = event.target;
  if (
    event.defaultPrevented ||
    event.isComposing ||
    event.repeat ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    (target instanceof Element &&
      target.closest(
        'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="combobox"]',
      ))
  ) {
    keys = '';
    return;
  }
  if (event.key === 'Escape') {
    keys = '';
    return;
  }
  if (!/^[a-z]$/i.test(event.key)) {
    keys = '';
    return;
  }
  const now = performance.now();
  keys = `${now - lastKey > 2000 ? '' : keys}${event.key.toLowerCase()}`.slice(
    -7,
  );
  lastKey = now;
  if (keys === 'inspect') {
    keys = '';
    void toggle();
  }
});

document.addEventListener(
  'click',
  (event) => {
    if (
      inspector?.active ||
      event.defaultPrevented ||
      event.detail === 0 ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      event.shiftKey
    )
      return;
    const brand =
      event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>('.brand')
        : null;
    if (!brand) return;
    const now = performance.now();
    taps = now - lastTap > 1400 ? 1 : taps + 1;
    lastTap = now;
    // A normal single click retains its home link. Subsequent taps can finish
    // the sequence without repeatedly navigating or replacing the logo.
    if (taps > 1 && new URL(brand.href).pathname === location.pathname)
      event.preventDefault();
    if (taps === 5) {
      event.preventDefault();
      taps = 0;
      void toggle();
    }
  },
  true,
);

document.addEventListener('turbo:before-cache', () => inspector?.close(false));
document.addEventListener('turbo:before-render', () => inspector?.close(false));
window.addEventListener('pagehide', () => inspector?.close(false));
