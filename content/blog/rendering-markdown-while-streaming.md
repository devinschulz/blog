---
title: Rendering Markdown While It's Still Streaming
date: 2026-11-07
slug: rendering-markdown-while-streaming
tags: [React]
description: Rendering Markdown is easy until it arrives a few characters at a time. A look at incomplete syntax, code blocks, parsing, and performance in React.
---

A streaming Markdown response can turn a paragraph into a table while someone is reading it. Rendering the final document correctly doesn't prevent those intermediate updates from shifting the page.

In [my previous post about chat interfaces](/blog/building-a-chat-interface-that-doesnt-fight-your-scroll-position/), I focused on keeping the reader's scroll position stable as a response grows. But the content inside that response can move around too. A few characters arrive, a paragraph becomes a table, and everything below it shifts.

The first implementation doesn't need much code:

```tsx
import Markdown from 'react-markdown';

function Message({ content }: { content: string }) {
  return <Markdown>{content}</Markdown>;
}
```

That's a reasonable place to start. Give the component the accumulated response and let it render. The complication is that every update presents a new document ending, even though the writer hasn't finished. Correctly rendering each of those documents doesn't necessarily make the transition between them pleasant to read.

## Incomplete Markdown can change the meaning of earlier text

The playground below feeds the same source into `react-markdown` and Streamdown. Both receive the entire accumulated string. The first uses `remark-gfm` for tables; the second uses its streaming defaults. Code highlighting is deliberately left out so the formatting changes are easier to see.

Choose an example, then step through it one character at a time. Nothing starts automatically. The controls also let you play a longer sequence or move directly to a particular point.

{{< streaming-markdown-demo >}}

Try stopping just before the closing asterisks in the bold example. A renderer following ordinary Markdown rules can show the opening markers as text. Once the closing markers arrive, the same text becomes bold.

Links have a similar transition. `[Read more](https://exam` doesn't yet describe a complete inline link. I'd keep the label readable without guessing a destination. A URL can be syntactically safe and still point somewhere other than the destination that eventually arrives.

Tables make the layout change more obvious. The header alone looks like a line of pipe-separated text. When the delimiter row arrives, a GFM parser can reinterpret it as a table header. Tables are an extension, so a comparison needs matching Markdown features before it tells us anything useful about streaming.

Code fences are different. [CommonMark allows an unclosed fenced block to extend to the end of its containing block or document](https://spec.commonmark.org/0.31.2/#fenced-code-blocks). We don't need to invent a closing fence just to show its contents as code. We do need to decide how the code block's interface behaves while those contents are changing.

## Keep the source separate from its presentation

Assuming chunks arrive in order, a functional state update is enough to accumulate them:

```tsx
setContent(previous => previous + chunk);
```

That avoids appending to a stale value captured by a callback. It doesn't handle reordered messages, retries, or duplicate events; those belong to the transport layer.

I'd preserve this accumulated source exactly as received. If the renderer temporarily completes an unfinished construct, that completion should only affect the display. Writing guessed closing markers into the source makes the next chunk harder to handle and changes what gets saved or copied.

There are three useful approaches:

| Approach | What the reader gets | Cost |
| --- | --- | --- |
| Render the available source | Immediate content using ordinary Markdown rules | Formatting can change as syntax completes |
| Temporarily complete syntax | Earlier formatting for unfinished constructs | The renderer can guess wrong |
| Buffer unfinished content | Fewer changes to already displayed formatting | Some content appears later |

I'd choose based on the content. Showing an unfinished sentence is usually helpful. Making an unfinished link clickable is much harder to justify. Holding an entire long code block until its closing fence arrives can leave the reader staring at an apparently stalled response.

A useful compromise is to show the unfinished tail conservatively while letting earlier content render normally. That still needs a definition of “finished.” A blank line is a hint, not a universal boundary.

## A fence detector isn't a Markdown parser

It's tempting to start tracking state with a small helper:

```ts
function hasOpenCodeFence(markdown: string): boolean {
  let open = false;

  for (const line of markdown.split('\n')) {
    if (line.startsWith('```')) open = !open;
  }

  return open;
}
```

This illustrates the idea, but I wouldn't use it to decide production rendering behaviour. It only works for a deliberately restricted format where every fence is an unindented triple-backtick line and there are no misleading fence-like lines inside the block.

Real Markdown also has tilde fences, indentation, nested containers, and fences with different lengths. A four-backtick opening fence can contain a three-backtick line without closing. Toggling a boolean gets that case wrong.

Even a correct fence detector only answers a small part of the problem. It doesn't tell us whether an earlier paragraph might become a heading, whether a list will continue, or whether a link reference will be defined later.

I'd use a parser's structure or a library designed for streaming when making those decisions. A handful of regular expressions can make a controlled example look convincing while quietly changing the meaning of less predictable input.

## Parsing and updating the DOM are different costs

Passing a longer string to a Markdown component can cause it to parse that source again. React then reconciles the resulting elements. Those are separate operations: re-parsing a document doesn't mean React replaces every DOM node.

That distinction matters when deciding what to optimize. If parsing is expensive, memoizing a parent whose `content` prop changes every update won't eliminate it. If syntax highlighting is expensive, reducing DOM changes alone won't fix that either.

For a rough model, imagine receiving one character per update and scanning the whole accumulated document each time. The total characters examined are `1 + 2 + … + n`. With a linear scan per update, that's quadratic total work over the response. Real parsers, chunk sizes, and scheduling vary, so this is a reason to measure rather than a benchmark result.

A block-aware design aims to keep earlier work stable:

```text
Whole document:
chunk → parse all available source → reconcile output

Block-aware design:
chunk → update parser state → revisit affected blocks
                           → preserve unaffected blocks
```

The application model might look like this:

```ts
type StreamingDocument = {
  completedBlocks: Array<{ id: string; source: string }>;
  activeBlock: string;
};
```

Stable IDs let React retain each block's identity. Memoization can skip rendering an unchanged block if its props also stay stable. But this type doesn't solve the difficult part: deciding which blocks are actually independent.

For example, a later link reference definition can affect text much earlier in the document. Splitting the source into separate Markdown components can lose that shared context entirely. Lists and their surrounding paragraphs need care too. I'd either keep the parser's document context, explicitly restrict the supported syntax, or allow previously committed blocks to be invalidated.

Before building any of that, I'd try publishing fewer updates. The network can keep accumulating chunks while the UI renders a batch at a short interval. That reduces the number of parses without changing Markdown semantics. Flush the remaining buffer when the response ends, and measure the added delay as well as the saved work.

For measurements, record source length and update count alongside timings. Time the parser directly if its API permits it; use React's profiling tools for component rendering, and the browser's performance tools for layout and paint. A timer around a state setter doesn't measure the work React performs afterward. Development timings also aren't representative production measurements.

## Give unfinished code blocks a simple interface

A fence's language label can arrive in pieces. The renderer might first receive three backticks followed by `typ`, then receive the rest of `typescript` and a newline. Loading a highlighter for every partial label would do work that the next chunk immediately makes irrelevant.

I'd wait for the opening line to finish before selecting a language. Until then, plain code is enough. If highlighting a growing block is still expensive, wait for the block to close or throttle highlighting separately from text updates.

Keep the scroll container mounted while changing its contents. Using the code string as its React key remounts it on every update and can discard horizontal scroll position. Replacing the entire plain-code component with an unrelated highlighted component can have the same effect.

Copying also needs an explicit rule. A copy button can be disabled until the block finishes, or it can copy the exact content available at the time and say so. It shouldn't silently copy synthetic closing markers or imply that a partial program is complete.

I'd also reserve space for the toolbar. Adding a language label and copy button halfway through a response shouldn't unnecessarily shift the code someone is reading.

## Reproduce the same partial input every time

A real model response is useful for an integration check, but a deterministic stream makes rendering bugs much easier to reproduce. This generator slices a known string and supports cancellation:

```ts
async function* streamText(
  source: string,
  chunkSize = 4,
  delay = 30,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  if (!Number.isInteger(chunkSize) || chunkSize < 1) {
    throw new RangeError('chunkSize must be a positive integer');
  }

  for (let index = 0; index < source.length; index += chunkSize) {
    if (signal?.aborted) return;
    await new Promise<void>(resolve => setTimeout(resolve, delay));
    if (signal?.aborted) return;
    yield source.slice(index, index + chunkSize);
  }
}
```

Cancellation prevents another yield; it doesn't clear the pending timeout. For a small local example that's acceptable. A transport implementation should cancel its underlying reader as well. These slices use JavaScript string offsets, not model tokens or network bytes. Decode a real byte stream before appending text, preserving decoder state between chunks.

Put `streamText` in the same module as this component. The React integration resets when the example changes and aborts on cleanup:

```tsx
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';

function MarkdownDemo({ source }: { source: string }) {
  const [content, setContent] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setContent('');

    async function run() {
      for await (const chunk of streamText(source, 4, 30, controller.signal)) {
        if (controller.signal.aborted) return;
        setContent(previous => previous + chunk);
      }
    }

    void run();
    return () => controller.abort();
  }, [source]);

  return <Markdown>{content}</Markdown>;
}
```

The playground uses a position in a fixed source instead, which makes stepping backward and restarting simple. Neither example needs an AI API to expose the parsing problem.

I'd test intermediate positions as deliberately as the final document: stop before a closing marker, cancel halfway through a code block, and append a reference definition after the paragraph that uses it. Check that readable text remains available, cancellation stops further appends, and the completed output matches the chosen Markdown dialect. For links, check both incomplete syntax and disallowed URL schemes.

## Choosing a Markdown renderer for streaming responses

[`react-markdown`](https://github.com/remarkjs/react-markdown) remains a useful baseline when ordinary Markdown rendering is sufficient. Its plugin support lets an application choose extensions such as GFM. I'd keep that choice explicit rather than assuming every renderer supports the same syntax.

For a response that needs progressive formatting, I'd evaluate [Streamdown](https://streamdown.ai/docs). It provides incomplete-syntax handling and [block-level memoization](https://streamdown.ai/docs/memoization), which are useful places to avoid maintaining application-specific parsing logic.

```tsx
import { Streamdown } from 'streamdown';

function Message({ content, streaming }: {
  content: string;
  streaming: boolean;
}) {
  return (
    <Streamdown isAnimating={streaming}>
      {content}
    </Streamdown>
  );
}
```

This is the rendering integration, not the complete installation: follow the library's styling setup and add its code plugin if you want highlighting. In the [configuration](https://streamdown.ai/docs/configuration), `isAnimating` communicates streaming state; incomplete-Markdown processing is controlled separately by `parseIncompleteMarkdown`.

I'd still own network handling, cancellation, final-output checks, and the application's security policy. Treat generated content as untrusted input. Review allowed URL protocols and remote images, and keep raw HTML disabled unless there is a specific reason and a sanitization policy for enabling it. Custom renderers and plugins need the same review.

Once the content behaves predictably, there's still the viewport to consider. That's where [following new replies without disturbing someone reading earlier messages](/blog/building-a-chat-interface-that-doesnt-fight-your-scroll-position/) becomes the other half of the interaction.
