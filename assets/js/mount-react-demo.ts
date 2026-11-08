import { createRoot, type Root } from 'react-dom/client';

// A cached Turbo page must retain useful content until its demo mounts again.
export function mountReactDemo(
  selector: string,
  render: (root: Root) => void,
): void {
  const roots = new Map<HTMLElement, Root>();
  const fallbacks = new WeakMap<HTMLElement, Node[]>();

  const mount = () => {
    for (const host of document.querySelectorAll<HTMLElement>(selector)) {
      if (roots.has(host)) continue;
      if (!fallbacks.has(host)) {
        fallbacks.set(
          host,
          Array.from(host.childNodes, (node) => node.cloneNode(true)),
        );
      }
      const root = createRoot(host);
      roots.set(host, root);
      render(root);
    }
  };

  const unmount = () => {
    for (const [host, root] of roots) {
      root.unmount();
      host.replaceChildren(
        ...fallbacks.get(host)!.map((node) => node.cloneNode(true)),
      );
    }
    roots.clear();
  };

  document.addEventListener('turbo:before-cache', unmount);
  document.addEventListener('turbo:before-render', unmount);
  document.addEventListener('turbo:render', mount);
  document.addEventListener('turbo:load', mount);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
}
