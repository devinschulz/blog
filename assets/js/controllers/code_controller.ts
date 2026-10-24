import { Controller } from '@hotwired/stimulus';

export default class extends Controller<HTMLElement> {
  static override targets = [
    'button',
    'label',
    'copyIcon',
    'checkIcon',
    'status',
  ];

  declare readonly buttonTarget: HTMLButtonElement;
  declare readonly labelTarget: HTMLElement;
  declare readonly copyIconTarget: SVGElement;
  declare readonly checkIconTarget: SVGElement;
  declare readonly statusTarget: HTMLElement;

  private resetTimer = 0;
  private operation = 0;

  override connect(): void {
    this.reset();
    this.buttonTarget.hidden = !navigator.clipboard?.writeText;
  }

  override disconnect(): void {
    this.clear();
  }

  clear(): void {
    this.operation++;
    window.clearTimeout(this.resetTimer);
    this.reset();
  }

  scroll(event: KeyboardEvent): void {
    const pre = event.target;
    if (
      !(pre instanceof HTMLPreElement) ||
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')
    )
      return;
    const maximum = pre.scrollWidth - pre.clientWidth;
    if (maximum <= 0) return;
    const next = Math.max(
      0,
      Math.min(
        maximum,
        pre.scrollLeft + (event.key === 'ArrowRight' ? 40 : -40),
      ),
    );
    if (next === pre.scrollLeft) return;
    event.preventDefault();
    pre.scrollLeft = next;
  }

  async copy(): Promise<void> {
    const code = this.element.querySelector('pre code')?.textContent;
    if (code === undefined || code === null || this.buttonTarget.disabled)
      return;
    const operation = ++this.operation;
    window.clearTimeout(this.resetTimer);
    this.reset();
    this.buttonTarget.disabled = true;
    this.labelTarget.textContent = 'Copy…';

    try {
      await navigator.clipboard.writeText(code);
      if (!this.element.isConnected || operation !== this.operation) return;
      this.labelTarget.textContent = 'Copied';
      this.copyIconTarget.setAttribute('hidden', '');
      this.checkIconTarget.removeAttribute('hidden');
      this.statusTarget.textContent = 'Code copied to clipboard.';
      this.resetTimer = window.setTimeout(() => this.reset(), 2000);
    } catch {
      if (!this.element.isConnected || operation !== this.operation) return;
      this.labelTarget.textContent = 'Retry';
      this.statusTarget.classList.remove('sr-only');
      this.statusTarget.textContent =
        'Couldn’t copy. Select the code and use your device’s Copy command, or try again.';
    } finally {
      if (this.element.isConnected && operation === this.operation) {
        this.buttonTarget.disabled = false;
      }
    }
  }

  private reset(): void {
    this.buttonTarget.disabled = false;
    this.labelTarget.textContent = 'Copy';
    this.copyIconTarget.removeAttribute('hidden');
    this.checkIconTarget.setAttribute('hidden', '');
    this.statusTarget.classList.add('sr-only');
    this.statusTarget.textContent = '';
  }
}
