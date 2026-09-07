---
title: InVision
seoTitle: InVision — Frontend Engineering Case Study
description: Frontend engineering for the space between design and development. A look back at Inspect, Conversations, and Boards.
role: Senior Software Engineer
period: 2014 — 2020
facts:
  - label: Focus
    value: Frontend engineering
  - label: Products
    value: Inspect, Conversations, Boards
  - label: Team
    value: Distributed, cross-functional
headline: Making design intent
headlineAccent: tangible.
summary: A design is more than the image on a screen. It’s the spacing, the decisions, and the conversation around it. At InVision, I worked on the tools that helped teams carry those details into what they built.
hero:
  image: images/invision/slide-3.png
  alt: InVision Inspect with a layer tree, a mobile recipe artboard, and panels for dimensions, colors, fonts, and grid settings.
  caption: Inspect — the design, its structure, and its implementation details in one workspace.
intro: I joined InVision in December 2014 and worked across Inspect, Conversations, and Boards. Different products, with a shared concern — helping designers, developers, and stakeholders work from the same context.
chapters:
  - id: inspect
    number: '01'
    name: Inspect
    title: From a picture to something you can build.
    description: A finished mockup tells you what an interface looks like. Inspect exposes the structure behind it — layers, dimensions, colors, and typography. The engineering challenge is to make that detail available without losing the design itself.
    image: images/invision/slide-2.png
    alt: A recipe prototype with the Inspect mode control highlighted in the bottom toolbar.
    caption: A change of mode turns a prototype into a source of implementation detail.
  - id: conversations
    number: '02'
    name: Conversations
    title: Keep the conversation attached to the work.
    description: Feedback is easier to understand when you can see what it refers to. Conversations brings comments onto the design itself, with pinned threads, mentions, and different kinds of notes. I worked on this product as part of InVision’s distributed engineering team.
    image: images/invision/slide-4.png
    alt: A collage of InVision Conversations showing pinned comments, an at-mention suggestion, private notes, and highlighted feedback.
    caption: Comments, mentions, and note types give feedback a place and a context.
  - id: boards
    number: '03'
    name: Boards
    title: Give early ideas room to take shape.
    description: Not every design conversation begins with a finished screen. Boards offers a space for references, assets, and visual direction. It was another product I worked on — a different kind of interface, with the same need to make creative collaboration feel approachable.
    image: images/invision/slide-5.png
    alt: InVision Boards showing layout options and controls for customizing a brand board’s cover image.
    caption: Flexible layouts and presentation controls for collecting and sharing visual direction.
decisions:
  - title: Separate the logic from the view.
    body: Compute positions and distances independently, then pass a defined measurement shape to stateless rendering components.
  - title: Treat overlap as its own problem.
    body: Distinguish overlapping layers from separated layers before calculating the distances to display.
  - title: Keep the geometry true at every zoom.
    body: Scale the measurement positions for Inspect’s 13%–800% zoom range, while keeping the displayed distances tied to the design.
workflow:
  image: images/invision/slide-6.png
  alt: Craft Sync’s publish dialog over a Sketch document, with artboard selection and a project destination.
  caption: Workflow context — Craft Sync connected the source design to the shared InVision workspace.
reflection: Across these products, the common thread was context. A measurement needs the right edges. A comment needs the right location. A collection of references needs a useful structure. That attention to how an interface is understood is the part of this work I carry forward.
---

One of my contributions to Inspect was its measurement engine: the lines and labels that show the distance between a selected layer and a hovered layer.

What looks like a small visual detail is a geometry problem underneath. Layers can sit beside each other, overlap, or contain one another. The engine needs to choose the relevant edges, calculate the distances, and position the labels and helper lines.

I broke the work into the calculation logic, the rendering components, and the contract between them. That made the problem easier to reason about and let the view stay focused on drawing the result.
