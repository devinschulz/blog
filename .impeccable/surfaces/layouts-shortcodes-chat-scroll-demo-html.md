---
version: 1
slug: "layouts-shortcodes-chat-scroll-demo-html"
primary_target: "layouts/shortcodes/chat-scroll-demo.html"
related_targets: ["assets/examples/chat-scroll/ChatScrollDemo.tsx","assets/examples/chat-scroll/chat-scroll.css"]
---

# Chat scroll article demo

Mode: Read, with an interactive example inside the existing article layout.
Readers are React developers implementing streaming conversations. The user requested following a response, pausing on upward scroll, Jump to latest, and preserving the viewport on history loads. Keep Hugo, native article navigation, themes, keyboard support, and useful no-JavaScript content.

## Direction contract

THESIS: Make scroll ownership observable through a real conversation, without adding a separate app shell.

OWN-WORLD: Inherit DESIGN.md's DM Sans, Chalk/Graphite surfaces, fine rules, and prominent native controls. Use the existing accent for the latest-message action.

STORY: Start streaming, scroll up, watch the response continue without moving the reading position, then jump back. Load earlier messages while reading and retain the same visible message.

FIRST VIEWPORT: Within the article's reading track, a wrapping toolbar sits above a bounded conversation viewport; a stationary footer shows following state and Jump to latest. No automatic streaming or page scrolling.

FORM: Local extension of the existing article/demo surface; seed key: not applicable to a precisely specified local extension. Signature interaction: the viewport remains still while a response grows below it. Immediate scroll corrections, with no decorative animation.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Finish verification

Fresh finish review after the user's hover screenshot: disposition `ship`, with no material fixes remaining in the inspected article/demo scope. The primary hover now retains readable contrast in both themes. `npm run check` and 46 relevant Chromium/WebKit checks passed, including hovered contrast. Captures live in `.impeccable/review/chat-scroll/`; generated article and writing sharing cards carry their local rendering provenance.

## Documentation verification

This local extension follows PRODUCT.md's working-example, static-delivery, and accessibility requirements and DESIGN.md's existing article composition. No new global tokens are needed.

- `chat-scroll.css` uses the existing semantic ink, paper, muted, raised, surface, rule, and accent variables, so the demo follows the article's light/dark theme. Its inherited font keeps the site's DM Sans; panel/message corners reuse the established 12px media treatment.
- The bounded 26rem conversation region keeps overflow inside the example. A wrapping toolbar and stationary footer keep controls available; at 480px and below, toolbar actions stack at full width and the region reduces to 24rem.
- Labeled pill controls have 44px minimum targets. The stream action uses the incumbent solid treatment and accent hover; Jump to latest uses the semantic accent. Buttons and the focusable, named conversation region have visible inset focus outlines, including a forced-colors override.
- `ChatScrollDemo.tsx` keeps Jump to latest mounted outside the transcript, uses a normal message list, and announces mode/stream notices separately from arriving chunks. The article explains the keyboard behavior, immediate scrolling, simulated stream, and production limits; README.md records source locations, isolated React loading, Turbo cleanup, and the browser-check command.

This documentation pass inspected source evidence only; browser verification and the finish verdict belong to the implementation review. DESIGN.md and `.impeccable/design.json`, including their pre-existing user edits and sidecar drift, remain unchanged; this feature does not request a design-system refresh.
