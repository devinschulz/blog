# Accessibility checks

## Automated

```sh
npm ci
npx playwright install chromium
npm run check:all
```

`check:a11y` builds the production site and starts an isolated local test server. It runs axe WCAG A/AA checks (including available WCAG 2.2 rules) on every generated HTML page in light and dark mode at 1440px and 320px. It also checks text-spacing overrides, heading clipping, keyboard navigation, filters, the demo workflow, motion preferences, GIF controls, forced-color focus indicators, and no-JavaScript fallbacks.

For an existing Chrome installation, `PLAYWRIGHT_CHANNEL=chrome npm run check:a11y` avoids downloading Chromium. Tests use a fresh browser profile, not your personal browsing session. Failure screenshots and traces are in the ignored `test-results/` directory; run `npx playwright show-report` for the report.

## Manual checks before release

Automated checks are not a conformance certification and do not replace assistive-technology testing.

- With VoiceOver + Safari and NVDA + Firefox/Chrome, navigate by headings and landmarks. Check the skip link, menu, archive filter announcements, input error description, saving status, and restart. Confirm announcements are helpful rather than duplicated.
- Use only Tab, Shift+Tab, Enter, Space, and Escape. Confirm focus is visible and never trapped or hidden, including screenshot links, menu items, and demo controls.
- At actual 200% and 400% browser zoom, check every template for clipped text, overlaps, and lost controls. The automated 320px test approximates reflow, not actual browser zoom or text-only zoom.
- Test increased default font size and OS text scaling on a real phone. Screenshots and code may scroll within their own region; ordinary page content should not require sideways scrolling.
- Check light/dark themes and Windows High Contrast. Review focus indicators against moving artwork and colored surfaces.
- Change the OS reduced-motion preference while the page is open. It must stop decorative WebGL motion, cursor response, smooth scrolling, and GIF playback. Motion follows the system preference only; there is no site-level toggle or stored override.
- Review alt text and adjacent descriptions for meaningful screenshots. Preserve historical writing, but describe information that a screenshot alone would otherwise convey.

## Implementation notes

- Focus uses a two-tone ring with a system-color outline in forced-colors mode.
- State Shift is a client-only demo, not an account form. No entered data is submitted or saved. Its Keyboard state uses a dashed preview border; actual focus uses the shared ring. Saving is simulated and finishes automatically.
- GIFs render a static WebP by default. Playback is opt-in, with a Stop animation control and a clearly labeled original-file link.
- The Three.js hero renders a still tile sculpture with reduced motion, pauses offscreen and in hidden tabs, and falls back to an SVG illustration if WebGL is unavailable or its context is lost. Its decorative canvas is hidden from assistive technology.
- Turbo drives navigation, so most page changes do not reload the document. Mobile-menu links that point at a section of the page already open are handled in the menu controller rather than by Turbo: Turbo would treat them as a visit, re-render the body, and drop the focus that sends a keyboard user into the section.
- Every WebGL surface shares one harness in `assets/js/webgl-surface.ts`, so all of them pause offscreen and in hidden tabs, hold a still frame for reduced motion, hide in forced colors, and recover from a lost context. All are `aria-hidden` decoration. The home page carries six: the hero, the states lattice, the State Shift field and one per work screenshot; the 404 page carries a scattered lattice. None of them sits under text.
- The hero unfolds with scroll only when motion is allowed; with reduced motion it holds one still frame whatever the scroll position.
- The State Shift field redraws a still frame for each demo state under reduced motion, so the artwork never contradicts the panel. The panel's state is announced by its own live region, not by the artwork.
- Work screenshots: keyboard focus gets the same lift as the pointer, centred on the image, and the link keeps its focus ring. The `<img>` is faded rather than hidden so its alt text stays in the accessibility tree; forced colours show the `<img>` and hide the canvas.
- Page transitions: a single 560ms band that never covers the whole page, never delays navigation, never flashes, and is not created at all with reduced motion or forced colours. Back and forward stay instant.
- Each surface degrades on its own terms. The hero falls back to its SVG. Work screenshots keep their `<img>`, which is what shows until the texture is drawn and whenever WebGL is unavailable. The states lattice has no static counterpart, so it leaves the layout rather than reserving empty space.
- Without JavaScript, the hero displays a static tile illustration and GIFs stay still. The hero entrance animation only plays with `prefers-reduced-motion: no-preference`, and reduced motion keeps colour and opacity feedback while dropping movement. Archive posts and native mobile navigation remain usable.
