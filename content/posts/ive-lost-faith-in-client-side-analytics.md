---
title: I've Lost Faith in Client-Side Analytics
date: 2019-08-31
tags: [Analytics, Opinion]
description: Since switching to Netlify's server-side analytics, I learned how different the data is when compared to Google Analytics.
---

I've been using Google Analytics on this website since its inception, and
according to W3Techs,
[56.4 percent of sites on the internet](https://w3techs.com/technologies/details/ta-googleanalytics/all/all)
do too. I use the data collected from Google Analytics to see which posts are
popular, and features are used most often. If a particular article is more
popular than others, I'll make sure to write more about that subject in the
future. If a specific feature is rarely used, I'll most likely remove it.

<!--more-->

My confidence in client-side analytics all changed the day I enabled
[Netlify's server-side analytics](https://www.netlify.com/products/analytics/)
on my website. After 20 or so minutes, I started seeing the data flow in, and I
was utterly blown away with the results. On average, I was seeing an average of
600 page views and 400 unique visitors a month in Google analytics. Not much,
but something. On the other hand, Netlify Analytics showed that I had 4,152
pageviews and 1,558 unique visitors in the past month!

What's going on here? To me, this seems pretty evident that adblockers are
pretty damn popular, and most of my traffic clearly uses one. I'm guilty of this
too since I use an ad blocker system-wide on both my computer and phone. For
those that are interested, my computer blocks ads by modifying the systems
[hosts file](https://github.com/StevenBlack/hosts),
and my phone uses [Blokada](https://blokada.org). Blocking system-wide is the
only way to prevent tracking through all applications.

Nonetheless, never did I expect so much of a gap in the data. This revelation
made me sit down and think about all the metrics based decisions I've made in
the past. Even at work, every single interaction is accounted for, or at least I
thought the majority of them were. Features and roadmaps are built around
knowing this type of information. Is it possible we are all making the wrong
thing because the data is so skewed?

Almost every browser except Google Chrome these days promote themselves as an
ad-free, tracker-free browser. Chrome has a proposal to deprecate the webRequest
API, which directly impacts how ad blockers operate. I firmly believe that once
peoples ad blockers stop working, they will flee to an alternative like Firefox,
Brave, Safari, etc. No, not all people will switch, but I think a chunk of their
userbase will. And once Chrome begins to lose market share, the analytic results
will be even more misrepresentative.

I've been ranting about how bad the data is, but you're probably wondering what
we can do about it? I believe Netlify is heading in the right direction by
collecting the data server-side. WIth only server-side analytics, you lose out
on certain events you would typically track client-side, but in turn, you will
have much more accurate data. This might be more beneficial to your business, or
you can settle for inaccurate results. In my case, page views and being able to
determine which are the most popular is good enough for me.

Perhaps you don't have a static website as I do, and you have an app powered by
a REST/GraphQL/SOAP/or whatever API. You can track each request that comes in,
extract the desired information, and then send it to your analytics provider.
Processing all data confined within the bounds of your server allows you to
bypass any adblocker.

Since my discovery, I have since removed Google Analytics from this website. I
believe I can live without the finer details and settle for the limited data
collected from Netlify. On the upside, I promote and respect your privacy since
there are no longer trackers of any kind. I believe there needs to be a
trade-off between invasively tracking everything about a user, and the bare
minimum metrics to make a product better. Imagine if every single person and
action was untracked. The internet would be a much different place than it is
now.
