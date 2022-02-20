---
title: Accumulate Complex Objects With the Reduce Method
date: 2019-07-29
description: Learn how to recursively reduce a nested data structure by harnessing the power of the Array.reduce method.
tags: [JavaScript, Array, Map]
---

Many people don't realize the power and potential of the `Array.reduce`
([MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce))
method. What makes it so powerful is its ability to take in an array containing
any values and then return almost any type of data. Because of this flexibility,
I want to highlight one technique you can use to traverse an array containing an
infinite number of nested objects. You'll learn how to accumulate all objects
and return a single object you can use to reference any entry by ID.

<!--more-->

{{< toc >}}

## Building out the function

First, we'll start with the data, an object with a structure that looks like
this:

```js
const data = [
  {
    id: 1,
    children: [
      {
        id: 2,
        children: [
          {
            id: 3,
          },
          {
            id: 4,
            children: [
              {
                id: 5,
              },
            ],
          },
        ],
      },
      {
        id: 6,
        children: [{ id: 7 }],
      },
    ],
  },
]
```

The objective here is to turn this array of nested objects into a flattened
object, so you can efficiently look up any entry by ID. Begin by creating the
base function which accepts two arguments, `list` and the `accumulator`. Right
off the bat, you might find this a little funny, passing around the reduce
accumulator outside of the reduce method. Bear with me; this is where all the
magic happens!

```js
function collect(list, acc) {
  // ...
}
collect(data, {})
// => undefined
```

Now take the list argument and call `reduce` to return a value other than
`undefined`.

```js
function collect(list, acc) {
  return list.reduce((accumulator, current) => {
    return accumulator
  }, acc)
}
collect(data, {})
// => {}
```

Take notice of line 4, when we recursively call the `collect` function, the
resulting object is passed down and returned each time. Each iteration adds to
the same object. Neat!

Next, you'll set the object key to the current ID and assign it the value of
`current`.

```js
function collect(list, acc) {
  return list.reduce((accumulator, current) => {
    accumulator[current.id] = current
    return accumulator
  }, acc)
}
collect(data, {})
// => { '1': { id: 1, children: [ [Object], [Object] ] } }
```

You might call this finished if the object didn't contain nested objects. In
order to collect all those values too, you will need to recursively call
`collect` if the current object contains the `children` property.

```js
function collect(list, acc) {
  return list.reduce((accumulator, current) => {
    if (Array.isArray(current.children) && current.children.length) {
      return collect(current.children, accumulator)
    }
    accumulator[current.id] = current
    return accumulator
  }, acc)
}
collect(data, {})
// => { '1': { id: 1, children: [ [Object], [Object] ] },
//      '2': { id: 2, children: [ [Object], [Object] ] },
//      '3': { id: 3 },
//      '4': { id: 4, children: [ [Object] ] },
//      '5': { id: 5 },
//      '6': { id: 6, children: [ [Object] ] },
//      '7': { id: 7 } }
```

This is working great, but you can take this one step further and clean up the
`children` property. You may want to do this, so you have less duplicate data.

```js
function collect(list, acc) {
  return list.reduce((accumulator, current) => {
    if (Array.isArray(current.children) && current.children.length) {
      accumulator[current.id] = {
        ...current,
        children: current.children.map((entry) => entry.id),
      }
      return collect(current.children, accumulator)
    }
    accumulator[current.id] = current
    return accumulator
  }, acc)
}
collect(data, {})
// => { '1': { id: 1, children: [ 2, 6 ] },
//      '2': { id: 2, children: [ 3, 4 ] },
//      '3': { id: 3 },
//      '4': { id: 4, children: [ 5 ] },
//      '5': { id: 5 },
//      '6': { id: 6, children: [ 7 ] },
//      '7': { id: 7 } }
```

## Using Map Instead of an Object

Maybe you want to spice things up a bit and use the newer ES6 features like
`Map`. Swap out any references to the accumulator object and replace that
value with `Map`. Update the object assignments to use the `set` method and
that's it!

```js
function collect(list, acc) {
  return list.reduce((accumulator, current) => {
    if (Array.isArray(current.children) && current.children.length) {
      accumulator.set(current.id, {
        ...current,
        children: current.children.map((entry) => entry.id),
      })
      return collect(current.children, accumulator)
    }
    accumulator.set(current.id, current)
    return accumulator
  }, acc)
}
collect(data, new Map())
// => Map {
//  1 => { id: 1, children: [ 2, 6 ] },
//  2 => { id: 2, children: [ 3, 4 ] },
//  3 => { id: 3 },
//  4 => { id: 4, children: [ 5 ] },
//  5 => { id: 5 },
//  6 => { id: 6, children: [ 7 ] },
//  7 => { id: 7 } }
```

## Conclusion

There you have it, my thought process on how I would take a similar piece of
data and transform it into something I can easily reference. Hopefully,
there's something here you can takeaway and apply to your own work. Happy
coding!
