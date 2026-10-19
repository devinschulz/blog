import { Controller } from '@hotwired/stimulus';

export default class extends Controller<HTMLButtonElement> {
  override connect(): void {
    this.element.hidden = false;
    this.sync();
  }

  toggle(): void {
    const dark = document.documentElement.dataset.theme !== 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    try {
      localStorage.setItem('portfolio-theme', dark ? 'dark' : 'light');
    } catch {
      /* The control also works without storage. */
    }
    this.sync();
  }

  private sync(): void {
    const dark = document.documentElement.dataset.theme === 'dark';
    this.element.textContent = dark ? 'Light' : 'Dark';
    this.element.setAttribute(
      'aria-label',
      `Switch to ${dark ? 'light' : 'dark'} theme`,
    );
  }
}
