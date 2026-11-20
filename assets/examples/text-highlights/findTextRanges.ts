/** Literal, case-sensitive matches within one explicitly chosen text container. */
export function findTextRanges(root: Element, query: string): Range[] {
  if (!query) return [];

  const nodes: Array<{ node: Text; start: number; end: number }> = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let source = '';
  let current: Node | null;

  while ((current = walker.nextNode())) {
    const node = current as Text;
    const start = source.length;
    source += node.data;
    nodes.push({ node, start, end: source.length });
  }

  const ranges: Range[] = [];
  let from = 0;
  while (from <= source.length - query.length) {
    const start = source.indexOf(query, from);
    if (start === -1) break;
    const end = start + query.length;
    const first = nodes.find(
      (entry) => entry.start <= start && start < entry.end,
    )!;
    const last = nodes.find((entry) => entry.start < end && end <= entry.end)!;

    const range = new Range();
    range.setStart(first.node, start - first.start);
    range.setEnd(last.node, end - last.start);
    ranges.push(range);
    from = end;
  }

  return ranges;
}
