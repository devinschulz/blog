// Renders the sharing-card backgrounds from the real hero sculpture, so a
// shared link shows the same artwork the site does. Each card freezes the
// sculpture at a different moment of its fold cycle, which gives the home page,
// the case studies and the writing their own recognisable mark.
// Run after changing the sculpture or these framings: npm run build:social
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { stripTypeScriptTypes } from 'node:module';

const CARD = { width: 1200, height: 630 };
// Mirrors the hero: the sculpture sits right, fading in so it never crowds the
// headline. Keep it clear of the text column that social-image.html fills.
const ART = { x: 724, y: 78, size: 468, fade: 30 };
const OUT = 'assets/images/social';

// Times sampled across one fold cycle, from the full vortex to the flat grid.
const CARDS = [
  { name: 'home', time: 0, pointer: { x: 0, y: 0 } },
  { name: 'cape', time: 4.03, pointer: { x: 0.18, y: -0.12 } },
  { name: 'invision', time: 5.95, pointer: { x: -0.2, y: 0.1 } },
  { name: 'warranties', time: 8.15, pointer: { x: 0.12, y: 0.16 } },
  { name: 'writing', time: 10.59, pointer: { x: -0.14, y: -0.08 } },
];

// The page is assembled from real modules so the card cannot drift from the
// hero: same sculpture, same lights, same camera framing.
const MODULES = {
  '/three.module.js': 'node_modules/three/build/three.module.js',
  '/three.core.js': 'node_modules/three/build/three.core.js',
  '/kinetic-sculpture': 'assets/js/kinetic-sculpture.ts',
  '/kinetic-scene': 'assets/js/kinetic-scene.ts',
};

const page_html = `<!doctype html>
<meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; }
  #card { position: relative; width: ${CARD.width}px; height: ${CARD.height}px; background: #f4f4f5; overflow: hidden; }
  #art { position: absolute; left: ${ART.x}px; top: ${ART.y}px; width: ${ART.size}px; height: ${ART.size}px;
         mask-image: linear-gradient(to right, transparent 0, #000 ${ART.fade}%); }
  #art canvas { display: block; width: ${ART.size}px; height: ${ART.size}px; }
  svg { position: absolute; inset: 0; }
</style>
<script type="importmap">
{"imports": {"three": "/three.module.js", "three/addons/": "/addons/"}}
</script>
<div id="card">
  <div id="art"><canvas id="sculpture"></canvas></div>
  <svg width="${CARD.width}" height="${CARD.height}" viewBox="0 0 ${CARD.width} ${CARD.height}">
    <path d="M64 114h820" stroke="#18181b" stroke-opacity=".14"/>
  </svg>
</div>
<script type="module">
  import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
  import { createKineticScene } from '/kinetic-scene';

  const canvas = document.getElementById('sculpture');
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(2);
  renderer.setSize(${ART.size}, ${ART.size}, false);
  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 40);
  const artwork = createKineticScene({ scene, camera });
  artwork.resize(${ART.size}, ${ART.size}, camera);
  camera.updateProjectionMatrix();

  window.renderCard = ({ time, pointer }) => {
    artwork.update(time, pointer);
    renderer.render(scene, camera);
  };
  window.cardReady = true;
</script>
`;

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: CARD, deviceScaleFactor: 1 });

await page.route('**/*', (route) => {
  const { pathname } = new URL(route.request().url());
  if (pathname === '/')
    return route.fulfill({ contentType: 'text/html', body: page_html });
  const file = pathname.startsWith('/addons/')
    ? path.join(
        'node_modules/three/examples/jsm',
        pathname.slice('/addons/'.length),
      )
    : MODULES[pathname];
  if (!file || !fs.existsSync(file))
    return route.fulfill({ status: 404, body: '' });
  const source = fs.readFileSync(file, 'utf8');
  // The scene modules are TypeScript now. Strip the types on the way to the
  // browser so the card still renders from the very same source the site uses.
  const body = file.endsWith('.ts')
    ? stripTypeScriptTypes(source, { mode: 'strip' })
    : source;
  return route.fulfill({ contentType: 'text/javascript', body });
});

const failures = [];
page.on('pageerror', (error) => failures.push(error.message));
await page.goto('https://card.invalid/');
await page.waitForFunction(() => window.cardReady, null, { timeout: 15000 });

const written = [];
for (const card of CARDS) {
  await page.evaluate((options) => window.renderCard(options), card);
  const file = path.join(OUT, `${card.name}.png`);
  await page.locator('#card').screenshot({ path: file });
  written.push(
    `${card.name} (${Math.round(fs.statSync(file).size / 1024)} KB)`,
  );
}
await browser.close();

if (failures.length) {
  console.error(`The card page failed to run:\n${failures.join('\n')}`);
  process.exit(1);
}
console.log(
  `Wrote ${CARDS.length} backgrounds to ${OUT}/: ${written.join(', ')}.`,
);
