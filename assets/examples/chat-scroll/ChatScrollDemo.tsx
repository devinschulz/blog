import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useChatScroll } from './useChatScroll';

type Message = { id: string; author: 'You' | 'Assistant'; text: string };

const initialMessages: Message[] = [
  {
    id: 'question-1',
    author: 'You',
    text: 'Why does a chat window sometimes pull me to the bottom while I’m reading an earlier message?',
  },
  {
    id: 'answer-1',
    author: 'Assistant',
    text: 'Often, every new chunk triggers an unconditional scroll. That works while you’re following a reply, but it also overrides your position after you scroll up. The interface needs to remember whether you still want to follow the latest message.',
  },
  {
    id: 'question-2',
    author: 'You',
    text: 'What should happen when I scroll up?',
  },
  {
    id: 'answer-2',
    author: 'Assistant',
    text: 'The response can keep arriving below your viewport. Your reading position should stay where you left it, with a Jump to latest button available when you’re ready to return. Scrolling all the way back down should resume following too.',
  },
  {
    id: 'question-3',
    author: 'You',
    text: 'And when I load the previous page of messages?',
  },
  {
    id: 'answer-3',
    author: 'Assistant',
    text: 'Keep an existing message in the same place on screen. Adding history above it changes its position in the document, so the scroll offset needs to compensate. Try streaming a reply, scroll up, and load older messages while that reply is still arriving.',
  },
];

const response = `The first thing I’d separate is the stream from the decision to follow it. Receiving another chunk should update the message text, but it should only move the viewport if the reader is still following the latest response.

Try scrolling up while this reply is arriving. The text will continue to grow below you. Reading an earlier message doesn’t cancel the response, and it shouldn’t require you to keep fighting a scroll animation either.

The Jump to latest button is an explicit way to return. In this example, it moves directly to the bottom and turns following back on. You can also scroll back to the bottom yourself. Keeping the button outside the scrollable region means it stays available even when the conversation is long.

Loading older messages is a different operation. Before the list changes, remember a visible message and its distance from the top of the viewport. After the older messages are inserted, find that same message and correct the difference. Stable message keys let React retain the element we’re measuring.

That correction should use the visible message rather than the total change in the conversation’s height. A streaming reply may have grown at the bottom during the same update. Its extra height doesn’t belong in the adjustment for messages added above you.

The same anchor can help when an earlier message changes height. This small example observes the message list and the viewport so it can respond to text wrapping and resizing. A production chat with images should reserve their dimensions, and a virtualized conversation needs the virtualizer’s own anchoring support.

For now, scroll around, load another page of history, and come back whenever you’re ready. This response will wait at the bottom.`;
const chunks = response.match(/\S+\s*/g) ?? [];

function olderMessages(page: number): Message[] {
  return [
    {
      id: `history-${page}-question`,
      author: 'You',
      text: `Earlier conversation, page ${page}: how should I check that loading history preserves my place?`,
    },
    {
      id: `history-${page}-answer`,
      author: 'Assistant',
      text: 'Pick a message that is partly visible at the top of the conversation. Load an earlier page, then check that the same line is still in the same place. Repeat while a response streams below it. The added text at the bottom should not affect the history correction.',
    },
    {
      id: `history-${page}-followup`,
      author: 'You',
      text: 'I’ll also try scrolling while the history request is pending. The viewport should preserve the position I reach before the new messages arrive.',
    },
  ];
}

function Conversation() {
  const [messages, setMessages] = useState(initialMessages);
  const [streaming, setStreaming] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const [notice, setNotice] = useState(
    'Ready. All messages in this demo are simulated.',
  );
  const activeId = useRef('');
  const nextChunk = useRef(0);
  const historyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyPending = useRef(false);
  const nextId = useRef(0);
  const scroll = useChatScroll();

  useEffect(() => {
    if (!streaming) return;
    const timer = setInterval(() => {
      const text = chunks
        .slice(nextChunk.current, nextChunk.current + 3)
        .join('');
      nextChunk.current += 3;
      setMessages((current) =>
        current.map((message) =>
          message.id === activeId.current
            ? { ...message, text: message.text + text }
            : message,
        ),
      );
      if (nextChunk.current >= chunks.length) {
        clearInterval(timer);
        setStreaming(false);
        setNotice('Response complete. You can stream another reply.');
      }
    }, 90);
    return () => clearInterval(timer);
  }, [streaming]);

  useEffect(
    () => () => {
      if (historyTimer.current !== null) clearTimeout(historyTimer.current);
    },
    [],
  );

  function toggleStream() {
    if (streaming) {
      setStreaming(false);
      setNotice('Response stopped. You can stream another reply.');
      return;
    }
    activeId.current = `stream-${++nextId.current}`;
    nextChunk.current = 0;
    setMessages((current) => [
      ...current,
      {
        id: `${activeId.current}-question`,
        author: 'You',
        text: 'Show me how the viewport should behave while a reply is streaming.',
      },
      { id: activeId.current, author: 'Assistant', text: '' },
    ]);
    setStreaming(true);
    setNotice('Streaming a simulated response. Scroll up to pause following.');
  }

  function loadOlder() {
    if (historyPending.current || historyPage >= 3) return;
    historyPending.current = true;
    setLoadingHistory(true);
    const page = historyPage + 1;
    historyTimer.current = setTimeout(() => {
      setMessages((current) => [...olderMessages(page), ...current]);
      setHistoryPage(page);
      setLoadingHistory(false);
      historyPending.current = false;
      setNotice(
        `Loaded earlier page ${page} of 3. Your reading position was preserved.`,
      );
    }, 650);
  }

  return (
    <div className="chat-scroll-example">
      <div className="chat-scroll-toolbar">
        <button
          type="button"
          className="chat-scroll-primary"
          onClick={toggleStream}
        >
          {streaming ? 'Stop streaming' : 'Stream a reply'}
        </button>
        <button
          type="button"
          onClick={loadOlder}
          disabled={loadingHistory || historyPage >= 3}
        >
          {loadingHistory
            ? 'Loading older messages…'
            : historyPage >= 3
              ? 'All history loaded'
              : 'Load older messages'}
        </button>
      </div>
      <p className="chat-scroll-notice" role="status">
        {notice}
      </p>
      <div
        className="chat-scroll-viewport"
        ref={scroll.viewportRef}
        {...scroll.viewportProps}
        role="region"
        aria-label="Demo conversation"
        aria-describedby="chat-scroll-help"
        tabIndex={0}
      >
        <ol className="chat-scroll-messages" ref={scroll.contentRef}>
          {messages.map((message) => (
            <li
              key={message.id}
              data-message-id={message.id}
              className={`chat-scroll-message chat-scroll-${message.author.toLowerCase()}`}
            >
              <p className="chat-scroll-author">{message.author}</p>
              <p className="chat-scroll-text">
                {message.text || 'Waiting for the first chunk…'}
              </p>
            </li>
          ))}
        </ol>
      </div>
      <div className="chat-scroll-footer">
        <p role="status" className="chat-scroll-mode">
          {scroll.following ? 'Following latest' : 'Reading earlier messages'}
        </p>
        <button type="button" onClick={scroll.jumpToLatest}>
          Jump to latest
        </button>
      </div>
    </div>
  );
}

export default function ChatScrollDemo() {
  const [session, setSession] = useState(0);
  return (
    <div className="chat-scroll-demo">
      <p id="chat-scroll-help" className="chat-scroll-help">
        Stream a reply, then scroll up inside the conversation. Load older
        messages while the reply continues, or use Jump to latest to follow it
        again. Focus the conversation to scroll with the keyboard.
      </p>
      <Conversation key={session} />
      <button
        type="button"
        className="chat-scroll-reset"
        onClick={() => setSession((value) => value + 1)}
      >
        Reset demo
      </button>
    </div>
  );
}
