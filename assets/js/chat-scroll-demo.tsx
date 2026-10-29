import * as React from 'react';
import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import ChatScrollDemo from '../examples/chat-scroll/ChatScrollDemo';

const roots = new Map<HTMLElement, Root>();

function mount() {
  document
    .querySelectorAll<HTMLElement>('[data-chat-scroll-root]')
    .forEach((host) => {
      if (roots.has(host)) return;
      const root = createRoot(host);
      roots.set(host, root);
      root.render(
        <StrictMode>
          <ChatScrollDemo />
        </StrictMode>,
      );
    });
}

function unmount() {
  roots.forEach((root) => root.unmount());
  roots.clear();
}

document.addEventListener('turbo:before-cache', unmount);
document.addEventListener('turbo:before-render', unmount);
document.addEventListener('turbo:load', mount);
mount();
