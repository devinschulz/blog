---
title: Restrictions While Styling Visited Links
description:
  Learn what the :visited pseudo-class selector is and the limits on how you can style it.
date: 2020-02-18
tags: [CSS]
---

The `:visited` pseudo-class is a unique state that provides visible feedback on
links that a user has navigated to. This state behaves similarly to other
pseudo-classes like `:hover`, `:focus`, and `:active`, but comes with a few
limitations.

## Limitations

First and foremost, you can only change the CSS properties of a visited link if
the unvisited link already has that style applied. If your unvisited link does
not have a background color, but the visited one does, it will **not** apply
that background color. If your unvisited link has a background color, and you
change that color for visited links, it **will** work.

```css
a {
  /* no defined background */
}

a:visited {
  background-color: blue;
}
```

❌ Does **not** work. The visited link will **not** have a background color.

```css
a {
  background-color: red;
}

a:visited {
  background-color: blue;
}
```

✅ **Does** work. The visited link will have the background color of blue.

## Supported Styles

When styling visited links, you are limited to these color declarations:

- `background-color`
- `border-color` (`border-top-color`, `border-right-color`,
  `border-bottom-color`, `border-left-color`)
- `color`
- `column-rule-color`
- `outline-color`
- Fill and stroke colors on SVG elements

Any color can be used, except the alpha channel is ignored when present.

- ❌ `rgba(255,255,5,.5)` Works, but opacity is ignored
- ✅ `rgb(255,255,5,1)`
- ❌ `#ff663350` Works, but opacity is ignored
- ✅ `#ff6633`
- ❌ `hsla(20, 0%, 0%, 50%)` Works, but opacity is ignored
- ✅ `hsl(20, 0%, 0%)`

The browser ignores all other CSS declarations.

## Why aren't all CSS declarations available?

The primary reason all properties aren't available is to provide privacy and
security to the user. Without these safeguards, websites could use this
information to track which sites a user has visited, all without their consent.

Browsers misinform developers when they try to get the style with
`window.getComputedStyle`. It returns the unvisited link's style instead of the visited one.

## Unvisiting a link

Open your browser's history and delete the entry you wish to unvisit.
