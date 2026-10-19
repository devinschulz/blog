---
title: The Hardest Part of Frontend Development Isn't Writing Code
date: 2026-10-18
tags: [Frontend, Opinion]
description: After more than a decade of building interfaces, the hardest work is deciding how they should behave when things don't go as planned.
---

When I first started building websites, most of my time was spent figuring out how to make things work. I'd take a design, write some HTML and CSS, add a bit of JavaScript, and eventually get something that looked and behaved the way I wanted.

After more than a decade of frontend development, writing the code has become the easier part.

The difficult part is everything around it.

It's understanding how something should behave, accounting for situations that weren't considered during design, and making decisions that won't cause problems down the road.

## The design is only the starting point

Most designs show an interface in its ideal state. The data has loaded, the content fits, and the user is following the expected path.

But real applications rarely behave that way.

What happens when a request fails? What if the user has a slow connection? What if there's no data to display, or the content is considerably longer than expected?

These are the kinds of questions that don't always have answers in a design file. And they're often where the real engineering work begins.

## Simple interfaces aren't always simple to build

Throughout my career, I've worked on several chat interfaces, including AI-powered chat applications.

On the surface, a chat interface is pretty straightforward. There's a text field, a list of messages, and some way to send and receive them.

Getting a basic version working doesn't take much effort. Making it feel polished is another story.

Take streaming responses, for example. As new text arrives, the conversation should generally scroll to keep the latest content visible. But what happens when someone scrolls up to read an earlier message? You don't want to constantly pull them back to the bottom.

Then there's rendering Markdown as it streams in. A response might contain code blocks, lists, or tables, but the content arrives in pieces. The interface needs to handle incomplete content without constantly jumping around.

You also need to account for cancelled requests, failed responses, conversation history, and switching between conversations while requests are still running.

None of these problems are particularly difficult on their own, but together they introduce a surprising amount of complexity.

The interesting part isn't displaying messages. It's handling everything that happens around them.

## The small details matter

Some of the most important frontend work is also the least noticeable.

A dropdown that supports keyboard navigation. A dialog that returns focus to the correct element when it closes. A form that doesn't lose someone's work when a request fails.

These details rarely get much attention when they're working correctly, but they're immediately noticeable when they're missing.

I've always enjoyed this side of frontend development. There's something satisfying about building an interface that feels predictable and easy to use, even when there's a lot happening behind the scenes.

Users shouldn't need to understand that complexity.

## Experience changes how you approach problems

Earlier in my career, I was quick to create abstractions and reusable components. If two pieces of code looked similar, I'd look for a way to combine them.

I still value reusable code, but I've become more selective about when to introduce it.

Sometimes a little duplication is easier to maintain than an abstraction with endless configuration options. Sometimes the simplest solution is the one that's easiest to change later.

I've also learned to ask more questions before writing code. What happens when this fails? What states are missing? Is this something we actually need to make reusable?

It's not about anticipating every possible scenario. It's about recognizing where complexity is likely to appear and making sensible decisions before it becomes a problem.

## It's more than writing code

Good frontend engineering still requires a solid understanding of JavaScript, CSS, browser behaviour, and the tools you're working with.

But knowing how to write code is only part of the job.

The harder part is understanding the problem, making the right trade-offs, and accounting for all the little details that turn a working interface into a good one.

And after more than a decade of building interfaces, that's still the part I find most interesting.
