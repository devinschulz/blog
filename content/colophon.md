---
title: Colophon
description: The tools, typefaces, and details behind this website.
type: colophon
---

This is my personal site, where I write about code and design and share some of my work. Here’s what goes into building it.

## Built with

The site is built with [Hugo](https://gohugo.io/). Articles are written in Markdown and compiled into static HTML. Hugo also handles image processing, bundles the TypeScript, and generates the RSS feeds.

[Tailwind CSS](https://tailwindcss.com/) handles the styling. The layout, colors, and components are custom, with light and dark themes.

[Turbo](https://turbo.hotwired.dev/) handles navigation between pages. [Stimulus](https://stimulus.hotwired.dev/) adds behavior to things like search, menus, and code-copy buttons. Interactive article demos use [React](https://react.dev/), loaded only on the pages that need it.

## Typography

The main typeface is DM Sans. Code uses JetBrains Mono. Both are self-hosted, so reading a page doesn’t require a request to a font service.

## A little movement

The water, fish, and interactive lettering use [Three.js](https://threejs.org/) and custom WebGL shaders. They’re a place to experiment with the kinds of small interactions I enjoy building.

The effects respect reduced-motion preferences, and the fish can be paused from the footer. The text and links remain usable without the effects.

## Reading and browsing

Search runs in the browser against an index generated from the site’s content. There’s also an [RSS feed](/index.xml) for following new articles in a feed reader.

Articles have Markdown versions, too. Longer articles can remember the section you last reached, with that reading position stored in your browser.

## Under the hood

TypeScript checks the interactive code. Playwright and axe help check behavior and accessibility, and the build checks internal links, metadata, and content exports.

The [source is on GitHub](https://github.com/devinschulz/blog). Like the writing, the site changes as I learn and find things I want to improve.
