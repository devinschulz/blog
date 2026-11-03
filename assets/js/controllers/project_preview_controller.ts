import { Controller } from '@hotwired/stimulus';

export default class extends Controller<HTMLElement> {
  static override targets = [
    'primary',
    'detail',
    'button',
    'label',
    'count',
    'status',
  ];

  declare readonly primaryTarget: HTMLImageElement;
  declare readonly detailTarget: HTMLImageElement;
  declare readonly buttonTarget: HTMLButtonElement;
  declare readonly labelTarget: HTMLElement;
  declare readonly countTarget: HTMLElement;
  declare readonly statusTarget: HTMLElement;

  private selected = false;
  private pending?: object;

  override connect(): void {
    this.reset();
    this.buttonTarget.hidden = false;
  }

  override disconnect(): void {
    this.reset();
    this.buttonTarget.hidden = true;
  }

  async toggle(): Promise<void> {
    if (this.pending) return;
    const attempt = {};
    this.pending = attempt;
    this.buttonTarget.setAttribute('aria-busy', 'true');
    this.labelTarget.textContent = 'Loading view…';
    this.detailTarget.loading = 'eager';
    try {
      await Promise.all([
        this.primaryTarget.decode(),
        this.detailTarget.decode(),
      ]);
      if (this.pending !== attempt) return;
      this.selected = !this.selected;
      this.primaryTarget.hidden = this.selected;
      this.detailTarget.hidden = !this.selected;
      this.buttonTarget.setAttribute('aria-pressed', String(this.selected));
      this.countTarget.textContent = this.selected ? '02/02' : '01/02';
      const name = this.element.querySelector('h3')!.textContent;
      const image = this.selected ? this.detailTarget : this.primaryTarget;
      this.statusTarget.textContent = `${name}: view ${this.selected ? '2' : '1'} of 2. ${image.alt}`;
    } catch {
      if (this.pending === attempt)
        this.statusTarget.textContent =
          'Couldn’t load this view. Try again, or open the project to read the case study.';
    } finally {
      if (this.pending === attempt) {
        this.pending = undefined;
        this.buttonTarget.removeAttribute('aria-busy');
        this.labelTarget.textContent = this.selected
          ? 'Show first view'
          : 'Show other view';
      }
    }
  }

  reset(): void {
    this.pending = undefined;
    this.selected = false;
    this.primaryTarget.hidden = false;
    this.detailTarget.hidden = true;
    this.buttonTarget.setAttribute('aria-pressed', 'false');
    this.buttonTarget.removeAttribute('aria-busy');
    this.labelTarget.textContent = 'Show other view';
    this.countTarget.textContent = '01/02';
    this.statusTarget.textContent = '';
  }
}
