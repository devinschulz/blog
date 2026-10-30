# Site search

Mode: Operate. Find writing, projects, and homepage content without leaving the current page. This is a local extension of the existing visual system.

## Direction contract

THESIS: A compact search palette that makes the query and relevant matches easy to scan. The user rejected the previous oversized form and clarified horizontal centering only.

OWN-WORLD: Preserve DM Sans and the semantic palette. Use a Raised surface, 12px corners, a subdued backdrop, a full-width borderless query field with accent focus underline. Search updates live without a submit button. Native CSS and Stimulus; no new dependencies or global tokens.

STORY: Open Search, type words, scan highlighted previews, and follow a result. The native input clear affordance remains the only clear control. Initial browse links preserve useful navigation without JavaScript.

FIRST VIEWPORT: A 42rem maximum-width palette horizontally centered with 16px side gutters, positioned 24–96px from the top according to the visible viewport height. A small title and Close precede the large query row. Results scroll beneath the fixed query within a maximum 40rem panel. Smaller titles, short excerpts, inline metadata, and independently linked topics make more results visible. The query occupies the full row at every width; its native clear affordance is the only trailing control.

FORM: Targeted redesign using the design-taste-frontend skill. DESIGN_VARIANCE 6, MOTION_INTENSITY 3, VISUAL_DENSITY 4. Existing 180ms reversible pointer entry/exit and backdrop fade; keyboard actions immediate, reduced motion a 100ms fade. Native manual popover enhanced by Stimulus. No separate search page.

FINISH: Verify desktop and narrow layouts in both themes, horizontal alignment and top placement, fixed query while results scroll, focus/dismissal, highlighting, error/retry, native clearing, Turbo history, accessibility, no-JavaScript browse links, and motion.

## Verification

`npm run check` passes. The search and header suite passes 106 browser checks with 14 platform-specific skips across Chromium and WebKit, desktop and narrow layouts, light and dark. The new assertions cover top placement, horizontal centering, the 40rem height cap, and the query remaining fixed as results scroll. Captures in `.impeccable/review/search/` show the redesigned empty, article-result, and case-study-result states; these are development evidence, not shipped imagery.

The taste pre-flight was applied to the scoped search surface: preserved brand/type, readable controls and focus, single clear affordance, functional loading/error/empty states, responsive reflow, no duplicate card chrome, and retained motion preferences. Marketing-only hero, image, and carousel rules do not apply to this search tool.

## Documentation verification

DESIGN.md records the final palette geometry, control hierarchy, result density, theme surfaces, focus and motion. README describes the fixed query and scrolling results. Search indexing, literal matching and safe highlight construction retain the existing implementation. No global tokens, unrelated header prose, content, URLs, or design sidecar were changed by this redesign.

Focus containment: Tab and Shift+Tab cycle through visible current controls, links, results, and retry. Background branches become inert only while search is open, preserving pre-existing inert state and restoring interactivity on close or Turbo cleanup. Escape returns focus to the opener.

## Screenshot refresh provenance

`.impeccable/review/search/captures.json` records 12 captures from the local Hugo preview at `http://127.0.0.1:4180`, refreshed at `2026-10-30T02:00:06.091Z`. Desktop light/dark, mobile dark, and 320px narrow light each cover empty, article-result, and case-study-result states. These captures are current after the AI workflow article deletion and the archive’s final “Writing” heading. The source retains horizontal centering near the top, live highlighting, no submit button, the native input clear affordance, focus containment, and inert background branches. Final validation reported `npm run check` and 88 relevant browser checks passing; the earlier 106-check entry describes the prior redesign verification.
