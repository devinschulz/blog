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
    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => {
        const color = dark ? meta.dataset.dark : meta.dataset.light;
        if (color) meta.content = color;
      });
    this.element
      .querySelectorAll<HTMLElement>('[data-theme-icon]')
      .forEach((icon) => {
        icon.hidden = icon.dataset.themeIcon !== (dark ? 'light' : 'dark');
      });
    this.element.title = `Switch to ${dark ? 'light' : 'dark'} theme`;
    this.element.setAttribute(
      'aria-label',
      `Switch to ${dark ? 'light' : 'dark'} theme`,
    );
  }
}
