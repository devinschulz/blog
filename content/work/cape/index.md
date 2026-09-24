---
title: Cape
seoTitle: 'Cape: Product Design & Frontend Engineering'
layout: cape
description: Product design and frontend leadership for an AI workspace spanning conversation, risk dashboards, and document review.
role: Designer & Lead Frontend Engineer
facts:
  - label: Focus
    value: Product design & frontend engineering
  - label: Product
    value: AI-powered workspace
  - label: Interfaces
    value: Assistant, dashboards & review tools
headline: A clearer way to
headlineAccent: work with AI.
summary: At Cape I was both the designer and the lead frontend engineer. The job was to bring a chat assistant, data-heavy dashboards and document review into one workspace that felt like a single product.
hero:
  image: images/cape/slide-1.png
  alt: Cape Assistant showing the same conversation in a full desktop workspace and a compact side panel, with navigation, message history, and a composer.
  caption: 'The assistant: a full workspace and a compact panel, with a familiar conversation structure in both.'
intro: 'I worked on both the design and the frontend. A chat thread, a customer dashboard and a document review look very different, but they had the same design problem: people need to know where they are, what they’re looking at and what they can do next.'
assistant:
  title: The same conversation, in two sizes.
  body: The screenshot shows the assistant as a full page and as a narrow side panel. The full page has room for history and navigation. The panel drops those and leads with the conversation and the message box. Both keep the model label, the same message layout and the same place to type a reply.
  notes:
    - title: Part of the product.
      body: Assistant sits in the main rail next to Apps and Workflows, and a second column holds past conversations.
    - title: A readable exchange.
      body: Sender and model labels separate the prompt from the response without getting in the way of the text.
    - title: A narrower version.
      body: The side panel keeps the conversation in a much narrower space, with the message box fixed below it.
chapters:
  - id: dashboard
    number: '02'
    name: Structured work
    title: A useful overview, with the detail close by.
    description: The dashboard puts customer context, ownership, risk categories and review information on one page. The summary sits at the top where it’s easy to find, and grouped sections with expandable rows hold the detail underneath.
    image: images/cape/slide-2.png
    alt: Cape’s customer dashboard with an overview, risk summary, ownership information, expandable news rows, and review sections.
    caption: The customer review dashboard, with the summary at the top and the detail below it.
    notes:
      - title: Summary before detail.
        body: The customer overview and the headline risk indicator come first, before the denser review sections.
      - title: Sections keep their shape.
        body: Ownership, news, and individual risk categories retain their own headings and visual boundaries.
      - title: Rows that open.
        body: News items stay compact until you expand one to read the detail.
  - id: review
    number: '03'
    name: Document review
    title: Keep the source in sight.
    description: The review workspace puts a document next to a list of control objectives, so a reviewer can keep the source open while working down the list. Each review state has its own marker.
    image: images/cape/slide-3.png
    alt: Cape’s control-objectives workspace with a document viewer on the left and a list of objectives with check, cross, and neutral status indicators on the right.
    caption: The source document and the review objectives, side by side.
    notes:
      - title: Side by side.
        body: The document and the review list each get their own pane in the same view.
      - title: Shape as well as color.
        body: Checkmarks, crosses and neutral marks show each state, so color is never the only signal.
      - title: Tools near the work.
        body: Page navigation and zoom sit with the document; filters and item menus sit with the review list.
  - id: administration
    number: '04'
    name: Administration
    title: The settings around the work.
    description: 'People open team management, integrations, API keys and usage reports less often than the assistant or the dashboard, but the same rules apply: say what state something is in, say what an action will do before it happens, and never show a number without the date range it covers.'
    image: images/cape/slide-4.jpg
    alt: Six Cape administration screens, including an invite dialog, a Settings members table listing names, roles, and last-active dates, an integrations list with GitHub and JIRA connected and Gmail and Notion offering a connect action, a New API Key form with naming and expiry fields, a redaction-metrics view with entity counts and a timeline chart, and a usage analytics view with token and API-call charts.
    caption: Admin screens for the team, integrations, API keys and usage.
    notes:
      - title: Status first.
        body: A connected integration shows its status. Only the integrations that aren’t set up yet offer a way to connect.
      - title: Say what will happen.
        body: While you fill in the API key form, it shows the name of the key it will create and the date it expires.
      - title: Numbers with dates.
        body: Redaction totals and usage figures always show the date range they cover.
principles:
  - title: Orientation
    body: Help people see where they are, whether that’s in a conversation, an app or a document.
  - title: Continuity
    body: Keep familiar patterns in place when the screen gets smaller or the task changes.
  - title: Reviewability
    body: Keep the information behind a summary or a decision within reach, so people can check it.
reflection: Looking back, these screens are mostly about context. An assistant needs a readable conversation, a dashboard needs a clear hierarchy, and a review tool needs room for the source document. The frontend is where that turns into something people can use.
---

As the designer and the frontend lead, I worked on how the interface looked and how it was built. Doing both meant the reasons behind a design carried through into the code.

The hard part was deciding what deserved attention, what could sit a click away, and how to keep people oriented as the task changed.
