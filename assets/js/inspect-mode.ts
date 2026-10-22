export interface Inspector {
  readonly active: boolean;
  toggle(): void;
  close(restore?: boolean): void;
}

const targets =
  'a, button, input, textarea, select, summary, img, svg, h1, h2, h3, h4, p, pre, figure, section, article, nav, header, footer';
const number = (value: number) => String(Math.round(value * 10) / 10);
const pixels = (value: string) => Number.parseFloat(value) || 0;
const label = (element: Element) =>
  `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}`;

export function createInspector(): Inspector {
  let host: HTMLDivElement | undefined;
  let events: AbortController | undefined;
  let observer: ResizeObserver | undefined;
  let selected: Element | undefined;
  let previousFocus: HTMLElement | undefined;
  let frame = 0;
  let announce = false;

  function select(element: Element, deliberate = false) {
    if (!host || element.closest('[data-inspect-ui]')) return;
    selected = element;
    observer?.disconnect();
    observer?.observe(element);
    observer?.observe(document.body);
    announce = deliberate;
    schedule();
  }

  function schedule() {
    if (host && !frame && !document.hidden) frame = requestAnimationFrame(draw);
  }

  function draw() {
    frame = 0;
    if (!host || !selected?.isConnected) return;
    const rect = selected.getBoundingClientRect();
    const style = getComputedStyle(selected);
    const padding = ['Top', 'Right', 'Bottom', 'Left'].map((side) =>
      pixels(style.getPropertyValue(`padding-${side.toLowerCase()}`)),
    );
    const margin = ['Top', 'Right', 'Bottom', 'Left'].map((side) =>
      pixels(style.getPropertyValue(`margin-${side.toLowerCase()}`)),
    );
    const name = label(selected);
    const size = `${number(rect.width)} × ${number(rect.height)} px`;
    const type = `${style.fontFamily.split(',')[0].replace(/["']/g, '')} · ${style.fontSize} / ${style.lineHeight} · ${style.fontWeight}`;
    const set = (selector: string, value: string) => {
      host!.querySelector<HTMLElement>(selector)!.textContent = value;
    };
    set('[data-inspect-element]', name);
    set('[data-inspect-size]', size);
    set('[data-inspect-type]', type);
    set('[data-inspect-color]', style.color);
    set('[data-inspect-padding]', `${padding.map(number).join(' / ')} px`);
    set('[data-inspect-margin]', `${margin.map(number).join(' / ')} px`);
    set('[data-inspect-badge]', `${name} · ${size}`);
    const parent = host.querySelector<HTMLButtonElement>(
      '[data-inspect-parent]',
    )!;
    parent.disabled =
      !selected.parentElement ||
      selected.parentElement === document.body ||
      selected === document.body;

    const svg = host.querySelector<SVGSVGElement>('svg')!;
    svg.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
    const box = host.querySelector<SVGRectElement>('[data-inspect-outline]')!;
    for (const [attribute, value] of Object.entries({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    }))
      box.setAttribute(attribute, String(value));
    const [pt, pr, pb, pl] = padding.map((value) => Math.max(0, value));
    const [mt, mr, mb, ml] = margin.map((value) => Math.max(0, value));
    const path = (x: number, y: number, width: number, height: number) =>
      `M${x},${y}h${width}v${height}h${-width}Z`;
    const bounds = path(rect.left, rect.top, rect.width, rect.height);
    host
      .querySelector('[data-inspect-padding-box]')!
      .setAttribute(
        'd',
        bounds +
          path(
            rect.left + pl,
            rect.top + pt,
            Math.max(0, rect.width - pl - pr),
            Math.max(0, rect.height - pt - pb),
          ),
      );
    host
      .querySelector('[data-inspect-margin-box]')!
      .setAttribute(
        'd',
        path(
          rect.left - ml,
          rect.top - mt,
          rect.width + ml + mr,
          rect.height + mt + mb,
        ) + bounds,
      );
    const badge = host.querySelector<HTMLElement>('[data-inspect-badge]')!;
    badge.style.transform = `translate(${Math.max(8, Math.min(rect.left, innerWidth - Math.min(320, innerWidth - 16) - 8))}px, ${Math.max(8, Math.min(rect.top - 30, innerHeight - 40))}px)`;
    if (announce) {
      set(
        '[data-inspect-status]',
        `${name}. ${size}. Padding, top right bottom left: ${padding.map(number).join(', ')} pixels. ${type}.`,
      );
      announce = false;
    }
  }

  function close(restore = true) {
    if (!host) return;
    events?.abort();
    observer?.disconnect();
    cancelAnimationFrame(frame);
    frame = 0;
    host.remove();
    host = undefined;
    selected = undefined;
    delete document.documentElement.dataset.inspectActive;
    if (restore) {
      document.dispatchEvent(new Event('portfolio:inspect'));
      if (previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true });
    }
    previousFocus = undefined;
  }

  function open() {
    if (host) return;
    previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : undefined;
    document
      .querySelectorAll<HTMLDetailsElement>('[data-mobile-menu][open]')
      .forEach((menu) => {
        menu.open = false;
      });
    host = document.createElement('div');
    host.dataset.inspectUi = '';
    host.className = 'inspect-overlay';
    host.innerHTML = `
      <svg class="inspect-geometry" aria-hidden="true" width="100%" height="100%">
        <path data-inspect-margin-box fill="#ffbc7040" fill-rule="evenodd"/>
        <path data-inspect-padding-box fill="#67d9ed40" fill-rule="evenodd"/>
        <rect data-inspect-outline fill="none" stroke="#ff78ac" stroke-width="2"/>
      </svg>
      <div class="inspect-badge" data-inspect-badge aria-hidden="true"></div>
      <section class="inspect-panel" aria-label="Inspect mode">
        <div class="inspect-panel-top"><h2>Inspect mode<span class="inspect-live">LIVE</span></h2><div class="inspect-panel-actions"><button type="button" data-inspect-collapse aria-controls="inspect-details" aria-expanded="true" aria-label="Hide Inspect details">−</button><button type="button" data-inspect-close aria-label="Close Inspect mode">Done <span aria-hidden="true">×</span></button></div></div>
        <div id="inspect-details">
        <p class="inspect-instructions">You found the design file. Move or tap to inspect. Tab explores controls; Esc closes.</p>
        <div class="inspect-selection"><p data-inspect-element></p><button type="button" data-inspect-parent>↑ Parent</button></div>
        <dl>
          <div><dt>Size</dt><dd data-inspect-size></dd></div>
          <div><dt>Type</dt><dd data-inspect-type></dd></div>
          <div><dt>Color</dt><dd data-inspect-color></dd></div>
          <div><dt><span class="inspect-padding-dot" aria-hidden="true"></span>Padding</dt><dd data-inspect-padding></dd></div>
          <div><dt><span class="inspect-margin-dot" aria-hidden="true"></span>Margin</dt><dd data-inspect-margin></dd></div>
        </dl>
        <p class="inspect-order">Spacing in px · top / right / bottom / left</p>
        </div>
        <p class="sr-only" role="status" aria-live="polite" data-inspect-status>Inspect mode on. Select an element to see its size, spacing, and typography. Escape closes.</p>
      </section>`;
    document.body.append(host);
    document.documentElement.dataset.inspectActive = 'true';
    document.dispatchEvent(new Event('portfolio:inspect'));
    events = new AbortController();
    const options = { signal: events.signal };
    observer = new ResizeObserver(schedule);
    const canHover = matchMedia('(any-hover: hover) and (any-pointer: fine)');
    const fromEvent = (event: Event) =>
      event.target instanceof Element ? event.target.closest(targets) : null;
    document.addEventListener(
      'pointermove',
      (event) => {
        if (event.pointerType === 'touch' || !canHover.matches) return;
        const element = fromEvent(event);
        if (element && element !== selected) select(element);
      },
      options,
    );
    document.addEventListener(
      'click',
      (event) => {
        if (
          event.target instanceof Element &&
          event.target.closest('[data-inspect-ui]')
        )
          return;
        const element = fromEvent(event);
        if (!element) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        select(element, true);
      },
      { ...options, capture: true },
    );
    document.addEventListener(
      'focusin',
      (event) => {
        const element = fromEvent(event);
        if (element) select(element, true);
      },
      options,
    );
    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopImmediatePropagation();
          close();
        }
      },
      { ...options, capture: true },
    );
    document.addEventListener('scroll', schedule, {
      ...options,
      passive: true,
      capture: true,
    });
    document.addEventListener('load', schedule, { ...options, capture: true });
    document.addEventListener('visibilitychange', schedule, options);
    window.addEventListener('resize', schedule, options);
    window.visualViewport?.addEventListener('resize', schedule, options);
    window.visualViewport?.addEventListener('scroll', schedule, options);
    host
      .querySelector('[data-inspect-close]')!
      .addEventListener('click', () => close(), options);
    host.querySelector('[data-inspect-collapse]')!.addEventListener(
      'click',
      (event) => {
        const button = event.currentTarget as HTMLButtonElement;
        const details = host!.querySelector<HTMLElement>('#inspect-details')!;
        details.hidden = !details.hidden;
        button.setAttribute('aria-expanded', String(!details.hidden));
        button.setAttribute(
          'aria-label',
          details.hidden ? 'Show Inspect details' : 'Hide Inspect details',
        );
        button.textContent = details.hidden ? '+' : '−';
      },
      options,
    );
    host.querySelector('[data-inspect-parent]')!.addEventListener(
      'click',
      () => {
        if (selected?.parentElement) select(selected.parentElement, true);
      },
      options,
    );
    const first =
      document
        .elementFromPoint(innerWidth / 2, innerHeight / 3)
        ?.closest(targets) || document.querySelector('main h1');
    if (first) select(first);
    host
      .querySelector<HTMLButtonElement>('[data-inspect-close]')!
      .focus({ preventScroll: true });
  }

  return {
    get active() {
      return Boolean(host);
    },
    toggle() {
      if (host) close();
      else open();
    },
    close,
  };
}
