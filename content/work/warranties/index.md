---
title: Warranties
seoTitle: 'Warranties: App Design & Development Case Study'
layout: warranties
description: Designing and building a small app for tracking the things you own and the coverage that comes with them, from first release to the end of support in 2025.
role: Designer & Developer
period: 2023-2025
facts:
  - label: Focus
    value: Product design & app development
  - label: Platforms
    value: iPhone, iPad & Mac
  - label: Status
    value: Support ended in 2025
headline: Your things,
headlineAccent: remembered.
summary: 'Warranties was my own app. I designed it and built it myself. It kept track of the things you own: what they cost, where you bought them and how long they’re covered. That way the details are there on the day something breaks.'
intro: A warranty is only useful if you can find it when something breaks. Most of the work went into making a record people would bother keeping up to date, and putting the answer to “is this still covered?” on the first screen.
chapters:
  - id: capture
    number: '01'
    name: Capture
    title: Only the name is required.
    description: Every record starts with someone typing on a phone, usually while standing next to the box. Brand, model, price, store, serial number, purchase date, photos and attachments are all there if you want them, and the form stays short until you need it to be long.
    image: images/warranties/slide-1.jpg
    alt: The Add Item form on iPad and Mac, with a required Name field and optional Brand, Model, Price, Store, Serial Number, and Purchase Date fields.
    caption: One required field, and a form that grows only as far as someone wants to take it.
    notes:
      - title: One field to start.
        body: A name is enough to save an item. Everything else is marked optional and can be filled in later, from the receipt or the manual.
      - title: Photos first.
        body: You recognize a picture of the actual thing faster than a model number, so adding a photo is at the top of the form.
      - title: Room for the paperwork.
        body: Notes and attachments keep the receipt and the warranty document with the item they belong to.
  - id: coverage
    number: '02'
    name: Coverage
    title: The hard part is the date.
    description: Coverage is a date-math problem people should not have to do. The expiry field pairs a calendar with shortcuts for the terms things actually come with, shows the resulting length in plain language, and allows more than one warranty per item, because parts and labour rarely expire together.
    image: images/warranties/slide-2.jpg
    alt: The Edit Item screen on iPhone with a warranty expiry calendar, +30d, +1y, +5y, and +10y shortcuts, coverage details, and an Add Another Warranty button.
    caption: Shortcuts for common terms, with the calendar still there for everything else.
    notes:
      - title: Common terms in one tap.
        body: +30d, +1y, +5y, and +10y cover most purchases in a single tap, and the field confirms the choice as a duration as well as a date.
      - title: More than one warranty.
        body: Parts, labour, and extended plans are separate rows on the same item instead of a single date that has to stand in for all of them.
      - title: Coverage in the owner’s words.
        body: A free-text field holds what the document actually says, so the detail is available later without hunting for the original paperwork.
  - id: detail
    number: '03'
    name: Detail
    title: Sorted by how much time is left.
    description: 'The list is grouped by remaining coverage rather than by name or category: within a year, two to five years, no expiry, and expired. That ordering answers the question people open the app with. On iPad and Mac, the same list becomes a sidebar beside the full record.'
    image: images/warranties/slide-3.jpg
    alt: Warranties on iPad with a sidebar of items grouped by remaining coverage and a detail pane showing a photo, information rows, and warranty rows.
    caption: The list and the record side by side, with remaining coverage stated in words.
    notes:
      - title: Time as the sort order.
        body: Grouping by what expires soonest puts the items that need attention at the top without anyone having to search for them.
      - title: Expired items stay.
        body: Lapsed items collapse into their own group. The purchase record still matters after the coverage runs out.
      - title: One layout, three sizes.
        body: On iPhone you see the list, then the record. iPad and Mac show both side by side. The record itself looks the same at every size.
sunset:
  kicker: End of support
  title: Knowing when<br><em>to stop.</em>
  image: images/warranties/slide-4.png
  alt: The Warranties app icon, a document with a yellow seal and a green checkmark.
  caption: Warranties, 2023-2025.
principles:
  - title: Legible time
    body: “3 years 8 months 18 days” answers the question. A date is something you still have to do arithmetic on.
  - title: Optional by default
    body: A record that is easy to start gets started. Detail can be added later, and often is.
  - title: Quiet by design
    body: The app opens to the things you own and nothing else. There is no reason for a utility like this to ask for attention.
reflection: 'Warranties was small enough that I could see every decision: how many fields were required, the order of the groups, how a duration was worded. That’s the nice part of building something end to end at this size. What I took back to bigger products is that how a record is structured is a design decision too, and it deserves the same care as the screens.'
---

I released Warranties in 2023 and kept it going alongside a full-time job. In 2025 I ended support.

It came down to time. An app like this has to keep up with every new version of the platforms it runs on, and that work never really ends. I didn’t want to keep selling something I couldn’t look after properly, so I stopped.

I tried to wind it down as carefully as I launched it.
