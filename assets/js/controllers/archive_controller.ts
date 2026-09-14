import { Controller } from '@hotwired/stimulus';

// Filters the archive in place and says out loud how many posts are left.
export default class extends Controller<HTMLElement> {
  static override targets = ['filters', 'filter', 'post', 'status', 'empty'];

  declare readonly filtersTarget: HTMLElement;
  declare readonly hasFiltersTarget: boolean;
  declare readonly filterTargets: HTMLButtonElement[];
  declare readonly postTargets: HTMLElement[];
  declare readonly statusTarget: HTMLElement;
  declare readonly hasStatusTarget: boolean;
  declare readonly emptyTarget: HTMLElement;
  declare readonly hasEmptyTarget: boolean;

  override connect(): void {
    // Filtering needs JavaScript, so the controls only appear once it runs.
    if (this.hasFiltersTarget) this.filtersTarget.hidden = false;
  }

  apply(event: Event): void {
    const filter = event.currentTarget;
    if (!(filter instanceof HTMLElement)) return;
    const topic = filter.dataset.filter ?? '';
    const visible = this.postTargets.filter((post) => {
      const tags = (post.dataset.topics || '').split('|');
      const matches =
        topic === 'all' ||
        (topic === 'web'
          ? !tags.includes('react') && !tags.includes('javascript')
          : tags.includes(topic));
      post.hidden = !matches;
      return matches;
    });
    this.filterTargets.forEach((button) =>
      button.setAttribute('aria-pressed', String(button === filter)),
    );
    if (this.hasEmptyTarget) this.emptyTarget.hidden = visible.length > 0;
    if (this.hasStatusTarget) {
      const topicName =
        topic === 'all' ? '' : `${(filter.textContent ?? '').trim()} `;
      this.statusTarget.textContent = `Showing ${visible.length} ${topicName}${visible.length === 1 ? 'article' : 'articles'}.`;
    }
  }
}
