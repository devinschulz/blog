import { Controller } from '@hotwired/stimulus';

// Keep both contents lists in sync with the reading position. Without script,
// they remain native section links and code keeps its keyboard scroll region.
export default class extends Controller<HTMLElement> {
  static override targets = ['resume', 'resumeLink', 'resumeLabel'];

  declare readonly hasResumeTarget: boolean;
  declare readonly resumeTarget: HTMLElement;
  declare readonly resumeLinkTarget: HTMLAnchorElement;
  declare readonly resumeLabelTarget: HTMLElement;

  private listeners?: AbortController;
  private resizeObserver?: ResizeObserver;
  private frame = 0;
  private links: HTMLAnchorElement[] = [];
  private headings: HTMLElement[] = [];
  private place?: string;
  private finished = false;
  private placeKey = '';

  override connect(): void {
    this.listeners = new AbortController();
    this.place = undefined;
    this.finished = false;
    this.placeKey = `portfolio-reading:${location.pathname}`;
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
    this.restorePlace();
    const options = { passive: true, signal: this.listeners.signal };
    window.addEventListener('scroll', this.schedule, options);
    window.addEventListener('resize', this.schedule, options);
    window.addEventListener('pagehide', this.savePlace, options);
    document.addEventListener('turbo:before-cache', this.savePlace, options);
    document.addEventListener('visibilitychange', this.saveWhenHidden, options);
    this.resizeObserver = new ResizeObserver(this.schedule);
    this.resizeObserver.observe(this.element);
    this.schedule();
    void document.fonts.ready.then(() => {
      if (this.listeners && !this.listeners.signal.aborted) this.schedule();
    });
  }

  override disconnect(): void {
    this.savePlace();
    this.listeners?.abort();
    this.listeners = undefined;
    this.resizeObserver?.disconnect();
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  resume(): void {
    const heading = document.getElementById(
      decodeURIComponent(this.resumeLinkTarget.hash.slice(1)),
    );
    this.resumeTarget.hidden = true;
    if (!heading) return;
    const previousTabindex = heading.getAttribute('tabindex');
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
    heading.addEventListener(
      'blur',
      () => {
        if (previousTabindex === null) heading.removeAttribute('tabindex');
        else heading.setAttribute('tabindex', previousTabindex);
      },
      { once: true },
    );
  }

  private restorePlace(): void {
    if (!this.hasResumeTarget) return;
    this.resumeTarget.hidden = true;
    if (location.hash) return;
    try {
      const saved = localStorage.getItem(this.placeKey);
      if (!saved) return;
      const heading = this.headings.find((entry) => entry.id === saved);
      if (!heading || heading === this.headings[0]) {
        localStorage.removeItem(this.placeKey);
        return;
      }
      this.resumeLinkTarget.href = `#${encodeURIComponent(heading.id)}`;
      this.resumeLabelTarget.textContent = heading.textContent;
      this.resumeTarget.hidden = false;
    } catch {
      // Storage is optional; the article and its native contents still work.
    }
  }

  private readonly saveWhenHidden = (): void => {
    if (document.hidden) this.savePlace();
  };

  private readonly savePlace = (): void => {
    // Capture the final scroll even if navigation beats the queued frame.
    if (this.element.isConnected) this.update();
    if (!this.hasResumeTarget || !this.place) return;
    try {
      if (this.finished) localStorage.removeItem(this.placeKey);
      else localStorage.setItem(this.placeKey, this.place);
    } catch {
      // Private browsing and blocked storage must not interrupt reading.
    }
  };

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
    if (this.hasResumeTarget && current && current !== this.headings[0]) {
      this.place = current.id;
      const end = this.element.querySelector('.article-body')?.lastElementChild;
      this.finished =
        !!end && end.getBoundingClientRect().bottom <= innerHeight + 1;
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
