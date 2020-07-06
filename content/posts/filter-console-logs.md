---
title: Filter out multiple console messages in Google Chrome
description: Learn how to filter out multiple console messages by using either regular expressions or prefixing a string with a hyphen-minus.
date: 2020-05-01
tags: [DevTools, Today I Learned]
---

Google chrome gives you the ability to filter out messages within the console by prefixing a search term with the hyphen-minus (subtraction) character `-`. If you want to ignore multiple entries, add a space between the search terms.

<!--more-->

```text
-term -analytics
```

Using regular expressions to filter enties also works:

```text
-/term/ -/analytics/
```

Or a combination of the two:

```text
-term -/analytics/
```
