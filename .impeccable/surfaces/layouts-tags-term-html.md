# Writing tags

Mode: Read. Readers follow an article's tags to discover related writing. This extends the established blog archive; no new visual world or token system is introduced.

## Direction contract

THESIS: Make every displayed blog tag a native link to matching posts.

OWN-WORLD: Inherit the existing blue archive stage, DM Sans, theme-aware reading surfaces, fine rules, and underlined text controls.

STORY: Follow a tag from an article, writing row, or related post; browse matching posts newest first; return through All tags or All writing.

FIRST VIEWPORT: Topic heading and count above existing year shortcuts and editorial post rows. Tags wrap independently beneath article links. The tag index is an alphabetical list with article counts.

FORM: Local extension of existing archive composition; no concept roll is applicable. Native Hugo taxonomy pages provide stable URLs, Markdown exports, and JavaScript-free navigation.

FINISH: Verify topic membership, keyboard navigation, themes, narrow layouts, and independent link targets. Preserve existing system tokens and unrelated design edits.

## Verification

`npm run check` passes, including exact membership checks for every generated tag archive and checks for Markdown exports, sitemap links, and llms.txt discovery. All 42 relevant navigation and accessibility browser checks pass across Chromium and WebKit, desktop and narrow sizes, light and dark. Captures are in `.impeccable/review/tags/`.

Finish review: disposition `ship`; no material fixes in the inspected tag index, topic archive, or linked article metadata. Documentation verification confirms this uses the existing system without new tokens.

## Documentation verification

README's Content section and DESIGN's Writing Rows guidance match the taxonomy templates and shared partials. Each tag is a separate native anchor outside the article link, with a 44px minimum height and wrapping space. Topic pages reuse the archive's year groups and writing rows; the index lists topics alphabetically with counts. Existing typography, theme colors, focus styles, and spacing are inherited, so no additional token changes are required.
