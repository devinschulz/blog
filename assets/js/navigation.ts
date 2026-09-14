(() => {
  const menu = document.querySelector<HTMLDetailsElement>('[data-mobile-menu]');
  if (!menu) return;
  const summary = menu.querySelector('summary');
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      summary?.focus();
    }
  });
  document.addEventListener('pointerdown', (event) => {
    const target = event.target;
    if (menu.open && !(target instanceof Node && menu.contains(target)))
      menu.open = false;
  });
  menu.querySelectorAll('a').forEach((link) =>
    link.addEventListener('click', () => {
      menu.open = false;
      const destination = new URL(link.href);
      if (destination.pathname === location.pathname && destination.hash) {
        const section = document.getElementById(destination.hash.slice(1));
        if (section) {
          section.setAttribute('tabindex', '-1');
          section.focus({ preventScroll: true });
          section.addEventListener(
            'blur',
            () => section.removeAttribute('tabindex'),
            { once: true },
          );
        }
      }
    }),
  );
})();
