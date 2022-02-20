---
title: From Hugo to Next JS and Back Again
date: 2019-05-18
tags: [Static Sites, Performance, Tailwind]
description: Learn about why I choose Hugo over a React based static site generator for my blog.
---

This post features my challenges, frustrations, and why I ultimately landed on
using Hugo as a static site generator to build my blog. The past three
iterations of this website were written using Hugo, Next JS, and then back to
Hugo again. Hugo gave me so much out of the box, and practically everything I
needed, whereas Next JS, required me to write the functionality I wanted
explicitly. This article is not meant to hate on any frameworks and instead
voice my own experience.

<!--more-->

{{< toc >}}

## Choosing a Static Site Generator

Since I'm primarily front-end focused and quite confident building almost
anything with React, I figured it would be a great idea to rebuild my blog using
a React based static site generator. I began my search by researching React
static site generators and managed to narrow it down to three possibilities:
React Static, Gatsby, and Next JS.

**React Static:** Looked interesting and was built to solve some of the problems
that Gatsby and Next JS had.
[Here is an article](https://medium.com/@tannerlinsley/%EF%B8%8F-introducing-react-static-a-progressive-static-site-framework-for-react-3470d2a51ebc)
about why Nozzle built React static in the first place. After digging in and
playing around with a sample project, I felt as though the documentation and
examples were not enough for me to feel productive. Therefore I decided to pass
on this one.

**Gatsby:** Another exciting project, and quite a popular option. Gatsby gives
you so much out of the box, and there is almost a plugin for any functionality
you need. I loved that Gatsby is built in a way that puts performance first by
rendering what the user needs right away and aggressively prefetching the rest.

What ended up turning me away from Gatsby was the stability of the framework. I
had numerous occasions where I had to restart the development server because of
an unknown error, or the livereload would suddenly stop working. I also found
that there was not enough information while trying to debug why a particular
GraphQL query wasn't working as expected or remark properties were randomly
missing from the schema.

**Next JS:** I had heard lots of great things about this framework and a few
coworkers had used it to build marketing type pages. Zeit (the company behind
Next) is also very active in the open source community and has several high
profile projects on the go. After checking out the documentation, it had
interactive tutorials which I thought was cool and a bonus compared to other
frameworks. Next was built initially for building isomorphic web applications
and recently added the option to export static files.

I ran through the get started tutorial and found it was incredibly simple to get
started. By adding Next as a dependency, creating a pages folder with a single
index file, and running the application, it just worked. I slowly kept adding
and exploring the framework and enjoyed how it was coming together. This
experimental phase gave me confidence that is framework would be an excellent
choice.

## Building the Blog with Next JS

After going through the basic tutorials on the Next site, I was able to quickly
build something that worked. One area where I got stuck was creating dynamic
pages which worked with the static export. I learned that if you want dynamic
pages, you either have to include it as part of the configuration or include
them in the pages directory. This meant whenever I wanted to create category
pages, I had to parse the source files to collect all categories, and then
generate pages based on that. Not quite as easy and straightforward as Hugo, but
it wasn't that bad.

The stack I used to build this blog on top of Next was
[MDX](https://github.com/mdx-js/mdx), TypeScript, Emotion, Redux,
[Typesafe Actions](https://github.com/piotrwitek/typesafe-actions), and Redux
observables. Most of the inspiration on how to lay out the directory structure
and generate posts using MDX was directly from
[Next's site](https://github.com/zeit/next-site).

1. I had fun building the blog using Next JS, but there were a few points which
   made me wish I had gone a different route.
1. I had to write a few custom plugins to add simple functionality like the
   reading time or table of contents to a blog post. This required me to parse
   the MDX files by taking the AST and transforming it or appending to it.
1. The JavaScript bundle size (170.1 KB) was reasonably large for a simple blog.
1. Generating a list of posts required a bit of extra work compared to other
   frameworks like Gatsby. Gatsby makes all posts query-able from any page,
   while Next requires you to generate that list yourself by reading the file
   system. To accomplish this, I had to generate a summary based on the contents
   of the blog post. I wrote a script which copied all the exported frontmatter
   and saved them into summaries which I was able to import and render.
1. There were not as many plugins available as Gatsby has which would have saved
   me some time.
1. I probably spent way too much time trying to configure TypeScript to work
   with Emotion. By the end of the project, I still had parts of the application
   which threw TypeScript errors.
1. Redux and Redux Observables are overkill for what I needed them to do. I was
   using it for managing the likes button state, which could have easily been
   replaced by the React context API. In my defence, I had plans of expanding
   the functionality and making the website more interactive and state driven.
1. I learned that using Emotion was not as joyful as I thought it would be. I
   love the component approach to every single element, but in practice, I feel
   like this made the code partially unreadable. It added confusion about the
   element and hierarchy instead of simplifying it. I was frequently examining
   each element to see if it was a `div`, `span`, or a `header`.

By the time I had completed an MVP and deployed it to production, I was left not
quite as happy as I thought I would be. Yes, the user experience and performance
were great, but I felt like a lot of the little things I wanted had to be hacked
together.

A couple of months went by, and I decided to redesign my blog once again. This
time I kept in mind of my past experiences and decided it would be best to build
it again using Hugo.

## Rebuilding the Blog with Hugo Again

Now the question you might be wondering it is why I would switch back to Hugo?
Simply put, Hugo has all the functionality I need at the present moment out of
the box. These days my time is limited, and I want to work on other things than
my blog, so I opted to keep it simple and live within Hugo's constraints.

I began by using the
[Victor framework](https://github.com/netlify-templates/victor-hugo) by Netlify
to give me an excellent foundation to build upon. It has everything you need to
get started with Hugo, modern JavaScript, and any CSS configuration you need.

This time around I decided to use Tailwind CSS, BEM, and the ITCSS methodology
to style my website. I had used Tailwind on the first iteration of this blog and
loved using it. For those not familiar with Tailwind, it's a utility first CSS
framework which essentially provides a series of classes to reuse to build out
components.

To keep that single page app feel, I used Turbolinks and Stimulus to load and
handle page events. This was my first time using Stimulus, and I found it pretty
great when you need to sprinkle some functionality within a server-rendered app.
Stimulus paired with Turbolinks works amazing together since you no longer need
to watch for page changes and refresh the JavaScript. In the past, you needed to
watch for the `turbolinks:load` event and then update all event listeners,
elements, and anything your JavaScript code was doing each time the page
changes. Stimulus removing that overhead was a nice change.

To make things a tad faster, I run the CSS through Purgecss (which is pretty
much required when using Tailwind), then inline critical CSS, minify HTML, and
defer loading CSS and JavaScript files. By applying these performance
enhancements, the website feels fast on all browsers and devices I tested, and I
was able to achieve 100s in all categories when using Google lighthouse. Best of
all, the CSS and JavaScript files are minuscule compared to what I had built
with Next JS. At the time of writing this article, the main CSS file is a
whopping 6.6 KB gzipped, and 34.4 KB gzipped for the JavaScript file.

## Lessons Learned

One of the core recitations I learned was to pick the right tool for the job. As
much as I love using React, it just didn't suit my needs for this one website.
Many of these frameworks may seem tempting, but ask yourself if is it essential
for what you're trying to build. A great
[example](https://link.medium.com/y3rl0KPjbW) of this is how Netflix replaced
their sign up page with vanilla JavaScript to speed up the loading and
time-to-interactive. I do wish more companies would take note of this as you may
not need a full-fledged framework/library for something relatively simple.
