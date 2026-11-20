import { findTextRanges } from '../examples/text-highlights/findTextRanges';

const active = new Map<HTMLElement, () => void>();

function mount(): void {
  for (const root of document.querySelectorAll<HTMLElement>(
    '[data-text-highlights-demo]',
  )) {
    if (active.has(root)) continue;
    const fallback = root.querySelector<HTMLElement>(
      '[data-highlight-fallback]',
    )!;
    if (!('highlights' in CSS) || typeof Highlight === 'undefined') {
      fallback.textContent =
        'This browser does not support custom text highlights. The sample text and implementation below are still available.';
      continue;
    }

    const original = root.innerHTML;
    const events = new AbortController();
    const form = root.querySelector<HTMLFormElement>('form')!;
    const query = root.querySelector<HTMLInputElement>(
      '[data-highlight-query]',
    )!;
    const annotations = root.querySelector<HTMLInputElement>(
      '[data-highlight-annotations]',
    )!;
    const width = root.querySelector<HTMLInputElement>(
      '[data-highlight-width]',
    )!;
    const passage = root.querySelector<HTMLElement>(
      '[data-highlight-passage]',
    )!;
    const paragraphs = [...passage.querySelectorAll('p')];
    const status = root.querySelector<HTMLElement>('[data-highlight-status]')!;
    const results = root.querySelector<HTMLElement>(
      '[data-highlight-results]',
    )!;
    const integrity = root.querySelector<HTMLElement>(
      '[data-highlight-integrity]',
    )!;
    const markup = passage.innerHTML;

    const matches = new Highlight();
    const notes = new Highlight();
    matches.priority = 1;
    notes.priority = 0;
    CSS.highlights.set('blog-text-search', matches);
    CSS.highlights.set('blog-text-notes', notes);

    const update = (): void => {
      matches.clear();
      notes.clear();
      results.replaceChildren();
      const ranges = paragraphs.flatMap((paragraph) =>
        findTextRanges(paragraph, query.value),
      );
      for (const range of ranges) {
        matches.add(range);
        const item = document.createElement('li');
        const paragraph = paragraphs.find((entry) =>
          entry.contains(range.startContainer),
        )!;
        item.textContent = `“${range.toString()}” in: ${paragraph.textContent}`;
        results.append(item);
      }
      if (annotations.checked) {
        for (const range of findTextRanges(
          paragraphs[0],
          'bold text, include a link',
        ))
          notes.add(range);
        for (const range of findTextRanges(
          paragraphs[1],
          'annotations can cover the same text',
        ))
          notes.add(range);
      }
      status.textContent = `${ranges.length} ${ranges.length === 1 ? 'match' : 'matches'}. Search results are yellow; annotations are blue and underlined. ${notes.size} annotations shown.`;
      integrity.textContent =
        passage.innerHTML === markup
          ? 'Markup unchanged. No highlight elements were added.'
          : 'The sample markup has changed.';
    };

    form.addEventListener('submit', (event) => event.preventDefault(), {
      signal: events.signal,
    });
    query.addEventListener('input', update, { signal: events.signal });
    annotations.addEventListener('change', update, { signal: events.signal });
    width.addEventListener(
      'input',
      () => {
        passage.style.width = `${width.value}%`;
      },
      { signal: events.signal },
    );
    fallback.hidden = true;
    form.hidden = false;
    update();

    active.set(root, () => {
      events.abort();
      if (CSS.highlights.get('blog-text-search') === matches)
        CSS.highlights.delete('blog-text-search');
      if (CSS.highlights.get('blog-text-notes') === notes)
        CSS.highlights.delete('blog-text-notes');
      root.innerHTML = original;
    });
  }
}

document.addEventListener('turbo:before-cache', () => {
  for (const cleanup of active.values()) cleanup();
  active.clear();
});
document.addEventListener('turbo:render', mount);
document.addEventListener('turbo:load', mount);
mount();
