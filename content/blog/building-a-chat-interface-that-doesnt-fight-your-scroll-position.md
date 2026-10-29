---
title: Building a Chat Interface That Doesn't Fight Your Scroll Position
date: 2026-10-29
tags: [React, Frontend, UX]
description: A React implementation for following streaming replies, pausing when someone scrolls up, and keeping their place when older messages load. Includes a working demo.
---

A chat interface that scrolls to the bottom on every update makes it difficult to read anything except the latest response. Scroll up to check an earlier message and the next chunk pulls you straight back down.

I mentioned this problem in [my post about the decisions around frontend code](/blog/the-hardest-part-of-frontend-development-isnt-writing-code/). It's a good example of a small interaction that needs more thought than its first implementation suggests.

I'd start by separating two things: whether a response is streaming, and whether someone wants to follow it. Scrolling up should pause the following without stopping the response. Loading earlier messages should preserve the message they're reading, even if new text is still arriving below it.

## Try streaming while reading an earlier message

This example uses React and a local timer to simulate a response. Nothing starts until you press **Stream a reply**. While it's running, scroll up inside the conversation, load older messages, then use **Jump to latest** to return.

{{< chat-scroll-demo >}}

The implementation below is the one running in the demo. It uses an ordinary, non-virtualized list with messages in chronological order.

## Following is a choice the interface needs to remember

The tempting first version is an effect that sets `scrollTop` to `scrollHeight` whenever the messages change. It keeps a streaming response visible, but it also overrides anyone reading further up the conversation.

Checking whether you're near the bottom *after* appending text introduces another problem. The new text has already increased the distance to the bottom. A large chunk can make it look as though someone scrolled away when they haven't touched anything.

Instead, I keep a boolean that answers one question: should the next update move the viewport to the latest message?

| What happens | What the viewport should do |
| --- | --- |
| Text arrives while following | Move to the new bottom. |
| Someone scrolls up | Pause following and keep their place. |
| Someone clicks Jump to latest | Move to the bottom and resume following. |
| Someone scrolls back to the bottom | Resume following. |
| Older messages are inserted while reading | Keep the same message at the same visible offset. |

The ref holds the current choice for scroll callbacks. React state mirrors it so the demo can display “Following latest” or “Reading earlier messages.” New chunks don't change that choice.

I pause on upward wheel and touch input as well as an upward scroll event. That lets the example stop following before the browser has finished moving the viewport. Those handlers leave native scrolling alone.

## Keep a visible message as the anchor

Loading older messages changes the positions of everything already in the list. Keeping the old `scrollTop` would show a different part of the conversation.

A common correction is to measure the total height before and after prepending, then add the difference to `scrollTop`. That works when the entire height change comes from the messages added above.

But a streaming reply might also grow at the bottom during the same update. Including that growth in the correction moves the reader too far.

For this example, I remember the first message whose bottom edge is below the top of the viewport. That includes a message that's only partly visible. I store its DOM element and the offset of its top edge from the viewport's top edge. The offset can be negative.

After React updates the list, I measure the same element again:

```ts
const delta = currentOffset - savedOffset;
viewport.scrollTop += delta;
```

Only movement of the anchored message affects that correction. Text arriving below it doesn't.

I refresh the anchor on every scroll and after each correction. If someone moves while the history request is pending, the eventual insertion preserves their more recent position. Stable message keys matter here: the example needs React to retain the element it's measuring.

## A React hook for following and preserving position

The hook uses [`useLayoutEffect`](https://react.dev/reference/react/useLayoutEffect) to correct the viewport after a React commit and before the browser repaints. I'd keep the work in that effect small because it blocks painting.

A [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) also watches the list and the viewport. It handles size changes outside a message-state update, such as text wrapping after a resize. Both paths use the same rule: follow the bottom, or restore the saved anchor.

{{< chat-scroll-source file="useChatScroll.ts" lang="ts" >}}

The scroll handler compares the new position with the last recorded one to detect upward movement. A downward scroll that reaches the bottom resumes following. The two-pixel tolerance accounts for fractional scroll positions and rounded height measurements, rather than requiring [an exact equality](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#determine_if_an_element_has_been_totally_scrolled).

After writing `scrollTop`, `reconcile` immediately records the resulting position. The scroll event caused by that write can arrive later. Recording it now keeps the handler from mistaking our own correction for someone scrolling up.

## Connect the hook to a chronological message list

Attach the viewport handlers to the element that actually scrolls, and the content ref to the list inside it. Here's a small component using the hook; the full demo source adds the simulated stream and history requests.

```tsx
import { useChatScroll } from './useChatScroll';

type Message = { id: string; text: string };

export function Conversation({ messages }: { messages: Message[] }) {
  const scroll = useChatScroll();

  return (
    <section className="chat-scroll-demo" aria-label="Conversation example">
      <div
        className="chat-scroll-viewport"
        ref={scroll.viewportRef}
        {...scroll.viewportProps}
        role="region"
        aria-label="Conversation"
        tabIndex={0}
      >
        <ol className="chat-scroll-messages" ref={scroll.contentRef}>
          {messages.map(message => <li key={message.id}>{message.text}</li>)}
        </ol>
      </div>
      <p role="status">
        {scroll.following ? 'Following latest' : 'Reading earlier messages'}
      </p>
      <button type="button" onClick={scroll.jumpToLatest}>
        Jump to latest
      </button>
    </section>
  );
}
```

The viewport needs a bounded height and `overflow-y: auto`. It also opts out of [browser scroll anchoring](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow-anchor), where supported, because this example applies its own correction.

```css
.chat-scroll-viewport {
  height: 26rem;
  overflow-y: auto;
  overflow-anchor: none;
  overscroll-behavior-y: contain;
  scroll-behavior: auto;
}
```

I use direct scroll updates throughout. Starting a smooth scroll for every chunk would keep retargeting an animation while the message grows. An immediate jump is also predictable when someone explicitly chooses to return to the latest response.

The Jump to latest button sits outside the scrolling area and stays mounted after activation, so it remains available and keeps keyboard focus. The transcript is a focusable region containing a normal list. When that region itself has focus, the key handler implements arrow, page, Home, End, and Space scrolling explicitly so it works consistently in the browsers tested. It leaves Alt, Control, and Command shortcuts and events from child controls alone.

Only the following state and stream start/stop notices are live announcements; every chunk of text isn't sent to a live region.

## Simulate the stream without changing the scroll logic

The demo appends three words every 90 milliseconds. Each tick updates the text of the active assistant message with a functional state update. Loading history uses a separate 650-millisecond timeout and prepends an earlier page, so both operations can overlap.

Those timings are only there to make the behaviour easy to try. The hook doesn't need to know whether the text came from a timer, a WebSocket, or a streamed HTTP response. It reacts to the committed layout.

Stopping or resetting the demo clears its timers. The hook disconnects its observer on unmount. I'd keep that cleanup when moving the example into an application, especially when switching between conversations.

Download the files used by the demo:

{{< chat-scroll-files >}}

Put the three files in the same directory in a React TypeScript app, import the stylesheet, and render the default export from `ChatScrollDemo.tsx`. The example uses React and React DOM, with no chat library or backend required.

## Where I'd change this for a production chat

This hook assumes that the anchored message stays mounted. A virtualized list can remove that element, so I'd use the virtualizer's scroll-position and prepending APIs instead of adding this correction on top of them. The demo also scans mounted messages to find its anchor; that approach is intended for a bounded conversation, not an unlimited history.

The anchor preserves the position of a message's outer element. It doesn't preserve a particular line *inside* a long message if text above that line changes. Images should reserve their dimensions, and expanding code blocks or other content inside the anchored message may need a more specific anchor.

I'd also reset this state when switching conversations. Remounting with `key={conversationId}` is one option when returning to the latest message is the desired behaviour. Restoring a previous reading position needs saved state for that conversation.

Sending your own message is another product decision. This demo keeps the existing following state when a simulated exchange starts. In an application, you might choose to jump to the message someone just sent. I'd make that an explicit action rather than a side effect of receiving any new message.

To check an implementation, start a long response and scroll up. While it's still arriving, load history, then scroll again before that request finishes. The same message should remain in place when the older messages appear. Finally, use Jump to latest and confirm that the next chunks stay visible. That's the sequence I'd want working before adding a real stream.
