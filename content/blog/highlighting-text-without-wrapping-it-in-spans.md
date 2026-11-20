---
title: Highlighting Text Without Wrapping It
date: 2026-11-19
slug: highlighting-text-without-wrapping-it-in-spans
tags: [JavaScript, CSS]
description: Use DOM ranges and the CSS Custom Highlight API to highlight search results across inline elements, handle overlapping annotations, and leave the original markup alone.
---

If I wanted to highlight a word in a paragraph, I'd start by wrapping it in a `<mark>`. That gets awkward when the match starts in plain text and ends inside a link. Now I have to split the match across text nodes and clean up the wrappers whenever the query changes.

Add an annotation that starts halfway through the match and extends past it, and those wrappers get harder to manage. In a React app, I'd also want React to stay in charge of that markup.

For this example, I use the [CSS Custom Highlight API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API). A `Range` points to the start and end of the match. Once I register it as a highlight, CSS paints it and the original markup stays in place.

## Try highlighting across inline elements

Search for `cross bold text` in this example. The match starts in a paragraph's text node and ends inside a `<strong>` element. Turn on annotations to see two highlights cover some of the same text, then change the reading width.

{{< text-highlights-demo >}}

Open **See the original markup** while changing the search. There are no extra wrappers to add or remove. The result list is separate HTML so the matches are available as text, too.

## Start with a range

A DOM range has two endpoints. For a range inside a text node, you give it the node and the offsets where the highlight should start and stop.

Here's a paragraph with a single text node:

```html
<p id="example">Highlight this phrase.</p>
```

To highlight `this`, create a range from offset 10 to offset 14:

```js
const paragraph = document.querySelector('#example');
const text = paragraph.firstChild;
const range = new Range();

range.setStart(text, 10);
range.setEnd(text, 14);

const result = new Highlight(range);
CSS.highlights.set('article-search', result);
```

The name registered in JavaScript connects it to a CSS rule:

```css
::highlight(article-search) {
  background-color: #f7dd76;
  color: #191919;
}
```

`Highlight` can hold several ranges. A search with ten results can use one registered highlight rather than ten separate CSS rules.

These styles have [a limited set of supported properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::highlight), including text color, background color, and text decoration. You can't use a highlight to add padding or turn a passage into a button. It paints text; it doesn't create an element.

## A range can cross element boundaries

Consider this markup:

```html
<p>A search result can cross <strong>bold text</strong>, too.</p>
```

Searching each text node independently won't find `cross bold text`. The first node ends with `cross `, and the next contains `bold text`.

I join the paragraph's text nodes into one string and keep track of where each node starts and ends. Then I can search the whole paragraph and use those offsets to find the original nodes.

This is the helper used by the playground:

{{< text-highlights-source >}}

The start belongs to the node containing the match's first character. The end belongs to the node containing its last character, with the end offset positioned just after it. Those slightly different comparisons matter when a match ends exactly at a node boundary.

For the paragraph above, the node map looks like this. End offsets are exclusive:

| Text node | Start | End |
| --- | --- | --- |
| `A search result can cross ` | 0 | 26 |
| `bold text` | 26 | 35 |
| `, too.` | 35 | 41 |

The match `cross bold text` occupies offsets 20 through 35 in the combined string. Its range starts at offset 20 in the first text node and ends at offset 9 in the second. The string is only a search index; it never replaces the paragraph's contents.

`Range` handles the elements between those boundaries. We don't need to split the `<strong>` element or reconstruct its contents.

I kept the search case-sensitive and used `indexOf`, so a query like `a+b` matches those three characters as written. The helper moves past each match before looking for the next one. JavaScript strings and DOM text offsets both count UTF-16 code units, so I can use the offsets from the search directly.

I'd be careful about adding case-insensitive search here. Lowercasing can change a string's length. If I also wanted to handle locale-specific matching or normalize Unicode, I'd keep a way to map the matches back to the original text.

## Choose the search boundaries deliberately

I search each paragraph separately so a match can't start in one paragraph and end in the next.

```js
const paragraphs = [...passage.querySelectorAll('p')];
const ranges = paragraphs.flatMap((paragraph) =>
  findTextRanges(paragraph, query),
);

CSS.highlights.set('article-search', new Highlight(...ranges));
```

The helper concatenates text nodes exactly as stored. It doesn't invent spaces for `<br>` elements, read generated CSS content, or decide which hidden nodes should be searchable. The sample paragraphs don't contain those cases. A larger document needs a policy for them before it needs a more elaborate highlighter.

The implementation also scans its node list for each match boundary. That's reasonable for these short paragraphs, but it isn't a large-document search index. For longer content, I'd measure searching and boundary lookup separately before choosing caching or a faster lookup structure.

## Give overlapping highlights an order

A search result might overlap an annotation. Those ranges don't need to nest like HTML elements do:

```js
const search = new Highlight(...searchRanges);
const annotations = new Highlight(...annotationRanges);

search.priority = 1;
annotations.priority = 0;

CSS.highlights.set('article-search', search);
CSS.highlights.set('article-notes', annotations);
```

Higher [priority](https://developer.mozilla.org/en-US/docs/Web/API/Highlight/priority) places a custom highlight above another. When priorities are equal, registration order breaks the tie. Reordering the CSS rules isn't how you choose which highlight appears on top.

In the playground, search results have a yellow background and annotations have a blue background with an underline. Search has the higher priority, so its opaque background covers the blue where they overlap. The annotation's underline still helps identify the annotated passage.

## Keep ranges tied to the current document

Resizing the text doesn't require recalculating highlight rectangles. The browser paints the ranges against the new line breaks.

Replacing the content is different. A `Range` refers to DOM nodes and boundary positions. It isn't a saved description of “these words, wherever they move.” Live ranges adjust as the DOM changes, but that doesn't guarantee they still identify the intended passage.

For search, I'd rebuild the ranges after the application commits a content update. In React, do that after the relevant DOM has rendered, and remove the component's registration on cleanup:

```js
CSS.highlights.delete('article-search');
```

The registry is shared by the document, so names also need ownership. Multiple mounted readers need distinct names and corresponding styles, or a shared owner that combines their ranges. Calling `CSS.highlights.clear()` from one component would remove everyone else's highlights too.

Persistent annotations need a separate data model: a document version, a position or quote anchor, and a rule for resolving that anchor after edits. I'd save that information and reconstruct a range when rendering the document.

## Keep the meaning available without the paint

Check support before constructing a highlight:

```js
const supported =
  'highlights' in CSS && typeof Highlight !== 'undefined';
```

If the API or JavaScript is unavailable, you can still read the sample and use the browser's Find command. In an app where people depend on search, I'd keep the result list usable on its own.

A custom highlight doesn't provide an annotation's accessible name, keyboard target, or comment text. Those need real interface elements. The playground includes a match count and matching passages; an annotation tool would also need a way to navigate and read its notes without relying on background colors.

I'd still use `<mark>` when marked text belongs in the document's markup. For temporary search results and visual annotations, ranges let the application change the emphasis without rewriting the content underneath it.

To try this on your own content, start with one paragraph containing a link or some emphasis. Register a range that crosses that element, then resize the paragraph and inspect its DOM. The [CSS Custom Highlight specification](https://drafts.csswg.org/css-highlight-api-1/) covers the painting and priority rules when you're ready to add overlapping highlights.
