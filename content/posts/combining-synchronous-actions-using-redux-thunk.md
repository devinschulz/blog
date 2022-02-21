---
title: Combining Synchronous Actions Using Redux Thunk
date: 2018-07-09T16:20:02-04:00
description:
  Learn how to use Redux Thunk for handling several synchronous actions at once
  to modify different areas of the application state.
tags: [Redux, Testing, React, Jest]
---

Simple front-end applications I’ve worked with have one event (click, keypress,
input change, etc.), which dispatches a single action to modify part of the
application state tree. At the time your application scales in complexity, that
single event may need to perform several actions at once and perform some sort
business logic before they are dispatched.

<!--more-->

{{< toc >}}

## A Potential Solution

Recently I’ve been using [Redux Thunk](https://github.com/reduxjs/redux-thunk)
for dispatching a single thunk action, and in turn, it dispatches several
actions to modify independent areas of the application state. Think Redux Thunk
is only for asynchronous actions? Think again! Never heard of Redux Thunk or the
term thunk? No worries, I will go a bit more in-depth about how it works below.

Now let’s pretend you have an e-commerce store, and your application state looks
something like this:

```javascript
 {
  cart: [],
  view: {
    sidebarOpen: false
  },
  merchandise: [
    {
      id: 1,
      price: 24.99,
      type: 'shirt'
    }
  ]
}
```

Imagine you have a sidebar which slides out from the side of the screen whenever
a user clicks a button to add an item to the cart. When doing so, you might
dispatch two separate actions: one for adding the item to the cart, and the
second for telling the view that the sidebar should be opened.

```javascript
// actions.js
const openSidebar = () => ({
  type: 'OPEN_SIDEBAR',
})

const addToCart = (id) => ({
  type: 'ADD_TO_CART',
  payload: id,
})
```

```javascript
// AddToCart.jsx
const AddToCart = ({addToCart, id, openSidebar}) => (
  <button
    onClick={() => {
      addToCart(id)
      openSidebar()
    }}
  >
    Add to cart
  </button>
)
```

This button component would generally be a nested deep within the application
hierarchy. In the future, you might want to have this same functionality in a
completely separate component. This would be problematic since you now have two
areas of your application which are performing the same set of logic.

You can see how this defeats the
<abbr title='Don&apos;t Repeat Yourself'>DRY</abbr> principles of software
development. Instead of dispatching several actions from within a component, try
separating them into a thunk action.

Here I’ll update the button to fire a single action, which also gives you the
benefit of one less property to pass down.

```javascript
// AddToCart.jsx
const AddToCart = ({addItemToCart, id}) => (
  <button onClick={() => addItemToCart(id)}>Add to cart</button>
)
```

## Building a Thunk Action

```javascript
// actions.js
const addItemToCart = (id) => (dispatch, getState) => {
  dispatch(addToCart(id))
  dispatch(openSidebar())
}
```

Let's try to break this down. The thunk action `addItemToCart` is a function,
which accepts the cart ID as an argument and then returns another function. When
you dispatch any action, the Thunk middleware will check if the current action
type is a function and if it’s true, it will call it, and pass the Redux
`dispatch` and `getState` as the arguments.

This is a pretty simple example, so let’s make it a little more complicated. You
now need to save the item to the backend to allow the cart to persist between
sessions.

```javascript
// actions.js
const saveCartRequest = (id) => ({
  type: 'SAVE_CART_REQUEST',
  payload: id,
})

const addItemToCart = (id) => (dispatch) => {
  dispatch(addToCart(id))
  dispatch(openSidebar())
  dispatch(saveCartRequest(id))
}
```

Did you know that you can trigger other thunk actions from within a thunk
action? You are not limited to only dispatching actions which have a return
value.

Now instead of only passing the ID to `addToCart`, we’ll pretend the reducer
requires the entire item to be sent instead. With these new requirements, you
can call `getState` to return the merchandise from the store, and find the value
you need to send.

```javascript
// actions.js
const addItemToCart = (id) => (dispatch, getState) => {
  const {merchandise} = getState()
  const item = merchandise.find((item) => item.id === id)
  dispatch(addToCart(item))
  dispatch(openSidebar())
  dispatch(saveCartRequest(id))
}

// Can’t forget to update the `addToCart` action to use
// the `item` instead of the `id`
const addToCart = (item) => ({
  type: 'ADD_TO_CART',
  payload: item,
})
```

## Testing a Thunk Action

Testing thunk actions are a little bit different than testing regular actions.
The main difference is we are no longer testing the returned value of an action,
and instead of testing whether the dispatch is called with the correct values.

```javascript
// test.actions.js
const setup = () => {
  const cart = []
  const merchandise = [
    {
      id: 5,
      type: 'shirt',
    },
  ]
  const store = {merchandise, cart}
  const getState = () => store
  return {
    dispatch: jest.fn(),
    getState,
  }
}

describe('actions', () => {
  describe('addItemToCart', () => {
    it('should dispatch all the correct actions', () => {
      const id = 5
      // 1: Get the dispatch spy and mocked state
      const {dispatch, getState} = setup()

      // 2: Call the thunk action
      addItemToCart(id)(dispatch, getState)

      // 3: Test that the dispatch was called with the
      //    correct arguments
      expect(dispatch).toHaveBeenCalledTimes(3)
      expect(dispatch).toHaveBeenCalledWith({
        type: 'ADD_TO_CART',
        payload: {
          id: 5,
          type: 'shirt',
        },
      })
      expect(dispatch).toHaveBeenCalledWith({
        type: 'OPEN_SIDEBAR',
      })
      expect(dispatch).toHaveBeenLastCalledWith({
        type: 'SAVE_CART_REQUEST',
        payload: id,
      })
    })
  })
})
```

## Conclusion

What I love the most about this approach is that all the logic is contained
within a specific area of the application. It’s entirely out of a component,
which helps keep them “dumb”. Luckily, thunk actions are super simple to test,
which gives you no reason not to test them. Whether you have thoughts of using
this solution now or in the future, know that it will be able to handle your
challenging workflows.

## Versions

This article has been written and updated to support the following versions:

- **Redux:** 4.0.0
- **Redux Thunk:** 2.3.0
- **Jest:** 23.2.0

## Additional Resources

- [What is a thunk](https://daveceddia.com/what-is-a-thunk/)
- [Redux Thunks Dispatching Other Thunks — Discussion and Best Practices](https://medium.com/@talkol/redux-thunks-dispatching-other-thunks-discussion-and-best-practices-dd6c2b695ecf)
