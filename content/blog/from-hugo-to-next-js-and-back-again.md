---
title: From Hugo to Next.js and Back Again
date: 2019-05-18
slug: from-hugo-to-next-js-and-back-again
tags: [Static Sites, Performance, Tailwind]
description:
  Learn why I chose Hugo over a React-based static site generator for my blog.
---

This post covers my challenges, my frustrations, and why I ultimately landed on
using Hugo as a static site generator to build my blog. The past three
iterations of this website were written using Hugo, then Next.js, and then Hugo again. Hugo gave me so much out of the box, and practically everything I
needed, whereas Next.js required me to write the functionality I wanted
explicitly. This article isn't meant to hate on any framework; it's just my own experience.

## Choosing a Static Site Generator

Since I'm primarily frontend-focused and quite confident building almost
anything with React, I figured it would be a great idea to rebuild my blog using
a React-based static site generator. I began my search by researching React
static site generators and managed to narrow it down to three possibilities:
React Static, Gatsby, and Next.js.

**React Static:** Looked interesting and was built to solve some of the problems
that Gatsby and Next.js had.
[Here is an article](https://medium.com/@tannerlinsley/%EF%B8%8F-introducing-react-static-a-progressive-static-site-framework-for-react-3470d2a51ebc)
about why Nozzle built React Static in the first place. After digging in and
playing around with a sample project, I felt as though the documentation and
examples were not enough for me to feel productive. Therefore, I decided to pass
on this one.

**Gatsby:** Another exciting project, and quite a popular option. Gatsby gives
you so much out of the box, and there's a plugin for almost any functionality you need. I loved that Gatsby is built in a way that puts performance first by
rendering what the user needs right away and aggressively prefetching the rest.

What ended up turning me away from Gatsby was the stability of the framework. I
had numerous occasions where I had to restart the development server because of
an unknown error, or live reload would suddenly stop working. I also found
that there was not enough information while trying to debug why a particular
GraphQL query wasn't working as expected or remark properties were randomly
missing from the schema.

**Next.js:** I had heard lots of great things about this framework and a few
coworkers had used it to build marketing-type pages. Vercel (the company behind
Next) is also very active in the open-source community and has several high-profile projects on the go. When I checked out the documentation, I found interactive tutorials, which I thought were cool and a bonus compared to other frameworks. Next was originally built for isomorphic web applications
and recently added the option to export static files.

I ran through the getting started tutorial and found it incredibly simple. By adding Next as a dependency, creating a pages folder with a single
index file, and running the application, it just worked. I slowly kept adding
and exploring the framework and enjoyed how it was coming together. This
experimental phase gave me confidence that this framework would be an excellent
choice.

## Building the Blog with Next.js

After going through the basic tutorials on the Next site, I was able to quickly
build something that worked. One area where I got stuck was creating dynamic pages that worked with the static export. I learned that if you want dynamic
pages, you either have to include them as part of the configuration or add them to the pages directory. This meant whenever I wanted to create category
pages, I had to parse the source files to collect all categories, and then
generate pages based on that. Not quite as easy and straightforward as Hugo, but
it wasn't that bad.

The stack I used to build this blog on top of Next was
[MDX](https://github.com/mdx-js/mdx), TypeScript, Emotion, Redux,
[Typesafe Actions](https://github.com/piotrwitek/typesafe-actions), and Redux Observables. Most of the inspiration on how to lay out the directory structure
and generate posts using MDX was directly from
[Next's site](https://github.com/zeit/next-site).

I had fun building the blog using Next.js, but there were a few points that made me wish I had gone a different route.

1. I had to write a few custom plugins to add simple functionality like the
   reading time or table of contents to a blog post. This required me to parse
   the MDX files by taking the AST and transforming it or appending to it.
1. The JavaScript bundle size (170.1 KB) was reasonably large for a simple blog.
1. Generating a list of posts required a bit of extra work compared to other
   frameworks like Gatsby. Gatsby makes all posts query-able from any page,
   while Next requires you to generate that list yourself by reading the file
   system. To achieve this, I had to generate a summary based on the contents
   of the blog post. I wrote a script that copied all the exported frontmatter and saved it into summaries I could import and render.
1. Next didn't have as many plugins as Gatsby, and more of them would have saved me some time.
1. I probably spent way too much time trying to configure TypeScript to work
   with Emotion. By the end of the project, I still had parts of the application that threw TypeScript errors.
1. Redux and Redux Observables were overkill for what I needed them to do. I was using them for managing the like button state, which could have easily been
   replaced by the React context API. In my defense, I had plans of expanding
   the functionality and making the website more interactive and state driven.
1. I learned that using Emotion was not as joyful as I thought it would be. I
   love the component approach to every single element, but in practice, I feel
   like this made the code partially unreadable. It added confusion about the
   element and hierarchy instead of simplifying it. I was frequently examining
   each element to see if it was a `div`, `span`, or a `header`.

By the time I had completed an MVP and deployed it to production, I was left not
quite as happy as I thought I would be. Yes, the user experience and performance
were great, but I felt like a lot of the little things I wanted had to be hacked together.

A couple of months went by, and I decided to redesign my blog once again. This time I kept my experiences in mind and decided it would be best to build
it again using Hugo.

## Rebuilding the Blog with Hugo Again

Now you might be wondering why I would switch back to Hugo.
Simply put, Hugo has all the functionality I need at the present moment out of
the box. These days my time is limited, and I want to work on things other than my blog, so I opted to keep it simple and live within Hugo's constraints.

I began by using the
[Victor framework](https://github.com/netlify-templates/victor-hugo) by Netlify
to give me an excellent foundation to build upon. It has everything you need to
get started with Hugo, modern JavaScript, and any CSS configuration you need.

This time around, I decided to use Tailwind CSS, BEM, and the ITCSS methodology
to style my website. I had used Tailwind on the first iteration of this blog and
loved using it. For those not familiar with Tailwind, it's a utility-first CSS
framework that essentially provides a series of classes to reuse to build out
components.

To keep that single page app feel, I used Turbolinks and Stimulus to load and
handle page events. This was my first time using Stimulus, and I found it pretty
great when you need to sprinkle some functionality within a server-rendered app.
Stimulus and Turbolinks work amazingly well together since you no longer need
to watch for page changes and refresh the JavaScript. In the past, you needed to
watch for the `turbolinks:load` event and then update all event listeners,
elements, and anything your JavaScript code was doing each time the page
changes. Stimulus removing that overhead was a nice change.

To make things a tad faster, I run the CSS through PurgeCSS (which is pretty
much required when using Tailwind), then inline critical CSS, minify HTML, and
defer loading CSS and JavaScript files. By applying these performance
enhancements, the website feels fast on all browsers and devices I tested, and I
was able to achieve 100s in all categories when using Google Lighthouse. Best of
all, the CSS and JavaScript files are minuscule compared to what I had built with Next.js. At the time of writing this article, the main CSS file is a whopping 6.6 KB gzipped, and the JavaScript file is 34.4 KB gzipped.

## Lessons Learned

One of the core lessons I learned was to pick the right tool for the job. As
much as I love using React, it just didn't suit my needs for this one website.
Many of these frameworks may seem tempting, but ask yourself if it's essential for what you're trying to build. A great
[example](https://link.medium.com/y3rl0KPjbW) of this is how Netflix replaced
their sign-up page with vanilla JavaScript to speed up the loading and
time-to-interactive. I do wish more companies would take note of this, since you may not need a full-fledged framework/library for something relatively simple.
