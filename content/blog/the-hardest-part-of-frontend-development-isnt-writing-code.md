---
title: The Hardest Part of Frontend Development Isn't Writing Code
date: 2026-10-18
tags: [Frontend, Opinion]
description: After more than a decade of building interfaces, the hardest work is deciding how they should behave when things don't go as planned.
---

After more than a decade of frontend development, I find deciding how an interface should behave harder than writing the code. A failed request, a slow connection, or an unexpected interaction can expose decisions that were never made during design.

When I first started building websites, most of my time went into getting things to work. I'd take a design, write some HTML and CSS, add JavaScript, and eventually get something that looked and behaved the way I wanted.

I'm more comfortable with those tools now. The questions about what to build still take thought.

## A design doesn't cover every state

Often, a design shows an interface in its ideal state. The data has loaded, the content fits, and the user is following the expected path.

What happens when there's no data to display? What if the content is considerably longer than expected? If saving fails, can someone retry without entering everything again?

Those questions don't always have answers in a design file. Working through them is part of implementing the interface, and the answers can change what needs to be built.

## Deciding how streaming chat should behave

Throughout my career, I've worked on several chat interfaces, including AI-powered chat applications.

A text field and a list of messages give you a place to start. Streaming responses introduce decisions that aren't obvious from that layout.

As new text arrives, the conversation should generally scroll to keep the latest content visible.

But when someone scrolls up to read an earlier message, you don't want to keep pulling them back to the bottom. You need to decide when to stop following the response and how someone can return to it.

Then there's rendering Markdown as it streams in. A response might contain code blocks, lists, or tables, but the content arrives in pieces. The interface needs to handle incomplete content without constantly jumping around.

You also need to account for cancelled requests, failed responses, conversation history, and switching between conversations while requests are still running.

These behaviours affect one another. Someone might be reading an earlier message when a response fails, or switch conversations while new content is still arriving. Getting each behaviour working separately doesn't tell you how they'll work together.

## Make recovery and keyboard use predictable

A dropdown needs keyboard navigation. A dialog should return focus to the appropriate element when it closes. A form should keep someone's work when a request fails.

These details rarely get much attention when they're working correctly. When they're missing, someone has to find their place on the page again or repeat work they already did.

I've always enjoyed this side of frontend development. There's something satisfying about building an interface that feels predictable and easy to use, even when there's a lot happening behind the scenes.

## Be selective about what becomes reusable

Earlier in my career, I was quick to create abstractions and reusable components. If two pieces of code looked similar, I'd look for a way to combine them.

I still value reusable code, but I've become more selective about when to introduce it.

Sometimes a little duplication is easier to maintain than an abstraction with endless configuration options. Similar-looking components can need different loading states, validation, or recovery behaviour. Combining them too early can make those differences harder to follow.

I've learned to ask what behaviour the components actually share before deciding they should use the same implementation.

Making those decisions still requires a solid understanding of JavaScript, CSS, browser behaviour, and the tools I'm working with. Knowing those tools helps me judge which option will be easier to implement and maintain.

Before implementing your next screen, pick one request and work through what happens if it fails halfway through the interaction. Can someone recover without losing what they've done? Answering that can tell you more about the work ahead than the ideal state in the design.
