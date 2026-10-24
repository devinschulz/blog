import { Controller } from '@hotwired/stimulus';

// Keep both contents lists in sync with the reading position. Without script,
// they remain native section links and code keeps its keyboard scroll region.
export default class extends Controller<HTMLElement> {
  private listeners?: AbortController;
  private resizeObserver?: ResizeObserver;
  private frame = 0;
  private links: HTMLAnchorElement[] = [];
  private headings: HTMLElement[] = [];

  override connect(): void {
    this.listeners = new AbortController();
    this.links = Array.from(
      this.element.querySelectorAll<HTMLAnchorElement>('.article-contents a'),
    );
    this.headings = Array.from(
      new Set(
        this.links
          .map((link) =>
            document.getElementById(decodeURIComponent(link.hash.slice(1))),
          )
          .filter((heading): heading is HTMLElement => heading !== null),
      ),
    );
    const options = { passive: true, signal: this.listeners.signal };
    window.addEventListener('scroll', this.schedule, options);
    window.addEventListener('resize', this.schedule, options);
    this.resizeObserver = new ResizeObserver(this.schedule);
    this.resizeObserver.observe(this.element);
    this.schedule();
    void document.fonts.ready.then(() => {
      if (this.listeners && !this.listeners.signal.aborted) this.schedule();
    });
  }

  override disconnect(): void {
    this.listeners?.abort();
    this.listeners = undefined;
    this.resizeObserver?.disconnect();
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private readonly schedule = (): void => {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.update();
    });
  };

  private update(): void {
    let current: HTMLElement | undefined;
    const threshold = Math.min(160, window.innerHeight * 0.25);
    for (const heading of this.headings) {
      if (heading.getBoundingClientRect().top <= threshold) current = heading;
      else break;
    }
    for (const link of this.links) {
      const active = current?.id === decodeURIComponent(link.hash.slice(1));
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    for (const code of this.element.querySelectorAll<HTMLElement>(
      '.code-block',
    )) {
      const pre = code.querySelector('pre');
      const hint = code.querySelector<HTMLElement>('[data-code-scroll-hint]');
      if (pre && hint) hint.hidden = pre.scrollWidth <= pre.clientWidth + 1;
    }
  }
}
