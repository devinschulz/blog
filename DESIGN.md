---
name: Devin Schulz
description: Minimal personal writing and portfolio site.
colors:
  primary: "#2449ef"
  paper: "#f5f5f3"
  ink: "#191919"
  muted: "#60635c"
  surface: "#e9eae6"
  raised: "#fff"
  line: "rgb(38 39 31 / 16%)"
  line-strong: "rgb(38 39 31 / 35%)"
  accent-soft: "#e8ecff"
  paper-dark: "#202730"
  ink-dark: "#eeefeb"
  muted-dark: "#adb7c4"
  surface-dark: "#2b3440"
  raised-dark: "#252e39"
  line-dark: "rgb(238 239 235 / 16%)"
  line-strong-dark: "rgb(238 239 235 / 36%)"
  accent-dark: "#a2b3ff"
  white: "#fff"
  code-surface: "#171a20"
  code-ink: "#eee"
  code-caption: "#b8c2d1"
typography:
  masthead:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "24px"
    fontWeight: 500
    lineHeight: 1.375
    letterSpacing: "-0.025em"
  index-title:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 500
    lineHeight: 1.375
    letterSpacing: "-0.02em"
  section-title:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  body:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.75
  navigation:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  code:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  panel: "0.35rem"
  field: "0.35rem"
  media: "6px"
  utility: "6px"
  menu: "16px"
  pill: "9999px"
spacing:
  unit: "4px"
  tight: "8px"
  control-gap: "12px"
  group: "16px"
  inset-mobile: "20px"
  inset-desktop: "32px"
  section: "48px"
  generous: "64px"
components:
  editorial-masthead:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.masthead}"
  editorial-header:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  article-row:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "9px 0px"
  code-panel:
    backgroundColor: "{colors.code-surface}"
    textColor: "{colors.code-ink}"
    typography: "{typography.code}"
    rounded: "{rounded.media}"
---

# Minimal personal site

The site uses quiet, minimal presentation throughout, including Work and case studies. A larger, bolder typography pass was rejected. Retain the existing DM Sans, neutral surfaces, blue accents, published content, images, and native navigation.

## Shared layout

Every page uses the same `.reading-shell`: a centered 704px outer shell, 20px mobile gutters, and 32px desktop gutters, giving a 640px desktop content track. Header, content, project images, and footer share its left edge. The desktop breakpoint remains 781px.

The header begins 40px from the top on mobile and 128px on desktop, with 40px / 64px before the main content. It sticks to the top of the viewport while scrolling, using the opaque page surface and 12px vertical padding. Once docked, a 1px Line separator appears along the bottom, aligned with the content column; it disappears when the header returns to its original position. The normal 68px header stays above page content; 72px document scroll padding and existing heading margins keep fragment targets visible beneath it. The brand is 16px regular type, with an attached period at the same size and no added gap. On hover, the wordmark turns blue and underlines. Desktop navigation contains Writing, Work, and About. Active and hovered navigation links share a 2px underline with a 4px offset on both desktop and mobile. Search and theme switching use 20px outline icons in shared 44px controls on desktop and mobile. A magnifying glass opens search; the theme button shows the sun to switch to light mode and the moon to switch to dark mode. Both have accessible names, native hover tooltips, and blue hover feedback. On precise hover devices, Search tilts −12° and scales to 1.12, the sun’s rays turn 22.5°, and the moon tips −16°. These 240ms transform transitions use the existing snappy easing and reverse from their current position on pointer exit. Reduced motion and touch retain color feedback without spatial motion. Desktop controls use equal 32px visual gaps between the text links and icons. Mobile controls use equal 24px visual gaps between the icons and the Menu label; Menu and its disclosure icon also turn blue on hover. Below 300px the header uses 16px side insets to retain one row. Mobile retains the native Menu disclosure, which opens immediately below the sticky header and supports Escape and outside dismissal. Targets remain at least 44px high.

The footer has no dividing rule. Copyright, navigation, and the existing site note sit in a simple vertical flow. Footer destinations include Writing, Topics, RSS, Colophon, GitHub, LinkedIn, and Email.

## Typography and color

Use self-hosted DM Sans throughout and JetBrains Mono for code and measurement values. Work, About, and Writing index titles are 20px medium; article and case-study titles are 24px medium, and section headings generally 18px medium. Body text and writing links are 16px. Avoid giant display lettering, forced headline line breaks, decorative labels, and excessive tracking.

Paper and Ink form a continuous page surface; the existing visitor-controlled dark theme uses Slate and Light Ink. Electric Blue remains the interaction accent, with Pale Electric Blue in dark mode. Titles and headings use a single text color throughout; do not accent individual words or phrases. Do not restore blue or fixed black header panels. Project screenshots and code retain their original supporting colors.

## Writing

The homepage contains a short personal introduction, a link to `/about/`, eight recent entries, and All writing. Entries show only the original publication date and title. Descriptions and reading-time labels remain available through metadata and exports where applicable rather than repeated in the index.

A single shared writing-list partial serves the homepage, archive, and topic archives. Each 44px-minimum native link contains a full ISO date in a muted 12px, tabular-numeral column and a 16px title. The columns are 88px and the remaining width, with a 16px gap. Long titles wrap naturally. There are no row borders, arrows, year headings, per-row tags, cards, or lead-story size exceptions. Existing year fragment IDs remain on the first entry of each year. Topics are available from Browse tags, article metadata, related writing, and the footer.

Articles use the shared column and a 24px headline. Headlines use normal wrapping, filling the available column before breaking instead of balancing line lengths. The header contains a return link, the original publication date, and linked topics. The visual description and reading-time row are omitted. Metadata, exports, and article bodies retain their content. A single native On this page disclosure replaces the desktop sidebar and works at every viewport width. Returning readers retain the optional Continue reading link; it never scrolls automatically and respects explicit fragment URLs and blocked storage.

Article prose is 16px at 1.75 line height. Section headings are 18px; opening paragraphs use ordinary body type. Paragraph spacing is 24px. Code and figures fit the same column, with local horizontal code scrolling, copy controls, accessible labels, and original examples preserved. Archived articles keep one inline notice explaining their historical status. Related writing uses small text links rather than a large grid.

## Work and About

Work opens with a simple 20px heading and one 16px personal paragraph: the current role at Stripe, an inline Console link, and an inline Checkout Studio link identifying earlier work. Company/date metadata, status labels, and separate project rows are omitted; the user rejected that résumé-like structure. This paragraph replaces the generic Work introduction and separate Stripe entry, so the image gallery follows directly after 32px. The role and project destinations remain sourced from `data/experience.yaml`. Cape, Warranties, and InVision form one column of actual screenshots and compact captions. Project numbering, oversized titles, decorative arrows, and overlay View project labels are removed.

Screenshot switching keeps its labeled 44px control, keyboard access, image decode recovery, and Turbo reset behavior. It never hides the primary image while loading. The measurement demo link sits beside InVision instead of in the Work introduction.

Case studies use the same column and 24px project titles in their original capitalization. Text, figures, chapter links, decisions, and reflections flow vertically. Full-size image links remain available. The Inspect measurement example keeps relationship selection, zoom, dragging, arrow keys, nudge controls, reset, cancellation, and a useful no-JavaScript fallback.

The biography lives at `/about/`, with its own navigation destination and Email, LinkedIn, and GitHub links. Work links there rather than repeating the biography. The old Work `#about` fragment lands on this link.

## Interaction

All keyboard focus remains blue. Shared controls use the existing 3px accent outline and paper separation; fixed light controls and dark code surfaces keep their contrast-specific blue values. Forced colors use system Highlight.

Search keeps the heading and query fixed while a single inner region scrolls results or browse links. The background page is locked while open and regains its original scrolling styles on dismissal or navigation. Search has one focus indicator: the form's 2px blue underline. Its input has no additional box outline or shadow and retains a blue caret. The query, result navigation, focus containment, Escape restoration, retry, and no-JavaScript browse links remain available.

On precise hover devices, plain-text links turn blue and underline. Blue text links change to Ink and use a 2px underline. Writing-list titles gain a blue, stronger underline; dates remain quiet. Project titles underline and turn blue. Image links retain their small hover scale. These states do not depend on animation and do not create sticky touch hover effects.

No graphics engine, canvas title effect, particles, water, fish, or automatic page decoration is loaded. Existing useful demonstrations and the optional Inspect mode remain. Respect reduced motion and preserve native content without JavaScript.
