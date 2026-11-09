import { Controller } from '@hotwired/stimulus';

export default class extends Controller<HTMLElement> {
  private frame = 0;

  override connect(): void {
    this.update();
  }

  override disconnect(): void {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  update(): void {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.element.toggleAttribute(
        'data-docked',
        window.scrollY > 0 && this.element.getBoundingClientRect().top <= 0,
      );
    });
  }
}
