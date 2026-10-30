# Fish shadows on blue surfaces

Mode: Experience. Extend the established water treatment without changing typography, palette, or layout.

The user requested WebGL fish that look like shadows swimming on the blue parts, then asked that nearby cursors make them speed up and swim away. Three soft silhouettes are composed directly into each existing water shader beneath readable lettering. Curved steering, body/tail deformation, size and softness differences suggest fish below the surface. Fine-pointer proximity accelerates and redirects individual fish; cruise speed returns smoothly afterward. Touch has ambient swimming only.

Reuse the existing graphics scheduler, visibility checks, reduced-motion lifecycle, and cleanup. Render ambient swimming at up to 30fps; retain input-driven rendering for existing effects. Pause fish / Resume fish in the footer is available when WebGL surfaces are active and survives Turbo navigation. Forced colors and reduced motion retain native typography without fish contexts. No shipping raster assets or additional WebGL canvases are introduced.

Verification: `npm run check` passes. The 12 dedicated fish checks passed across Chromium and WebKit, desktop and narrow viewports, including acceleration/recovery, pause/resume, hidden/offscreen suspension, reduced motion, forced colors, and shader errors. Three existing graphics lifecycle checks passed; two broader existing portfolio accessibility audits reported label/name mismatches in project cards and preview controls outside the fish change. Captures in `.impeccable/review/fish/` show desktop/mobile swimming and cursor approach states; water crops expose the subtle silhouettes. These are browser evidence, not generated product imagery.

Finish review: disposition ship for the fish rendering and source lifecycle; all six captures visually valid, no material fixes.

The user also requested hover motion on the Make waves glyph. Two clipped periodic paths translate in opposite directions with an 800ms linear cycle while the button is hovered by a fine pointer, then pause at their current phase. Coarse pointers and reduced motion keep the icon static. The button action and label remain unchanged.

## Documentation verification

README.md and DESIGN.md match the implementation: three procedural fish share the existing water shader, flee nearby fine pointers, recover cruising speed, and retain the 30fps ambient cap, visibility suspension, motion preferences, cleanup, and footer pause state across Turbo navigation. The glyph uses clipped inline SVG paths with opposite 800ms linear translations, paused outside fine-pointer hover and static for reduced motion. No shipping raster assets or additional canvases were introduced. Final reported validation passed all 18 dedicated fish/glyph checks and three graphics lifecycle checks; the two broader portfolio label/name audit failures remain recorded above. Fish and glyph finish reviews both returned ship with no fixes.

Glyph finish review: disposition ship. Both button captures are valid, bounds and legibility preserved, and no scoped fixes were required.
