---
title: Filter out multiple console messages in Google Chrome
description:
date: 2020-04-28
category: Devtools
---

Google chrome gives you the ability to filter out message within the console by prefixing a search term with the hyphen-minus (subtraction) character `-`. If you want to ignore multiple entries, add a space between the search terms.

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
