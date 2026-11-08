import * as React from 'react';
import { StrictMode } from 'react';
import { mountReactDemo } from './mount-react-demo';
import ChatScrollDemo from '../examples/chat-scroll/ChatScrollDemo';

mountReactDemo('[data-chat-scroll-root]', (root) => {
  root.render(
    <StrictMode>
      <ChatScrollDemo />
    </StrictMode>,
  );
});
