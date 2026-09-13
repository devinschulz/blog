// Regenerates the social card background from the hero sculpture, so the
// sharing image and the homepage show the same artwork.
// Run after changing static/images/kinetic-sculpture.svg: npm run build:social
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const CARD = { width: 1200, height: 630 };
// Mirrors the hero: the sculpture sits right, fading in so it never crowds the
// headline. Keep it clear of the text column that social-image.html fills.
const ART = { x: 724, y: 78, width: 468, height: 468, fade: 0.3 };

const sculpture = fs.readFileSync('static/images/kinetic-sculpture.svg', 'utf8')
  .replace(/^[\s\S]*?<\/title>/, '')
  .replace(/<\/svg>\s*$/, '');

const scale = (ART.width / 600).toFixed(4);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD.width}" height="${CARD.height}" viewBox="0 0 ${CARD.width} ${CARD.height}">
  <rect width="${CARD.width}" height="${CARD.height}" fill="#f5f1e8"/>
  <defs>
    <linearGradient id="fade" x1="${ART.x}" y1="0" x2="${ART.x + ART.width}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset="${ART.fade}" stop-color="#fff" stop-opacity="1"/>
    </linearGradient>
    <mask id="fade-in" maskUnits="userSpaceOnUse" x="${ART.x}" y="${ART.y}" width="${ART.width}" height="${ART.height}">
      <rect x="${ART.x}" y="${ART.y}" width="${ART.width}" height="${ART.height}" fill="url(#fade)"/>
    </mask>
  </defs>
  <g mask="url(#fade-in)"><g transform="translate(${ART.x},${ART.y}) scale(${scale},${(ART.height / 600).toFixed(4)})">${sculpture}</g></g>
  <path d="M0 606 1200 564v66H0Z" fill="#d6f752"/>
  <path d="M64 114h820" stroke="#181a21" stroke-opacity=".22"/>
</svg>
`;
fs.writeFileSync('assets/images/social-background.svg', svg);

// Hugo composes the card text onto a raster, and no SVG rasterizer ships with
// the toolchain, so reuse the browser the accessibility tests already install.
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: CARD, deviceScaleFactor: 1 });
await page.setContent(`<style>html,body{margin:0;padding:0}svg{display:block}</style>${svg}`);
await page.locator('svg').screenshot({ path: 'assets/images/social-background.png' });
await browser.close();

const png = fs.statSync('assets/images/social-background.png');
console.log(`Wrote assets/images/social-background.{svg,png} (${Math.round(png.size / 1024)} KB PNG).`);
