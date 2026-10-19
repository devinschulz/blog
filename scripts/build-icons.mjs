// Keep all browser and home-screen icons in sync with the SVG source.
import fs from 'node:fs';
import { chromium } from '@playwright/test';

const svg = fs.readFileSync('static/favicon.svg');
const browser = await chromium.launch();
const rasters = new Map();
try {
  const page = await browser.newPage();
  await page.setContent('<!doctype html><canvas></canvas>');
  for (const size of [16, 32, 48, 180]) {
    const data = await page.evaluate(
      async ({ source, size }) => {
        const image = new Image();
        image.src = source;
        await image.decode();
        const canvas = document.querySelector('canvas');
        canvas.width = canvas.height = size;
        const context = canvas.getContext('2d');
        // iOS applies its own corner mask and expects an opaque square.
        if (size === 180) {
          context.fillStyle = '#2449ef';
          context.fillRect(0, 0, size, size);
        }
        context.drawImage(image, 0, 0, size, size);
        return canvas.toDataURL('image/png').split(',')[1];
      },
      { source: `data:image/svg+xml;base64,${svg.toString('base64')}`, size },
    );
    rasters.set(size, Buffer.from(data, 'base64'));
  }
} finally {
  await browser.close();
}

const sizes = [16, 32, 48];
const directory = Buffer.alloc(6 + sizes.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
sizes.forEach((size, index) => {
  const entry = 6 + index * 16;
  const png = rasters.get(size);
  directory[entry] = directory[entry + 1] = size;
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(png.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += png.length;
});
fs.writeFileSync(
  'static/favicon.ico',
  Buffer.concat([directory, ...sizes.map((size) => rasters.get(size))]),
);
fs.writeFileSync('static/apple-touch-icon.png', rasters.get(180));
for (const size of [16, 32])
  fs.writeFileSync(`static/favicon-${size}x${size}.png`, rasters.get(size));
// Older Safari pinned tabs use a monochrome mask rather than the full icon.
fs.writeFileSync(
  'static/safari-pinned-tab.svg',
  svg
    .toString()
    .replace(/\s*<rect[^>]*\/>/, '')
    .replaceAll('fill="#fff"', 'fill="#000"'),
);
console.log(
  'Updated SVG, ICO, 16/32px PNG fallbacks, Apple touch icon, and Safari pinned-tab mask.',
);
