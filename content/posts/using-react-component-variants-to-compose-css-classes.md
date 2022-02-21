---
title: Using React Component Variants to Compose CSS Classes
description:
  Learn how to build React component variants by composing CSS classes in a
  typesafe and flexible manner.
date: 2022-02-20
tags: [React, Tailwind CSS, TypeScript]
---

When it comes to styling variations of a component, we often concat classes
together in a non-idiomatic way. In this post, I will outline one pattern I've
been using to apply classes to an element that has been readable, typesafe, and
flexible enough to keep adding variants easily.

Let's get started.

We will create a generic button component with various styles depending on size
and type. How we apply these classes is not button-specific and could be used to
style inputs, dropdowns, or any other component you can think of.

## Define the union types

Here we're going to start with two TypeScript unions to define the possible
button sizes and the variant.

```ts
type ButtonSize = 'small' | 'medium'
type ButtonVariant = 'primary' | 'secondary'
```

These could easily extend to any number of union types, but we'll keep it simple
and stick to two variations for each.

## Define the styles

With the unions defined, we know each style's different combinations. Use each
union type to create a `Record<K, T>` that implements all the members and the
corresponding class names.

When setting the generics of the record, the `K` is set to one of the unions,
and `T` is a `string`. The `string` is the class names you want to use.

```ts
const buttonSizeClasses: Record<ButtonSize, string> = {
  small: 'py-1 px-2',
  medium: 'py-2 px-4',
}

const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-700 text-white',
  secondary: 'border border-gray-300 text-black',
}
```

By explicitly defining the `Record` generic with our union type, we can lean on
the compiler to guarantee we always have the suitable properties available.

## Create the React component

Begin by creating an interface of the component's props.

```ts
interface ButtonProps {
  size?: ButtonSize
  variant?: ButtonVariant
}
```

And now the component itself to tie everything together.

```tsx
import {FC} from 'react'
import clsx from 'clsx'

const Button: FC<ButtonProps> = ({
  children,
  size = 'small',
  variant = 'primary',
}) => (
  <button
    className={clsx(buttonSizeClasses[size], buttonVariantClasses[variant])}
  >
    {children}
  </button>
)
```

We've got a simple button component, but the one crucial line I'd like to point
out here is how we're selecting and applying the classes.

```ts
clsx(buttonSizeClasses[size], buttonVariantClasses[variant])
```

The [clsx](https://github.com/lukeed/clsx) (or
[classnames](https://www.npmjs.com/package/classnames) if you're already using
it in your application) package accepts an array of arguments and concatenates
any truthy values into a single string. This package may not be required, but I
like using it, so I don't have to join them manually.

The two `buttonSizeClasses` and `buttonVariantClasses` variables will output the
classes we defined earlier. In our case, the component only contains defaults
props, the classes applied to the button will be
`py-1 px-2 bg-blue-700 text-white`.

[View this component as a whole](https://gist.github.com/devinschulz/0f3a522e5baec0318fb21ed13fa6ffe4)
