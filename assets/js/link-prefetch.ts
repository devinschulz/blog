// Focusing a link is a strong signal that the reader is about to follow it, so
// the destination is pulled into the HTTP cache before the click lands. This is
// a hint, not a guarantee: browsers are free to ignore it, and every page here
// is static, so the worst case is one request that is never used.

/** Cap the work. Tabbing through the archive should not fetch the whole site. */
const LIMIT = 10;
const prefetched = new Set<string>();

interface DataConnection {
  saveData?: boolean;
  effectiveType?: string;
}

const connection = (navigator as Navigator & { connection?: DataConnection })
  .connection;

/** Honour a metered or slow connection: speculative requests are not free. */
function connectionAllows(): boolean {
  if (!connection) return true;
  if (connection.saveData) return false;
  return !/(^|-)2g$/.test(connection.effectiveType ?? '');
}

/** The destination as a cache key: same document, minus any fragment. */
function destination(link: HTMLAnchorElement): string | null {
  if (link.origin !== location.origin) return null;
  if (link.hasAttribute('download')) return null;
  if (link.target && link.target !== '_self') return null;
  if (!/^https?:$/.test(link.protocol)) return null;
  const url = new URL(link.href);
  url.hash = '';
  const here = new URL(location.href);
  here.hash = '';
  // A link to the page already open, or to a fragment of it, needs nothing.
  return url.href === here.href ? null : url.href;
}

function prefetch(link: HTMLAnchorElement): void {
  if (prefetched.size >= LIMIT || !connectionAllows()) return;
  const href = destination(link);
  if (!href || prefetched.has(href)) return;
  prefetched.add(href);
  const hint = document.createElement('link');
  hint.rel = 'prefetch';
  hint.as = 'document';
  hint.href = href;
  document.head.append(hint);
}

// Delegated, so links rendered or revealed after load are covered too.
document.addEventListener('focusin', (event) => {
  const target = event.target;
  if (target instanceof HTMLAnchorElement) prefetch(target);
});
