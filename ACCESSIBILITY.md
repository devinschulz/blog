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
- Change the OS reduced-motion preference while the page is open. It must stop decorative motion, parallax, smooth scrolling, and GIF playback. Motion follows the system preference only; there is no site-level toggle or stored override.
- Review alt text and adjacent descriptions for meaningful screenshots. Preserve historical writing, but describe information that a screenshot alone would otherwise convey.

## Implementation notes

- Focus uses a two-tone ring with a system-color outline in forced-colors mode.
- State Shift is a client-only demo, not an account form. No entered data is submitted or saved. Its Keyboard state uses a dashed preview border; actual focus uses the shared ring. Saving is simulated and finishes automatically.
- GIFs render a static WebP by default. Playback is opt-in, with a Stop animation control and a clearly labeled original-file link.
- Without JavaScript, hero drift stays paused and GIFs stay still. Archive posts and native mobile navigation remain usable.
