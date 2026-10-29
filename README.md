# Devin Schulz

Personal portfolio built with Hugo, Tailwind CSS v4, TypeScript, and Hotwire.

## Development

```sh
npm ci
npm run serve -- --destination /private/tmp/devin-blog-preview
```

Hugo serves the site at http://localhost:1313 and rebuilds templates, styles, and scripts as files change. A separate preview destination prevents the development server from overwriting the production files used by browser tests.

## Build and verify

```sh
npm run check
npm run check:a11y
```

`check` runs TypeScript, builds the site, and verifies metadata, links, assets, RSS, sitemap, and redirect mappings. `check:a11y` audits every page for accessibility and text reflow in desktop and narrow viewports, in light and dark themes. It also checks the project gallery, theme persistence, keyboard navigation, archived GIF controls, and navigation without JavaScript.

Deploy `dist/`, produced by `npm run build`. Production builds clean retired generated files from this directory so old script bundles are not carried into the deployment. Hugo compiles Tailwind and bundles TypeScript through `js.Build`, then fingerprints production assets. No separate frontend framework or bundler is needed.

## Design and interactions

The homepage uses full-width DM Sans typography on an ultramarine stage. A flat editorial gallery follows, with a compact introduction and writing section below. Project images do not animate or deform on scroll.

The opening headline is “Making complex software feel simple.” It introduces the product interfaces I build and links directly to selected work and the InVision measurement example. The About section describes my approach to design and engineering, with a link to recent writing. Project descriptions name the actual interfaces and contributions, and the contact footer uses a neutral invitation to compare notes.

Selected Work begins with Stripe, listing Checkout Studio followed by Console as the current team. The shared facts live in `data/experience.yaml` and appear in both the homepage and its Markdown export. This entry describes the confirmed role and team sequence; the three illustrated case studies follow it.

Supporting labels and project metadata use a 12px minimum. Navigation arrows share `layouts/partials/arrow-icon.html`; compact controls share 44px targets, 16px horizontal padding, and 8px icon gaps. Menu and theme controls keep transparent backgrounds. On narrow screens the hero's bottom links stack so the larger labels fit comfortably.

The InVision case study includes a small SVG measurement example built with a Stimulus controller. Visitors can compare separated, overlapping, and contained layers, then change display zoom without changing the design-pixel measurements. The blue layer can be dragged, moved one pixel with arrow keys (ten with Shift), or nudged with tap controls. Distances and relationship explanations follow its position; Reset restores the starting layer, and Escape cancels a drag. Only the layer captures touch gestures, leaving the rest of the page scrollable. Geometry is independent of rendering in `assets/js/measurements.ts`. Native select and range controls support touch and keyboard input; without JavaScript, the annotated 60px example and its explanation remain visible. Browser tests cover movement, bounds, zoom invariance, accessibility, and fallback in Chromium and iPhone WebKit. The example illustrates the documented approach rather than reproducing the original Inspect engine.

Inspect mode is a hidden look at the actual page layout. Type `inspect` outside an editable field, or tap the logo five times, to reveal it. Move, tap, or focus a page control to inspect its size, padding, margin, typography, and text color; Parent selects its container. Escape or Done closes the panel. A normal single logo click still goes home, and scrolling and browser zoom remain available. The mode temporarily pauses decorative graphics to expose the native elements, then restores them according to the motion preference. Navigation closes Inspect before a Turbo snapshot is saved. It creates no overlay, observers, or render loop until activated, and removes them on exit. The keyboard-triggered interface updates instantly without animation.

Logo clicks also launch a small bouncing `+1`, `+2`, and so on, styled as monospace superscripts above the logo's period. Each click gets its own count. The tally lasts through Turbo navigation and resets on a full reload. Opening Inspect clears the feedback and pauses counting; after exiting, the next click starts at `+1`. Clicking the logo while already home returns to the top without replacing the page or restarting Make waves. Keyboard navigation keeps its regular link behavior; reduced motion shows one static count without the bounce. Feedback is removed before navigation snapshots are saved.

WebGL is embedded in the blue opening and contact panels. Inspired by the water and physical typography at jithinrp.com, all blue-panel headings use continuous, antialiased lettering at rest. Moving or pressing the pointer dissolves only the nearby area into fine particles; damped springs return them to the solid letterforms. The homepage, writing archive, article and case-study titles, and contact footer share this treatment. Ripple trails and caustic highlights respond in the blue background. On small screens, native text stays crisp while touch drives the water response. Project images stay fixed in their layout; pointer exploration gently magnifies the current screen through a refractive lens.

The shared homepage, writing archive, article, and case-study bundle uses:

- `assets/js/spatial-page.ts` for navigation and motion preferences.
- `assets/js/spatial-field.ts` for one render-on-demand pointer model.
- `assets/js/spatial-title.ts` for raster-mask particle generation, spring physics, and water shaders.
- `assets/js/liquid-type.ts` for the opt-in “Make waves” mode. A small GPU flow field bends the actual headline and blue highlights together as visitors drag. The ink settles after release; Done or Escape restores the normal hero. Touch scrolling is only captured inside the hero while this mode is active. Reduced motion and unavailable graphics keep the native page and hide the control.
- `assets/js/project-lens.ts` for Selected Work. Each project has two real screens, with an “Another view” button that works with touch, keyboard, reduced motion, and unavailable WebGL. Fine pointers can inspect the current image through a small liquid magnifier; only the button switches screens. The magnifier clears around controls and keyboard focus. Graphics and secondary images load on interaction, settle when input stops, hide on scroll, and dispose on navigation. Project links remain native links to their case studies.

Motion settles after input stops and pauses outside the viewport or in hidden tabs. Reduced motion uses native text without creating WebGL contexts. The same content remains available without JavaScript or WebGL, and returns immediately if the graphics context is lost. Resources are disposed on navigation.

Display type sizes follow the available panel width and can wrap when text is enlarged. Particle masks use the text's actual line boxes and refresh their layout and pixel density on resize or zoom. The contact arrow has its own space and moves onto another line when needed. Browser checks cover a 200% desktop zoom viewport and doubled text, including the rendered particle lines.

`layouts/partials/work.html` contains the project data. Layout, typography, responsive states, and WebGL canvas positioning use Tailwind utilities directly in the Hugo templates and TypeScript. `assets/css/site.css` contains Tailwind imports, semantic theme tokens, shared utilities, and global accessibility defaults. Fonts are self-hosted in `static/fonts/`. The favicon uses a white lowercase “d.” on ultramarine; `npm run build:icons` regenerates its 16/32/48px ICO, 16/32px PNG fallbacks, 180px Apple touch icon, and Safari pinned-tab mask from `static/favicon.svg`. Icon links use content-hashed filenames so new versions receive new URLs.

The writing archive shares the homepage’s ultramarine panels, interactive particle typography, and open editorial rows. Original article dates and topics remain visible, with an RSS link above the list.

Writing in the shared navigation opens the full archive directly and marks the current section. The archive groups posts by year with native year shortcuts and compact dated rows. Article and archive headers use a smaller type scale and tighter spacing to bring reading choices and prose into the opening viewport. Article prose is capped at 68ch or 38rem, while code and figures keep the wider reading track. Contents links use native fragment navigation and highlight the current section; expanded menu and contents controls show a minus. Code captions indicate horizontal scrolling only when the block overflows. More writing ranks shared topics first, with publication recency breaking ties.

Technical examples have a Copy control when the Clipboard API is available. It copies the code with its original whitespace, confirms with a static check and “Copied” label, and announces success to assistive technology. Clipboard denial leaves a manual-copy instruction and a retry action. Without JavaScript or clipboard support, code remains selectable and keyboard-scrollable. Copy controls and code regions use an inset white focus outline in both themes. The Stimulus controller clears temporary feedback and pending clipboard results before Turbo history snapshots and on navigation.

Articles with contents and a reading time of at least five minutes remember the last section reached beyond the first section. Returning readers get a quiet “Continue reading” link above the article body; following it moves both the reading position and keyboard focus to the section. Direct fragment links take precedence, and reaching the end clears the place. Only the section identifier is stored in the visitor’s browser, scoped to the article URL, when leaving the article or hiding the tab. Blocked storage and missing sections leave normal reading intact.

Article pages use an ultramarine title panel with the original date, topics, and reading time. Titles share the case-study hover and water response, with a continuous, antialiased text mask at rest and finer particles only around the pointer. Multiline titles use their actual text layout, while small screens, reduced motion, and unavailable graphics retain native text. The reading column includes keyboard-scrollable code blocks, semantic typography, and native section links. Longer posts have a sticky contents list on desktop and a collapsible contents list on mobile. Archive context remains visible on historical posts, and related writing closes each article. Article bodies, original code, and Markdown exports are unchanged by the layout.

Case studies share an ultramarine project-name header, original outcome headline, and overlapping product screenshot. Project summaries and role details sit below the image. The header uses the same input-driven typography as the homepage, with native text for reduced motion and unavailable graphics.

The theme follows the system until a visitor chooses light or dark; that choice is stored locally. An inline script resolves the theme before styles load, with system defaults when storage is unavailable. Inline canvas and body colors prevent a light background during loading, and CSS follows the system without JavaScript. Safari's toolbar color follows the page and chosen theme. Theme regressions run in Chromium and iPhone WebKit; install both with `npx playwright install chromium webkit` before running the browser checks. Turbo and supported full-page navigations use native view transitions: the old page stays opaque while the new page fades over it in 160ms. Reduced motion uses an immediate swap, and browsers without view transitions retain normal navigation. The native mobile menu supports Escape and section focus. Existing case-study and article URLs are preserved. The JavaScript source contains only the active theme, menu, GIF, and particle-surface interactions.

## Content

Articles live in `content/blog/`; case studies live in `content/work/`. Preserve historical dates and slugs. Historical posts have `archived: true` in their frontmatter; omit this field for new writing. Date ranges and article counts are derived from the posts. Original article assets and redirects live in `static/`; case-study images live in `assets/images/`.

Case-study images are optimized through `layouts/partials/case-study-image.html`. Display images, full-resolution image links, and Markdown image exports use WebP; source PNGs and JPEGs remain in `assets/` without being published as project downloads. The article image hook preserves accessible alternative text and presents archived animations as single-frame WebP posters. Posters are flattened through PNG before WebP encoding, while the playback source is an animated WebP. The original GIF remains available through its explicit download link. The build check verifies both formats and rejects animated posters; Stop, reduced motion, hidden tabs, and navigation restore the still WebP.

Both active font families are preloaded from HTML, so JetBrains Mono does not wait for stylesheet discovery. The shared page template emits Cloudflare's `email_off` comments around the body to keep the public contact links working without its injected email-decoding script. Verify the Cloudflare response after deployment, since local builds do not run its HTML rewriting.

Run `npm run build:social` to render 1200 × 630 share cards with the site’s DM Sans typography, ultramarine palette, solid resting letterforms, and real project screenshots. Static cards reflect the readable state of the interactive headers; pointer-driven particle breakup remains on the website. Every article gets a dedicated card using its full title, original publication year, and topics from the content frontmatter; the archive keeps its “Things I’ve learned” card. Re-run this command after changing article titles or adding posts. Hugo converts these exports to JPEG and publishes content-hashed URLs for Open Graph and Twitter metadata. Metadata, structured data, and sharing images are generated by `layouts/partials/seo.html` and `layouts/partials/social-image.html`. RSS includes all blog posts, with the newest writing first, and excludes case studies.

Machine-readable content is generated by Hugo: `/llms.txt`, `/index.md`, `/blog/index.md`, all article Markdown pages, and all three case-study Markdown pages. Case studies include their full prose, captions, full-resolution WebP image links, and attribution. Archived articles retain their original dates and code examples, with an archive notice. `npm run check` verifies every exported Markdown page and its local links.
