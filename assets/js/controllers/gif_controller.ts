import { Controller } from '@hotwired/stimulus';

// GIFs are opt-in: a static WebP until someone asks for motion, and never
// playing when the system asks for less of it.
export default class extends Controller<HTMLElement> {
  static override targets = ['image', 'button'];

  declare readonly imageTarget: HTMLImageElement;
  declare readonly buttonTarget: HTMLButtonElement;

  private readonly reducedMotion = matchMedia(
    '(prefers-reduced-motion: reduce)',
  );
  private listeners?: AbortController;

  override connect(): void {
    this.listeners = new AbortController();
    this.reducedMotion.addEventListener('change', () => this.sync(), {
      signal: this.listeners.signal,
    });
    this.sync();
  }

  override disconnect(): void {
    this.listeners?.abort();
    this.listeners = undefined;
  }

  toggle(): void {
    if (this.reducedMotion.matches) return;
    if (this.element.dataset.playing === 'true') return this.stop();
    const animated = this.imageTarget.dataset.animatedSrc;
    if (animated) this.imageTarget.src = animated;
    this.element.dataset.playing = 'true';
    this.buttonTarget.textContent = 'Stop animation';
  }

  stop(): void {
    const still = this.imageTarget.dataset.staticSrc;
    if (still) this.imageTarget.src = still;
    this.buttonTarget.textContent = 'Play animation';
    this.element.dataset.playing = 'false';
  }

  /** A hidden tab is not watching; stop burning frames on it. */
  stopWhenHidden(): void {
    if (document.hidden) this.stop();
  }

  private sync(): void {
    const paused = this.reducedMotion.matches;
    this.buttonTarget.hidden = false;
    this.buttonTarget.disabled = paused;
    if (paused) {
      this.stop();
      this.buttonTarget.textContent = 'Animation paused by motion preference';
      return;
    }
    this.buttonTarget.textContent =
      this.element.dataset.playing === 'true'
        ? 'Stop animation'
        : 'Play animation';
  }
}
