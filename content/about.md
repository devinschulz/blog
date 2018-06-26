---
title: About
type: about
menu:
  main:
    weight: 10
  footer:
    weight: 20
---

I’m Devin Schulz, a Senior Software Engineer and Graphic Designer in Ottawa, Canada. I take pride in my work, therefore I’ve decided to document my software development journey with useful articles, tips, tricks, and the lessons I learn along the way.

Since I started as a graphic designer, I was trained to think of the users experience first. As I transitioned to a more developer-centric role, I have carried that focus with me, and it comes through clearly in all of my projects.

I hope the content I share can provide my readers with first hand knowledge. I look forward to delivering suggestions and approaches that everyone can benefit from.

I’m happy to have you along for the ride!

— Devin

## About this website

The underlying technology of this website is built using the static site generator [Hugo](//gohugo.io), with a theme I wrote myself. My ultimate goal was to keep things lean and straightforward by having a dedicated performance budget before starting the development process. Building an accessible website (WCAG 2.0 AA compliance) is something I always strive and push for, so colours, font sizing and markup have all been selected and crafted thoughtfully.

### Styles

I have opted to use SCSS as my pre-processor of choice with a couple of predefined mixins to help with the [vertical rhythm](//github.com/zellwk/typi) and [shortened media queries](//github.com/sass-mq/sass-mq).

### JavaScript

To enhance the overall user experience, I use plain JavaScript with a few libraries like [Turbolinks](//github.com/turbolinks/turbolinks) and [Font Face Observer](//fontfaceobserver.com). Service workers ([Workbox](//github.com/GoogleChrome/workbox)) run in the background to cache assets so subsequent page loads feel instantaneous. The only external JavaScript libraries used are Sentry for capturing JavaScript errors, Disqus for commenting and Google Analytics for... analytics.

### Fonts

After numerous font pairings, I decided to pair [HK Grotesk](//fontsquirrel.com/fonts/hk-grotesk) for headings and accent text, and [PT Serif](//fonts.google.com/specimen/PT+Serif) for the body copy.

### Build

I chose Gulp to build and optimize the site before deploying it to production.

### CI and hosting

This is my first project where I have used [Netlify](//netlify.com), and if you have a static site, I recommend you check it out. The build process, DNS configuration, SSL, CDN and the whole developer experience using their platform is A+ material. You even get deployment previews for pull requests for free!

If you are curious about how things work, you can check out the source on [Github](//github.com/devinschulz/blog).

