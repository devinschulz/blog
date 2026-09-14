import { Controller } from '@hotwired/stimulus';

// The mobile navigation is a <details>. Escape and an outside press close it;
// following a link on the current page hands focus to the section it names.
export default class extends Controller<HTMLDetailsElement> {
  static override targets = ['summary'];

  declare readonly summaryTarget: HTMLElement;
  declare readonly hasSummaryTarget: boolean;

  closeOnEscape(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !this.element.open) return;
    this.element.open = false;
    if (this.hasSummaryTarget) this.summaryTarget.focus();
  }

  closeOnOutsidePress(event: Event): void {
    const target = event.target;
    if (!this.element.open) return;
    if (target instanceof Node && this.element.contains(target)) return;
    this.element.open = false;
  }

  follow(event: Event): void {
    this.element.open = false;
    const link = event.currentTarget;
    if (!(link instanceof HTMLAnchorElement)) return;
    const destination = new URL(link.href);
    if (destination.pathname !== location.pathname || !destination.hash) return;
    const section = document.getElementById(destination.hash.slice(1));
    if (!section) return;
    // These links carry a path as well as a fragment, so Turbo treats one
    // aimed at the current page as a visit: it re-renders the body and drops
    // the focus set below. Handling it here keeps Turbo for the cross-page
    // case and leaves the keyboard route into each section intact.
    event.preventDefault();
    location.hash = destination.hash;
    section.setAttribute('tabindex', '-1');
    section.focus({ preventScroll: true });
    section.addEventListener(
      'blur',
      () => section.removeAttribute('tabindex'),
      { once: true },
    );
  }
}
