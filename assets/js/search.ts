export type SearchPage = {
  title: string;
  url: string;
  kind: 'Article' | 'Case study' | 'Home';
  description: string;
  body: string;
  date: string;
  tags: { title: string; url: string }[];
};

export function searchTerms(query: string): string[] {
  return [...new Set(query.trim().toLowerCase().split(/\s+/).filter(Boolean))];
}

export function matchPattern(terms: string[]): RegExp {
  const literal = [...terms]
    .sort((a, b) => b.length - a.length)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(literal.join('|'), 'giu');
}

export function searchPages(
  pages: SearchPage[],
  terms: string[],
): SearchPage[] {
  if (!terms.length) return [];
  return pages
    .map((page, order) => {
      const title = page.title.toLowerCase();
      const tags = page.tags.map((tag) => tag.title.toLowerCase()).join(' ');
      const description = page.description.toLowerCase();
      const body = page.body.toLowerCase();
      const all = [title, tags, description, body].join('\n');
      if (!terms.every((term) => all.includes(term)))
        return { page, order, score: 0 };
      const score = terms.reduce(
        (total, term) =>
          total +
          (title.includes(term) ? 40 : 0) +
          (tags.includes(term) ? 20 : 0) +
          (description.includes(term) ? 10 : 0) +
          (body.includes(term) ? 2 : 0),
        1,
      );
      return { page, order, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map((result) => result.page);
}

export function searchExcerpt(page: SearchPage, terms: string[]): string {
  const text = page.body;
  const first = terms.length ? matchPattern(terms).exec(text) : null;
  if (!first) return page.description || text.slice(0, 240);
  let start = Math.max(0, first.index - 70);
  if (start > 0) {
    const boundary = text.indexOf(' ', start);
    if (boundary >= 0 && boundary < first.index) start = boundary + 1;
  }
  let end = Math.min(text.length, start + 260);
  if (end < text.length) {
    const boundary = text.lastIndexOf(' ', end);
    if (boundary > first.index + first[0].length) end = boundary;
  }
  return (
    (start > 0 ? '…' : '') +
    text.slice(start, end).trim() +
    (end < text.length ? '…' : '')
  );
}

export function highlightedText(
  text: string,
  terms: string[],
): DocumentFragment {
  const fragment = document.createDocumentFragment();
  if (!terms.length) {
    fragment.append(document.createTextNode(text));
    return fragment;
  }
  let cursor = 0;
  for (const match of text.matchAll(matchPattern(terms))) {
    fragment.append(document.createTextNode(text.slice(cursor, match.index)));
    const mark = document.createElement('mark');
    mark.textContent = match[0];
    fragment.append(mark);
    cursor = match.index + match[0].length;
  }
  fragment.append(document.createTextNode(text.slice(cursor)));
  return fragment;
}
