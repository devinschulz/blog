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

The homepage uses full-width DM Sans typography on an ultramarine stage. A flat editorial gallery follows, with a compact introduction and writing archive below. Project images do not animate or deform on scroll.

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

Article pages use an ultramarine title panel with the original date, topics, and reading time. Titles share the case-study hover and water response, with a continuous, antialiased text mask at rest and finer particles only around the pointer. Multiline titles use their actual text layout, while small screens, reduced motion, and unavailable graphics retain native text. The reading column includes keyboard-scrollable code blocks, semantic typography, and native section links. Longer posts have a sticky contents list on desktop and a collapsible contents list on mobile. Archive context remains visible, and related writing closes each article. Article bodies, original code, and Markdown exports are unchanged by the layout.

Case studies share an ultramarine project-name header, original outcome headline, and overlapping product screenshot. Project summaries and role details sit below the image. The header uses the same input-driven typography as the homepage, with native text for reduced motion and unavailable graphics.

The theme follows the system until a visitor chooses light or dark; that choice is stored locally. The native mobile menu supports Escape and section focus. Existing case-study and article URLs are preserved. The JavaScript source contains only the active theme, menu, GIF, and particle-surface interactions.

## Content

Articles live in `content/blog/`; case studies live in `content/work/`. Preserve historical dates and slugs. Original article assets and redirects live in `static/`; case-study images live in `assets/images/`.

Case-study images are optimized through `layouts/partials/case-study-image.html`. The article image hook preserves accessible alternative text and presents archived GIFs as single-frame PNG posters until visitors choose to play the original GIF. WebP conversion preserves animation and is unsuitable for these posters. The build check rejects animated posters; Stop, reduced motion, hidden tabs, and navigation restore the PNG.

Run `npm run build:social` to render 1200 × 630 share cards with the site’s DM Sans typography, ultramarine palette, solid resting letterforms, and real project screenshots. Static cards reflect the readable state of the interactive headers; pointer-driven particle breakup remains on the website. Every article gets a dedicated card using its full title, original publication year, and topics from the content frontmatter; the archive keeps its “Thinking out loud” card. Re-run this command after changing article titles or adding posts. Hugo converts these exports to JPEG and publishes content-hashed URLs for Open Graph and Twitter metadata. Metadata, structured data, and sharing images are generated by `layouts/partials/seo.html` and `layouts/partials/social-image.html`. RSS remains limited to the historical writing archive.

Machine-readable content is generated by Hugo: `/llms.txt`, `/index.md`, `/blog/index.md`, all 16 article Markdown pages, and all three case-study Markdown pages. Case studies include their full prose, captions, original image links, and attribution. Archived articles retain their original dates and code examples, with an archive notice. `npm run check` verifies every exported Markdown page and its local links.
