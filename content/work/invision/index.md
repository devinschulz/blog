---
title: InVision
seoTitle: 'InVision: Frontend Engineering Case Study'
description: 'Frontend engineering on the tools that sit between design and development: Inspect, Conversations and Boards.'
role: Senior Software Engineer
period: 2014-2020
facts:
  - label: Focus
    value: Frontend engineering
  - label: Products
    value: Inspect, Conversations, Boards
  - label: Team
    value: Distributed, cross-functional
headline: Making design intent
headlineAccent: tangible.
summary: 'There’s a lot more to a design than the picture on the screen: the spacing, the decisions behind it and the conversations around it. At InVision I worked on tools that helped teams carry those details into what they built.'
hero:
  image: images/invision/slide-3.png
  alt: InVision Inspect with a layer tree, a mobile recipe artboard, and panels for dimensions, colors, fonts, and grid settings.
  caption: 'Inspect: the design, its structure, and its implementation details in one workspace.'
intro: 'I joined InVision in December 2014 and worked on Inspect, Conversations and Boards. They were different products with the same goal: getting designers, developers and stakeholders to work from the same context.'
chapters:
  - id: inspect
    number: '01'
    name: Inspect
    title: From a picture to something you can build.
    description: 'A finished mockup tells you what an interface looks like. Inspect shows the structure behind it: layers, dimensions, colors and typography. The engineering problem was showing all that detail without burying the design.'
    image: images/invision/slide-2.png
    alt: A recipe prototype with the Inspect mode control highlighted in the bottom toolbar.
    caption: Switching to Inspect mode turns a prototype into something you can build from.
  - id: conversations
    number: '02'
    name: Conversations
    title: Keep the conversation attached to the work.
    description: Feedback is easier to understand when you can see what it refers to. Conversations puts comments right on the design, with pinned threads, mentions and a few different kinds of notes. I worked on this product as part of InVision’s distributed engineering team.
    image: images/invision/slide-4.png
    alt: A collage of InVision Conversations showing pinned comments, an at-mention suggestion, private notes, and highlighted feedback.
    caption: Comments, mentions and different note types, pinned to the design.
  - id: boards
    number: '03'
    name: Boards
    title: Give early ideas room to take shape.
    description: Plenty of design work starts before there’s a finished screen. Boards is a place for references, assets and visual direction. I worked on it too, and like the others it had to make working on creative projects together feel easy.
    image: images/invision/slide-5.png
    alt: InVision Boards showing layout options and controls for customizing a brand board’s cover image.
    caption: Layout and presentation options for collecting and sharing visual direction.
decisions:
  - title: Separate the logic from the view.
    body: Compute positions and distances independently, then pass a defined measurement shape to stateless rendering components.
  - title: Treat overlap as its own problem.
    body: Distinguish overlapping layers from separated layers before calculating the distances to display.
  - title: Keep the geometry true at every zoom.
    body: Scale the measurement positions for Inspect’s 13% to 800% zoom range, while keeping the displayed distances tied to the design.
workflow:
  image: images/invision/slide-6.png
  alt: Craft Sync’s publish dialog over a Sketch document, with artboard selection and a project destination.
  caption: 'Workflow context: Craft Sync connected the source design to the shared InVision workspace.'
reflection: All three products came down to context. A measurement needs the right edges, a comment needs the right spot on the design, and a collection of references needs a useful structure. Paying attention to how people read an interface is what I’ve kept from that work.
---

One of the things I built for Inspect was its measurement engine: the lines and labels that show the distance between a selected layer and a hovered layer.

It looks like a small visual detail, but underneath it’s a geometry problem. Layers can sit beside each other, overlap, or contain one another. The engine needs to choose the relevant edges, calculate the distances, and position the labels and helper lines.

I broke the work into the calculation logic, the rendering components, and the contract between them. That made the problem easier to reason about and let the view stay focused on drawing the result.
