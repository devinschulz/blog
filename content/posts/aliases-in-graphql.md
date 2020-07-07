---
title: Rename Fields by Using Aliases in GraphQL
description: Learn how to rename fields of a GraphQL object by using aliases.
date: 2020-07-05
tags: [GraphQL, Today I Learned]
---

When working with a GraphQL API, you may want to rename a field to something other than what the API has to offer. Aliases exist as part of the GraphQL spec to solve this exact problem.

Aliases allow you to rename a single field to whatever you want it to be. They are defined client-side, so you don’t need to update your API to use them.

<!--more-->

Imagine requesting data using the following query from an API:

```graphql
query GetEntries {
  entries {
    id
    updated_at
  }
}
```

You will get the following JSON response:

```json
{
  "entries": [
    {
      "id": "4fe43afe",
      "updated_at": "2020-07-05T22:56:15.012Z"
    }
  ]
}
```

The `id` here is fine, but the `updated_at` doesn’t quite conform to the camel case convention in JavaScript. Let’s change it by using an alias.

```graphql
query GetEntries {
  entries {
    id
    updated_at: updatedAt
  }
}
```

Which yields the following:

```json
{
  "entries": [
    {
      "id": "4fe43afe",
      "updatedAt": "2020-07-05T22:56:15.012Z"
    }
  ]
}
```

Creating an alias in GraphQL is easy. Simply add a colon and new name next to the field you want to rename.

## Aliasing fields with arguments

The examples above only cover fields that don’t have any arguments. When creating an alias on a field that contains arguments, the syntax is slightly different. Instead of the alias appearing right to the field, it’s placed on the left.

Take a look at the following example. It contains the `updated_at`field, but again, we want to rename.

```graphql
query GetEntries {
  entries {
    id
    updated_at(format: “MM dd, YYYY”)
  }
}
```

Now with an alias:

```graphql
query GetEntries {
  entries {
    id
    updatedAt: updated_at(format: “MM dd, YYYY”)
  }
}
```

And the result:

```json
{
  "entries": [
    {
      "id": "4fe43afe",
      "updatedAt": "July 5, 2020"
    }
  ]
}
```

## Requesting a single field more than once

What’s great about aliases is you can request the same field several times, but yield different results. Take a look at this example:

```graphql
query GetEntries {
  entries {
    id
    updated_at
    updated_at(format: “MM dd, YYYY”)
  }
}
```

Running this query would yield an error because two of the field names are the same. You can use an alias to here to mitigate the error.

```graphql
query GetEntries {
  entries {
    id
    updated_at: updatedAt
    updatedAtHumanized: updated_at(format: “MM dd, YYYY”)
  }
}
```

Running the updated query would give us the results we’re expecting.

```json
{
  "entries": [
    {
      "id": "4fe43afe",
      "updatedAt": "2020-07-05T22:56:15.012Z",
      "updatedAtHumanized": "July 5, 2020"
    }
  ]
}
```
