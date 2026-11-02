import { Controller } from '@hotwired/stimulus';

// A brief spring impulse changes the SVG geometry, not the icon's position.
// Inspired by https://www.joshwcomeau.com/animation/squash-and-stretch/
export default class extends Controller<HTMLElement> {
  static override targets = ['shaft', 'tip'];
  declare readonly shaftTarget: SVGPathElement;
  declare readonly tipTarget: SVGPathElement;

  private frame = 0;
  private amount = 0;
  private velocity = 0;
  private releaseAt = 0;
  private previous = 0;
  private readonly reduced = matchMedia('(prefers-reduced-motion: reduce)');

  override connect(): void {
    this.reduced.addEventListener('change', this.reset);
  }

  override disconnect(): void {
    this.reduced.removeEventListener('change', this.reset);
    this.reset();
  }

  play(event: Event): void {
    if (this.reduced.matches) return;
    if (
      event instanceof PointerEvent &&
      (event.pointerType === 'touch' ||
        !matchMedia('(hover: hover) and (pointer: fine)').matches)
    )
      return;
    this.releaseAt = performance.now() + 150;
    if (!this.frame) {
      this.previous = performance.now();
      this.frame = requestAnimationFrame(this.tick);
    }
  }

  private readonly tick = (now: number): void => {
    // Small integration steps keep the spring stable across refresh rates.
    let elapsed = Math.min((now - this.previous) / 1000, 0.064);
    this.previous = now;
    const target = now < this.releaseAt ? 1 : 0;
    while (elapsed > 0) {
      const step = Math.min(elapsed, 1 / 240);
      this.velocity +=
        (300 * (target - this.amount) - 12 * this.velocity) * step;
      this.amount += this.velocity * step;
      elapsed -= step;
    }
    this.draw();
    if (
      target === 0 &&
      Math.abs(this.amount) < 0.001 &&
      Math.abs(this.velocity) < 0.01
    ) {
      this.reset();
      return;
    }
    this.frame = requestAnimationFrame(this.tick);
  };

  private draw(): void {
    const end = 19 + 3 * this.amount;
    const halfHeight = 7 - 2 * this.amount;
    this.shaftTarget.setAttribute('d', `M5 12H${end}`);
    this.tipTarget.setAttribute(
      'd',
      `M${end - 7} ${12 - halfHeight}L${end} 12L${end - 7} ${12 + halfHeight}`,
    );
  }

  readonly reset = (): void => {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.amount = 0;
    this.velocity = 0;
    this.draw();
  };
}
