---
title: Handling an event callback once
description: Learn how to simplify your code by using a simple trick to
  remove an event listener after an event has been fired once.
date: 2020-07-12
tags: [JavaScript, Today I Learned]
---

An interesting tidbit I stumbled upon recently is the ability to remove an event
listener once called.

In the past, I would have added an event listener to an element and then
removed it within the callback function. It would have looked something
like this:

```js
const button = document.querySelector('button')

button.addEventListener('click', function onClick() {
  console.log('clicked')
  button.removeEventListener('click', onClick)
})
```

<!--more-->

In this example, an event listener is attached to the button element, and
once clicked, the listener is removed.

This code can be cleaned up by passing one additional argument to the event
listener, `{ once: true }`.

```js
const button = document.querySelector('button')

button.addEventListener(
  'click',
  function onClick() {
    console.log('clicked')
  },
  { once: true }
)
```

This example functions precisely like the example above, except requires less
code. Less code equals less potential bugs to fix later 😁.
