import { Controller } from '@hotwired/stimulus';
import {
  highlightedText,
  searchExcerpt,
  searchPages,
  searchTerms,
  type SearchPage,
} from '../search';

export default class extends Controller<HTMLElement> {
  static override targets = [
    'interface',
    'input',
    'status',
    'results',
    'browse',
    'error',
    'panel',
    'trigger',
    'fallback',
    'scroll',
  ];
  static override values = { index: String };

  declare readonly interfaceTarget: HTMLElement;
  declare readonly inputTarget: HTMLInputElement;
  declare readonly statusTarget: HTMLElement;
  declare readonly resultsTarget: HTMLOListElement;
  declare readonly browseTarget: HTMLElement;
  declare readonly errorTarget: HTMLElement;
  declare readonly indexValue: string;
  declare readonly panelTarget: HTMLElement;
  declare readonly triggerTargets: HTMLButtonElement[];
  declare readonly fallbackTarget: HTMLElement;
  declare readonly scrollTarget: HTMLElement;

  private timer = 0;
  private revision = 0;
  private motionRevision = 0;
  private request: AbortController | undefined;
  private index: Promise<SearchPage[]> | undefined;
  private invoker: HTMLElement | undefined;
  private readonly inertElements = new Set<HTMLElement>();
  private readonly reposition = () => this.position();

  override connect(): void {
    this.interfaceTarget.hidden = false;
    this.fallbackTarget.hidden = true;
    window.visualViewport?.addEventListener('resize', this.reposition);
    window.visualViewport?.addEventListener('scroll', this.reposition);
  }

  override disconnect(): void {
    this.beforeCache();
    window.visualViewport?.removeEventListener('resize', this.reposition);
    window.visualViewport?.removeEventListener('scroll', this.reposition);
  }

  beforeCache(): void {
    this.releaseBackground();
    this.inputTarget.defaultValue = this.inputTarget.value;
    this.panelTarget.dataset.motion = 'instant';
    this.motionRevision++;
    delete this.panelTarget.dataset.state;
    if (this.isOpen) this.panelTarget.hidePopover();
    window.clearTimeout(this.timer);
    this.revision++;
    this.request?.abort();
    this.request = undefined;
    this.index = undefined;
  }

  private get isOpen(): boolean {
    return this.panelTarget.matches(':popover-open');
  }

  open(event: Event): void {
    event.preventDefault();
    const trigger = event.currentTarget;
    if (!(trigger instanceof HTMLElement)) return;
    if (this.isOpen && this.panelTarget.dataset.state !== 'closing') {
      this.close(event);
      return;
    }
    this.motionRevision++;
    delete this.panelTarget.dataset.state;
    const menu = trigger.closest('details');
    this.invoker = menu?.querySelector<HTMLElement>('summary') ?? trigger;
    this.panelTarget.dataset.motion =
      event instanceof MouseEvent && event.detail === 0 ? 'instant' : 'default';
    if (menu) menu.open = false;
    this.placePanel();
    if (!this.isOpen) this.panelTarget.showPopover();
    this.lockBackground();
    for (const button of this.triggerTargets)
      button.setAttribute('aria-expanded', 'true');
    this.inputTarget.focus({ preventScroll: true });
  }

  toggle(event: ToggleEvent): void {
    const open = event.newState === 'open';
    for (const trigger of this.triggerTargets)
      trigger.setAttribute('aria-expanded', String(open));
    if (open) {
      if (this.panelTarget.dataset.state === 'closing') return;
      this.lockBackground();
      this.position();
      this.inputTarget.focus({ preventScroll: true });
      if (this.inputTarget.value.trim()) void this.run();
    }
  }

  position(): void {
    if (!this.isOpen) return;
    this.placePanel();
  }

  private placePanel(): void {
    const viewport = window.visualViewport;
    const height = viewport?.height ?? innerHeight;
    const width = viewport?.width ?? innerWidth;
    const top = viewport?.offsetTop ?? 0;
    const left = viewport?.offsetLeft ?? 0;
    const inset = Math.min(96, Math.max(24, height * 0.12));
    this.panelTarget.style.top = `${top + inset}px`;
    this.panelTarget.style.left = `${left + 16}px`;
    this.panelTarget.style.right = `${innerWidth - left - width + 16}px`;
    this.panelTarget.style.setProperty(
      '--search-width',
      `${Math.max(0, width - 32)}px`,
    );
    this.panelTarget.style.setProperty(
      '--search-space',
      `${Math.max(0, height - inset - 16)}px`,
    );
  }

  close(event?: Event, restoreFocus = true): void {
    event?.preventDefault();
    if (!this.isOpen) return;
    if (
      event instanceof KeyboardEvent ||
      (event instanceof MouseEvent && event.detail === 0)
    )
      this.panelTarget.dataset.motion = 'instant';
    const revision = ++this.motionRevision;
    this.panelTarget.dataset.state = 'closing';
    this.releaseBackground();
    for (const trigger of this.triggerTargets)
      trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) this.invoker?.focus({ preventScroll: true });
    const animations = this.panelTarget.getAnimations();
    // Keep the native top layer until the exit finishes, including in Safari.
    void Promise.all(
      animations.map((animation) => animation.finished.catch(() => {})),
    ).then(() => {
      if (revision !== this.motionRevision || !this.isOpen) return;
      this.panelTarget.hidePopover();
      delete this.panelTarget.dataset.state;
    });
  }

  outside(event: PointerEvent): void {
    const target = event.target;
    if (
      !this.isOpen ||
      this.panelTarget.dataset.state === 'closing' ||
      !(target instanceof Node) ||
      this.panelTarget.contains(target) ||
      this.triggerTargets.some((trigger) => trigger.contains(target))
    )
      return;
    this.close(undefined, false);
  }

  containFocus(event: FocusEvent): void {
    if (
      event.target instanceof Node &&
      !this.panelTarget.contains(event.target) &&
      this.isOpen &&
      this.panelTarget.dataset.state !== 'closing'
    ) {
      this.inputTarget.focus({ preventScroll: true });
    }
  }

  private lockBackground(): void {
    this.panelTarget.setAttribute('aria-modal', 'true');
    // Leave the panel's ancestor path active while making every other branch inert.
    let branch: HTMLElement = this.panelTarget;
    while (branch.parentElement && branch !== document.body) {
      for (const sibling of branch.parentElement.children) {
        if (
          sibling instanceof HTMLElement &&
          sibling !== branch &&
          !sibling.inert
        ) {
          sibling.inert = true;
          this.inertElements.add(sibling);
        }
      }
      branch = branch.parentElement;
    }
  }

  private releaseBackground(): void {
    for (const element of this.inertElements) element.inert = false;
    this.inertElements.clear();
    this.panelTarget.removeAttribute('aria-modal');
  }

  private focusableElements(): HTMLElement[] {
    return Array.from(
      this.panelTarget.querySelectorAll<HTMLElement>(
        'a[href], button, input, select, textarea, [tabindex]',
      ),
    ).filter(
      (element) =>
        element.tabIndex >= 0 &&
        !element.matches(':disabled') &&
        !element.closest('[inert]') &&
        element.getClientRects().length > 0 &&
        getComputedStyle(element).visibility === 'visible',
    );
  }

  change(event: InputEvent): void {
    if (event.isComposing) return;
    window.clearTimeout(this.timer);
    this.revision++;
    if (!this.inputTarget.value.trim()) {
      void this.run();
      return;
    }
    this.timer = window.setTimeout(() => void this.run(), 150);
  }

  submit(event: SubmitEvent): void {
    event.preventDefault();
    window.clearTimeout(this.timer);
    void this.run();
  }

  nativeClear(): void {
    if (this.inputTarget.value) return;
    window.clearTimeout(this.timer);
    void this.run();
  }

  keydown(event: KeyboardEvent): void {
    if (!this.isOpen || this.panelTarget.dataset.state === 'closing') return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close(event);
    } else if (event.key === 'Tab' && !event.ctrlKey && !event.metaKey) {
      const elements = this.focusableElements();
      if (!elements.length) return;
      const current = elements.indexOf(document.activeElement as HTMLElement);
      const next =
        current < 0
          ? event.shiftKey
            ? elements.length - 1
            : 0
          : (current + (event.shiftKey ? -1 : 1) + elements.length) %
            elements.length;
      event.preventDefault();
      elements[next].focus();
    }
  }

  retry(): void {
    this.index = undefined;
    void this.run();
  }

  private loadIndex(): Promise<SearchPage[]> {
    if (this.index) return this.index;
    this.request = new AbortController();
    this.index = fetch(this.indexValue, { signal: this.request.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Search index unavailable');
        const pages: unknown = await response.json();
        if (
          !Array.isArray(pages) ||
          !pages.every(
            (page) =>
              typeof page.title === 'string' &&
              typeof page.body === 'string' &&
              typeof page.description === 'string' &&
              typeof page.date === 'string' &&
              ['Article', 'Case study', 'Home'].includes(page.kind) &&
              typeof page.url === 'string' &&
              /^\/(?!\/)/.test(page.url) &&
              Array.isArray(page.tags) &&
              page.tags.every(
                (tag: { title?: unknown; url?: unknown }) =>
                  typeof tag.title === 'string' &&
                  typeof tag.url === 'string' &&
                  /^\/(?!\/)/.test(tag.url),
              ),
          )
        )
          throw new Error('Invalid search index');
        return pages as SearchPage[];
      })
      .catch((error) => {
        this.index = undefined;
        throw error;
      });
    return this.index;
  }

  private async run(): Promise<void> {
    const revision = ++this.revision;
    const query = this.inputTarget.value.trim().slice(0, 200);
    const terms = searchTerms(query);
    this.errorTarget.hidden = true;
    this.browseTarget.hidden = Boolean(query);
    this.resultsTarget.replaceChildren();
    this.scrollTarget.scrollTop = 0;
    if (!terms.length) {
      this.statusTarget.textContent =
        'Search titles, topics, and page content.';
      return;
    }
    this.statusTarget.textContent = 'Searching…';
    try {
      const pages = await this.loadIndex();
      if (revision !== this.revision || !this.element.isConnected) return;
      const matches = searchPages(pages, terms);
      this.statusTarget.textContent = matches.length
        ? `${matches.length} ${matches.length === 1 ? 'result' : 'results'} for “${query}”.`
        : `No results for “${query}”. Try another word.`;
      const fragment = document.createDocumentFragment();
      for (const page of matches) fragment.append(this.result(page, terms));
      this.resultsTarget.append(fragment);
    } catch (error) {
      if (
        revision !== this.revision ||
        !this.element.isConnected ||
        (error instanceof DOMException && error.name === 'AbortError')
      )
        return;
      this.statusTarget.textContent = 'Search is unavailable right now.';
      this.errorTarget.hidden = false;
    }
  }

  private result(page: SearchPage, terms: string[]): HTMLLIElement {
    const item = document.createElement('li');
    item.className = 'search-result';
    const meta = document.createElement('p');
    meta.className = 'search-meta';
    meta.textContent = page.kind + (page.date ? ` · ${page.date}` : '');
    const heading = document.createElement('h3');
    const link = document.createElement('a');
    link.href = page.url;
    link.className = 'search-result-link';
    link.append(highlightedText(page.title, terms));
    heading.append(link);
    const excerpt = document.createElement('p');
    excerpt.className = 'search-excerpt';
    excerpt.append(highlightedText(searchExcerpt(page, terms), terms));
    item.append(heading, excerpt, meta);
    if (page.tags.length) {
      const tags = document.createElement('span');
      tags.className = 'search-topics';
      for (const tag of page.tags) {
        const link = document.createElement('a');
        link.href = tag.url;
        link.rel = 'tag';
        link.className = 'search-topic';
        link.append(highlightedText(tag.title, terms));
        tags.append(link);
      }
      meta.append(tags);
    }
    return item;
  }
}
