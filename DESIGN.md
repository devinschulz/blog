---
name: Devin Schulz
description: A precise, confident, quietly playful interactive portfolio.
colors:
  primary: "#2449ef"
  primary-ink: "#1d3dce"
  paper: "#f5f5f3"
  ink: "#191919"
  muted: "#60635c"
  surface: "#e9eae6"
  raised: "#fff"
  line: "rgb(38 39 31 / 16%)"
  line-strong: "rgb(38 39 31 / 35%)"
  accent-soft: "#e8ecff"
  paper-dark: "#1a1b19"
  ink-dark: "#eeefeb"
  muted-dark: "#a8aca3"
  surface-dark: "#282b25"
  raised-dark: "#22251f"
  line-dark: "rgb(238 239 235 / 16%)"
  line-strong-dark: "rgb(238 239 235 / 36%)"
  accent-dark: "#a2b3ff"
  white: "#fff"
  code-surface: "#171a20"
  code-ink: "#eee"
  code-caption: "#b8c2d1"
typography:
  display:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.065em"
  article-title:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.04em"
  archive-title:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  title:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  body:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  article-body:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.8
  navigation:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
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
  project: "10px"
  media: "12px"
  utility: "6px"
  menu: "16px"
  stage-mobile: "18px"
  stage-desktop: "24px"
  contact: "30px"
  pill: "9999px"
spacing:
  unit: "4px"
  tight: "8px"
  control-gap: "12px"
  group: "16px"
  inset-mobile: "20px"
  section-detail: "24px"
  inset-desktop: "32px"
  reading-start: "40px"
  section: "48px"
  generous: "64px"
  major: "96px"
components:
  button-solid:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "0px 20px"
  button-solid-hover:
    backgroundColor: "{colors.primary}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0px 20px"
  contact-on-blue:
    backgroundColor: "{colors.white}"
    textColor: "{colors.primary-ink}"
    typography: "{typography.navigation}"
    fontSize: "14px"
    rounded: "{rounded.contact}"
    padding: "0px 20px"
  project-preview-toggle:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0px 16px"
  select-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "0px 12px"
  navigation:
    textColor: "{colors.ink}"
    typography: "{typography.navigation}"
  article-row:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "16px 0px"
  contents-disclosure:
    textColor: "{colors.ink}"
    padding: "4px 0px"
  code-panel:
    backgroundColor: "{colors.code-surface}"
    textColor: "{colors.code-ink}"
    typography: "{typography.code}"
    rounded: "{rounded.media}"
  code-copy:
    backgroundColor: "transparent"
    textColor: "{colors.code-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.utility}"
    padding: "0px 6px"
---

# Design System: Devin Schulz

## Overview

**Creative North Star: "The Interactive Portfolio"**

Present real work with playful, tactile interactions. The atmosphere is precise, confident, and quietly playful: expressive typography makes the first impression, while measured spacing, practical controls, and clear reading structure sustain it. Product imagery and engineering demonstrations supply the detail.

The user-confirmed direction is subtly layered surfaces, with shadows used more broadly to separate panels, and bold, expressive, prominent controls. The current implementation uses shadows selectively and still contains compact navigation and utility controls. These preferences guide future refinements; this document does not claim that broader elevation or larger controls have already been implemented.

**Key Characteristics:**

- Electric Blue stages with crisp, high-contrast lettering.
- Chalk and Graphite reading surfaces that adapt to the selected theme.
- Large, tightly tracked display typography paired with comfortable prose.
- Open editorial rows, real interface imagery, and fine separating rules.
- Input-driven tactile effects with readable native fallbacks.

This is an extraction of the implemented system plus the confirmed direction above. Frontmatter records existing token values; responsive exceptions and behavior are described below. No additional visual anti-references were specified. Reference format: [DESIGN.md specification](https://raw.githubusercontent.com/google-labs-code/design.md/main/docs/spec.md).

## Colors

Electric Blue gives the site its strongest visual identity; Chalk and Graphite provide the quieter surfaces that carry reading and evaluation.

### Primary

- **Electric Blue** (`primary`): the fixed blue of homepage, article, archive, case-study, and contact stages. These stages retain their blue background in both themes.
- **Deep Electric Blue** (`primary-ink`): text on the white contact control inside the homepage stage.
- **Soft Blue** (`accent-soft`): the light-theme supporting accent surface.
- **Pale Electric Blue** (`accent-dark`): links, selected content, and fine accents on dark neutral surfaces. It does not replace the stage background.

### Neutral

- **Chalk** (`paper`): the light page background; **Graphite** (`paper-dark`) is its dark-theme counterpart.
- **Ink** (`ink`) and **Light Ink** (`ink-dark`): primary text on the corresponding page surfaces.
- **Muted Ink** (`muted`, `muted-dark`): captions, dates, and secondary information.
- **Inset Surface** (`surface`, `surface-dark`) and **Raised Surface** (`raised`, `raised-dark`): supporting containers and controls.
- **Fine Rule** (`line`, `line-dark`) and **Strong Rule** (`line-strong`, `line-strong-dark`): low-contrast separators and stronger control boundaries. Preserve the source alpha-based values.
- **White** (`white`): lettering and controls on blue stages.
- **Code Surface**, **Code Ink**, and **Code Caption**: the dedicated dark code treatment, retained in both themes. Syntax colors remain defined in `assets/css/syntax.css`.

Dark mode also maps the supporting accent surface to `surface-dark`. The CSS aliases `night` and `ivory` reuse Ink and White. Unused success, danger, and processing declarations are not promoted into the documented core palette.

The companion file’s tonal ramps are generated swatch previews, not additional shipped theme tokens.

**The Two Blue Roles Rule.** Keep the fixed blue stage separate from the theme-aware link accent. On a blue stage, use white content and white focus treatment; on a neutral surface, use the current semantic accent.

## Typography

**Display and Body Font:** DM Sans, with Arial and sans-serif fallbacks.

**Code and Measurement Font:** JetBrains Mono, with ui-monospace and monospace fallbacks.

Both active families are self-hosted. Bricolage Grotesque and Hanken Grotesk font files remain available, but are not the active display/body system. The scale is fluid and role-specific rather than a single modular ratio. Fluid display roles deliberately omit `fontSize` in frontmatter; their actual responsive formulas are recorded here.

### Hierarchy

- **Homepage display:** medium weight (500), tracking (-0.065em), line height (1.02 mobile; 1 desktop). Mobile uses `clamp(36px, 11cqw, 116px)`; desktop uses `10.5cqw`, capped through `clamp(60px, 10.5cqw, 176px)` at widths of 1100px and above. At the sampled 1280px viewport, the rendered size was about 124px.
- **Case-study display:** uppercase, medium weight (500), tracking (-0.075em), line height (1). Its size responds to the project name: Cape, Warranties, and InVision have separate container-relative formulas in `layouts/partials/case-study-header.html`. Do not copy one project’s formula to every title.
- **Archive display:** medium weight (500), tracking (-0.04em), line height (1.02). Mobile uses `clamp(32px, 10cqw, 44px)`; desktop uses `clamp(48px, 6cqw, 88px)`.
- **Article headline:** medium weight (500), tracking (-0.04em), line height (1.06 mobile; 1.04 desktop). Mobile uses `clamp(30px, 7.8vw, 40px)`; desktop uses `clamp(40px, 4.7vw, 72px)`, with a maximum measure of 26ch.
- **Archive row title:** regular weight (400), tracking (-0.03em), line height (1.2). Mobile size is 20px; desktop uses `clamp(24px, 2vw, 32px)`.
- **Interface body:** regular weight (400), 15px mobile and 16px desktop, line height (1.5). Case-study summaries and introductory copy use their established larger sizes.
- **Article body:** regular weight (400), 17px mobile and 18px desktop, line height (1.8). Direct prose, lists, quotations, and headings are capped at `min(68ch, 38rem)`. The opening paragraph is larger (20px mobile; 23px desktop) with line height (1.65).
- **Labels and navigation:** DM Sans, generally 12–14px. Desktop main navigation uses 13px; mobile menu destinations use 28px. Project roles, dates, indices, preview controls, and footer details use a 12px minimum. Primary contact controls use 14px text.
- **Code:** JetBrains Mono (13px), line height (1.7). Mono is also used for measurements, select data labels, and small numeric annotations.

Headings generally balance their wrapping, while paragraphs use pretty wrapping. The homepage’s manually composed headline is an explicit exception. Existing large-display tracking is part of the incumbent design; it is not a blanket tracking value for prose or controls.

**The Reading Measure Rule.** Keep prose within its narrower measure while allowing code and figures the wider article track. Increasing the display scale must not increase the body line length.

## Layout

The system combines near-full-width blue stages with inset editorial content. Mobile blue stages sit 8px from the viewport edge; desktop stages use 16px. Their inner horizontal padding is generally 20px mobile and 32px desktop. Main editorial content uses 20px side gutters on mobile, 32px at desktop, and 48px from 1100px upward.

The main responsive breakpoint is 781px. Additional local breakpoints at 500px, 1100px, 1500px, and 1600px handle measurement controls, wider metadata arrangements, case-study imagery, and large type. These are implementation breakpoints, not five independent layout systems.

- **Portfolio gallery:** work numbering follows the visible sequence: Stripe 01, Cape 02, Warranties 03, and InVision 04. The gallery is stacked on mobile; a two-column desktop grid (1.1fr / 1fr), with the first project spanning both columns. The gallery gap is 64px horizontally and 96px vertically. The main gallery and broad editorial sections cap at 1600px.
- **Article track:** maximum outer width (1280px), with a desktop contents column and a main track capped at 760px. The contents column is at least 160px wide; the column gap is 56px, increasing to 96px from 1100px. Actual prose caps at 608px under the default root size.
- **Writing archive:** a single left-aligned “Writing” heading that wraps naturally, followed by year-grouped editorial rows and a compact year shortcut list. The stage pairs its introduction with the derived article count and date range. Rows use 16px vertical padding on mobile and 24px on desktop. The mobile date/title/arrow columns are 56px, flexible space, and 20px, separated by 12px gaps.
- **Case-study cover:** overlaps the blue stage by 40px mobile and 72px desktop. Its narrower width and restrained shadow create a real layered relationship.

Spacing uses Tailwind’s 4px base with deliberate local exceptions. Tight intervals connect labels and controls; larger intervals separate projects, chapters, and major sections. Article and archive introductions intentionally use a smaller scale than the homepage and case-study display treatments.

DOM order remains the reading and focus order. Narrow layouts stack rather than hide core content. Display text must reflow at increased text size; code overflow stays inside its own keyboard-accessible region.

## Elevation & Depth

**Confirmed direction:** subtly layered surfaces, with shadows used more broadly to separate panels. Use the existing offset, softly blurred shadow vocabulary when future changes introduce meaningful panel relationships. Keep readable boundaries and theme contrast; broader shadow use does not mean shadowing every archive row.

**Implemented baseline:** broad reading and gallery surfaces are mostly flat. Depth currently comes from tonal changes, blue/neutral contrast, a small set of real overlaps, and shadows on menus, project covers, and Inspect. No additional elevation levels are claimed as implemented.

### Shadow Vocabulary

- **Menu lift:** `0 12px 24px #0002`, used under the mobile navigation panel.
- **Project cover lift:** `0 16px 40px #00000012`, used beneath the overlapping case-study cover.
- **Inspect lift:** `0 8px 40px #0003`, used beneath the temporary Inspect panel.

**The Legible Layer Rule.** Use elevation to explain a panel relationship. Preserve offset and soft blur, and pair it with a distinct surface and sufficient contrast in both themes.

## Shapes

Broad blue stages have generously rounded corners (18px mobile; 24px desktop) and clip their graphics to the same outline. Project artwork uses a tighter 10px radius. Code panels, case-study media, and Inspect use 12px corners; the mobile menu uses 16px.

Primary action buttons and chapter links use full pill shapes. The code-copy utility uses a compact rectangle with 6px corners. The header contact control uses a 30px radius. Measurement fields and generic framed media use the small `field` and `panel` radii (0.35rem). The form language stays geometric and direct; fine one-pixel rules distinguish editorial groups without turning every group into a card.

## Components

**Confirmed character: bold and expressive, with prominent controls.** Existing pills, contact links, directional marks, and the large footer action provide the base. Some current navigation and utility controls are visually compact; stronger prominence is a direction for future work, not an instruction to silently resize the current site during documentation.

### Buttons and Contact Actions

- **Solid pill:** Ink background, Chalk text, horizontal padding (20px), minimum height (44px). Hover adopts the semantic accent. The error-page archive action is the canonical example.
- **Outline pill:** transparent background, Ink text, Strong Rule boundary, the same padding and minimum height. Hover strengthens the border to the current text color. Used for chapter shortcuts.
- **Contact on blue:** White background with Deep Electric Blue text, horizontal padding (20px), minimum height (44px), and a directional arrow. Neutral-page contact uses the outlined treatment.
- **Compact control:** 12px text, 16px horizontal padding, an 8px icon gap, pill shape, and minimum height (44px). Make waves, project preview controls, and animation playback share this spacing; their surfaces follow their context. Measurement nudge buttons use 44px square targets.
- **Project preview toggle:** White surface, Ink text, subtle fixed dark border, and the compact control spacing. Hover uses the existing pale preview tint (`#f0f2ff`). The alternate view is explicitly selected with a button; hover does not change the project screen.

The global focus treatment is a 3px outline with 4px offset and a 3px surface-colored ring. Blue stages use white outlines with blue ring separation. Project preview toggles use the same geometry with a dark outline and white ring against the artwork. Code-copy controls and keyboard-scrollable code use a white 2px outline inset by 3px, without an outer ring, so panel clipping does not hide focus in either theme. Forced colors use the system Highlight color.

Navigation arrows come from `layouts/partials/arrow-icon.html`: a 20px view box, 1.5px stroke, and round caps and joins. Use 16px arrows for text links, 20–32px for editorial rows, and relative sizes for display lettering. The measurement-demo link keeps an 8px gap between its text and arrow.

### Navigation and Disclosures

Desktop navigation is a horizontal set of small, labeled text links with generous clickable height (at least 44px), a hover underline, and an underline for the current Work or Writing section. Main navigation goes directly to the complete writing archive.

Mobile navigation uses native details/summary. Menu and the theme toggle remain transparent text controls with at least 44px-high targets; they have no pill fill. The brand and Menu label stay on one line. Below 360px, the header uses 16px horizontal padding and a 20px brand with its period kept adjacent to the name. The menu panel has a Strong Rule boundary, Paper background, 24px padding, Menu lift, and 28px destination labels with 56px minimum link height. Its plus changes to a minus when open. Escape closes the menu and returns focus to the trigger.

Article contents use a sticky desktop list or a mobile disclosure. The current section is identified with the semantic accent, underline, and `aria-current="location"`. In-page contents and year shortcuts use native fragment navigation.

Longer articles can offer a returning reader a “Continue reading” link above the body. A small bookmark outline and muted label introduce the actual section title as a 44px-high native link. Desktop adds a Fine Rule below; mobile uses the contents disclosure’s own divider, with a tighter 16px gap to avoid double rules. It appears only when a valid later section was saved locally, never scrolls automatically, and yields to a direct fragment URL. Following it hides the prompt and moves keyboard focus to the heading. Finishing the article clears the place; blocked storage leaves the prompt hidden. Keep this response quiet and immediate, without an animated entrance or celebration.

### Writing Rows

Writing rows are separated by Fine Rules. The date, title, and arrow share the article link; each underlined tag is an independent link below it, with a 44px target and room to wrap. The date is secondary, the title leads, and the arrow occupies its own column. Hover changes the title and arrow to the semantic accent and underlines the title; the arrow moves by only 2px in each direction over 200ms when motion is permitted. Tag archives reuse the year groups and writing rows, while the tag index lists topics alphabetically with article counts.

### Project Imagery and Panels

Real interface screenshots dominate project previews. Frames clip to the project radius, retain their source-specific supporting backgrounds, and have caption groups for project name, contribution, and period. The first project has more space; subsequent projects share the paired grid. Do not replace these artifacts with generic illustrations.

Case-study images link to the full-size original. Their small hover scale (1.012 over 500ms) is independent of the gallery’s pointer lens. The gallery keeps screenshots fixed during scrolling; fine-pointer lens feedback is temporary and input-driven.

### Inputs and Fields

The measurement example uses a native select and range input. The select has a Paper surface, Strong Rule border, Field radius, horizontal padding (12px), 16px text, and minimum height (44px). Labels stay visible. The range uses the semantic accent and an adjacent monospace output. Do not infer a broader form/error design system from these two controls.

### Code Panels

Code stays on its own dark surface in both themes. The panel has a subtle white-alpha border, Media radius, a small language caption, and 20px code padding on mobile or 28px desktop. Code is labeled and keyboard-scrollable. Left/Right arrow keys move overflowing code in 40px steps when the code region itself has focus, including on mobile Safari. Modified keys retain their normal behavior. A horizontal-scroll hint appears only when overflow exists; the page itself must not overflow.

The caption reserves a minimum height of 44px and includes a compact Copy utility when the Clipboard API is available. Its visible rectangle has a minimum size of 72px by 28px, with 6px corners, 6px horizontal padding, 12px glyphs, a white 15% boundary, and a white 10% hover fill. Labels stay on one line and the frame can expand for enlarged text. The surrounding transparent button keeps a 44px-high pointer and keyboard target. A successful copy replaces the clipboard glyph with a check and the label with “Copied” for two seconds. A status message announces success; a failed copy exposes a manual-copy instruction and a Retry label. Temporary feedback and pending clipboard results are cleared before Turbo history snapshots. Feedback is static, the code’s whitespace is preserved, and no celebration delays the action. Without JavaScript or Clipboard API support, the control stays hidden and code retains native selection and scrolling.

### Blue Stages and Tactile Feedback

Native heading text is the accessible content. On supported desktop graphics, continuous lettering can dissolve locally under pointer input, then return through damped motion; background water effects share that input. Small screens preserve native text, and reduced motion or unavailable graphics preserve readable native content without the decorative graphics path.

The opt-in Make waves mode has an explicit exit. Project screens change through the labeled preview button. The logo counter is a small, temporary response; Inspect is a dormant tool until deliberately revealed. None of these effects should obstruct reading, scrolling, keyboard navigation, or browser zoom.

Page navigation uses a 160ms fade over an opaque previous page, with the existing snappy easing. Reduced motion uses an immediate swap. Motion pauses or settles when input stops, when offscreen, or in hidden tabs, and graphics resources are released on navigation. Easing and duration metadata live in `.impeccable/design.json`; they are not invented top-level frontmatter groups.

### Site Search

Search uses a native manual popover enhanced by a Stimulus controller, opened from the shared header or mobile menu. The compact palette is horizontally centered near the top of the visible viewport, with an inset of 12% of its height bounded to 24–96px. It caps its width at 42rem, keeps 16px side gutters, and caps its overall height at 40rem or the available viewport space. The query stays visible above an independently scrolling results region. Visual-viewport updates account for the mobile keyboard. The panel uses Raised/Ink surfaces, a Strong Rule boundary, 12px corners, DM Sans, a local soft shadow, and a subdued backdrop.

A small Search the site heading labels a full-width borderless query field. Results update as the visitor types, so no submit button is shown. The accent underline indicates input focus; other controls retain the existing focus treatment. The field’s native clear affordance is the only clear control. Results use 20px titles (18px below 500px), 14px excerpts limited to two lines (three on narrow screens), and inline metadata and topic links. Literal matches use the semantic accent and supporting accent surface; forced colors use system Highlight and HighlightText. Initial browse links sit in a quiet footer row.

Pointer opening and closing use a reversible 180ms fade with a small upward translation (6px) and scale (0.97), using the existing snappy easing and a top-center origin. The backdrop fades with the panel. The native top layer stays open until the exit completes. Keyboard opening and dismissal are immediate; reduced motion keeps only a 100ms fade. Close and Escape restore focus to the opener, with the mobile Menu summary serving as the return target. Tab and Shift+Tab cycle through the currently visible controls and links, including live results and retry. The rest of the page is inert while search is open; dismissal and Turbo cleanup restore its prior interactivity. Outside presses dismiss without taking focus back. Without JavaScript, native browse links remain available inside the popover.

## Do's and Don'ts

### Do:

- **Do** preserve Electric Blue stages and theme-aware Chalk/Graphite reading surfaces as distinct roles.
- **Do** use DM Sans for active display/body typography and JetBrains Mono for code and measurement details.
- **Do** preserve compact reading headers, the narrower prose measure, and the wider code/figure track.
- **Do** make primary controls prominent while retaining clear labels and accessible target sizes.
- **Do** use the existing soft, offset shadows to express meaningful panel layering in future refinements.
- **Do** keep pointer effects optional, interruptible, and backed by readable native content.
- **Do** use real project imagery and retain caption, focus, and full-size-image behavior.

### Don't:

- **Don't** replace the fixed blue stage color with the dark-theme link accent.
- **Don't** turn editorial article rows into a generic repeated card grid.
- **Don't** apply homepage or case-study display scale to every reading header.
- **Don't** widen prose merely because the code track has more room.
- **Don't** change project screens on hover or deform project imagery on scroll.
- **Don't** hide essential content or navigation behind JavaScript, WebGL, or motion effects.
- **Don't** describe the confirmed preference for broader shadows and prominent controls as if that refinement had already shipped.
