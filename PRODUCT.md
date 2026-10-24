# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The site serves two audiences equally:

- Hiring teams and potential collaborators evaluating Devin Schulz’s work, experience, and approach to building interfaces.
- Developers reading technical articles, engineering opinions, and reflections on working in software.

Neither audience should have to navigate through the other audience’s content to find what they came for.

## Product Purpose

Devin Schulz’s personal portfolio and writing archive. It makes his work and thinking accessible through real projects, working examples, and published articles.

Success means visitors can find relevant work or writing, understand his contributions and decisions, and find a way to get in touch.

## Positioning

Devin is a frontend engineer with a design background. The site supports that identity with specific contributions to product interfaces, including Cape’s AI workspace, InVision’s design tools and Inspect measurement engine, and independently developed apps.

Project descriptions should distinguish Devin’s contribution from the wider team’s work. Interactive examples illustrate the approach described; they must not claim to reproduce an original production system unless that is true.

## Operating Context

- A public website used on desktop and mobile browsers.
- Visitors can enter through the homepage, a case study, the writing archive, or a direct article link.
- Work evaluation and reading are independent entry paths. Shared navigation should connect them predictably.
- Readers can browse posts by year, follow related writing, or subscribe through RSS.
- Contact is available through email, with GitHub and LinkedIn links providing further context.

## Capabilities and Constraints

Confirmed durable requirements:

- Preserve Hugo and static delivery. The existing implementation uses Tailwind CSS, TypeScript, and Hotwire; deployable output is generated in `dist/`.
- Preserve published article and case-study URLs, historical publication dates, existing article content, and original code examples.
- Keep historical posts identifiable as archived writing. Do not silently present aged technical advice as newly published guidance.
- Keep core content and navigation usable without JavaScript or WebGL. Interactive effects and demonstrations must have useful fallbacks.
- Preserve keyboard access and reduced-motion support.

Existing capabilities include case studies, a writing archive, article contents navigation, related articles, RSS, theme selection, accessible code scrolling, an Inspect measurement demonstration, and machine-readable Markdown exports.

Content conventions:

- Articles live in `content/blog/`; case studies live in `content/work/`.
- Archived posts use `archived: true`; new writing omits that flag.
- Article counts and date ranges are derived from content rather than maintained as separate claims.

## Evidence on Hand

- Case-study content in `content/work/`, with real project imagery in `assets/images/`.
- Published writing and original technical examples in `content/blog/`.
- Project summaries, roles, and dates in `layouts/partials/work.html`.
- The measurement demonstration in `layouts/partials/measurement-demo.html` and its geometry in `assets/js/measurements.ts`.
- Existing checks in `scripts/check-site.mjs` and `tests/accessibility/` for content integrity, navigation, reflow, themes, and interactive fallbacks.

Use this evidence for factual copy. Do not invent outcomes, customer endorsements, performance metrics, or claims about Devin’s responsibilities.

## Product Principles

1. Give work evaluation and reading equal standing, with direct routes into each.
2. Demonstrate expertise through specific contributions, real artifacts, and useful explanations.
3. Preserve the historical integrity of published writing and its links.
4. Keep reading and navigation usable independently of optional interactive effects.
5. Let visitors explore at their own pace, with clear exits and respect for accessibility preferences.

## Accessibility & Inclusion

Keyboard navigation, visible focus, reduced-motion behavior, and access without JavaScript are confirmed requirements. Retain semantic structure, readable reflow, and usable controls across desktop and mobile sizes. Preserve user-controlled playback for archived animations and fallbacks for unavailable graphics.

No additional audience-specific assistive-technology requirements or formal conformance target have been specified.
