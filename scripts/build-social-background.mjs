// Render share cards with the site's actual DM Sans and crisp resting typography.
// These are static exports: sharing services cannot run the site's WebGL.
// Run npm run build:social after changing the visual identity or card content.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const OUT = 'assets/images/social';
// Posts use single-line title/date/tag fields. Fail clearly if a new
// post changes that shape, rather than publishing a card with missing text.
const posts = fs
  .readdirSync('content/blog')
  .filter((file) => file.endsWith('.md') && !file.startsWith('_'))
  .sort()
  .map((file) => {
    const source = fs.readFileSync(path.join('content/blog', file), 'utf8');
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1];
    const title = frontmatter.match(/^title:\s*(.+)$/m)?.[1];
    const year = frontmatter.match(/^date:\s*['"]?(\d{4})/m)?.[1];
    const topics = frontmatter.match(/^tags:\s*\[(.+)\]/m)?.[1];
    const archived = /^archived:\s*true\s*$/m.test(frontmatter);
    if (!title || !year) throw new Error(`${file}: missing title or date`);
    return {
      name: `post-${path.basename(file, '.md')}`,
      article: true,
      year,
      title: title.replace(/^(['"])(.*)\1$/, '$2'),
      label: `${archived ? 'ARCHIVED WRITING' : 'WRITING'} / ${year}`,
      note: topics
        ? topics.replaceAll(/['"]/g, '')
        : archived
          ? 'Notes from the archive'
          : 'Notes on code and design',
    };
  });
const years = posts.map((post) => post.year).sort();
const writingYears = [...new Set([years[0], years.at(-1)])].join('–');
const cards = [
  {
    name: 'home',
    lines: ['DESIGNER’S EYE.', 'ENGINEER’S MIND.'],
    label: 'DESIGN & FRONTEND ENGINEERING',
    note: 'Currently building at Stripe',
  },
  {
    name: 'writing',
    lines: ['THINKING', 'OUT LOUD.'],
    label: 'NOTES ON CODE & DESIGN',
    note: `${posts.length} articles · ${writingYears}`,
  },
  {
    name: 'cape',
    title: 'Cape',
    label: 'SELECTED WORK / 01',
    note: 'Product design & frontend engineering · 2020–2025',
    image: 'assets/images/cape/slide-1.png',
    description: ['A clearer way to', 'work with AI.'],
  },
  {
    name: 'warranties',
    title: 'Warranties',
    label: 'SELECTED WORK / 02',
    note: 'Independent app design & development · 2023–2025',
    image: 'assets/images/warranties/slide-3.jpg',
    description: ['Your things,', 'remembered.'],
  },
  {
    name: 'invision',
    title: 'InVision',
    label: 'SELECTED WORK / 03',
    note: 'Frontend engineering · 2014–2020',
    image: 'assets/images/invision/slide-3.png',
    description: ['Making design intent', 'tangible.'],
  },
  ...posts,
];
const assets = {
  '/display.woff2': 'static/fonts/dm-sans-latin-variable.woff2',
  '/mono.woff2':
    'static/fonts/jetbrains-mono-normal-100-800-18be452724bf.woff2',
  ...Object.fromEntries(
    cards
      .filter((card) => card.image)
      .map((card) => [`/${card.name}`, card.image]),
  ),
};
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.route('**/*', (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname === '/')
      return route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><html><body style="margin:0"><canvas width="1200" height="630"></canvas></body></html>',
      });
    const file = assets[pathname];
    if (!file) return route.fulfill({ status: 404, body: '' });
    return route.fulfill({ path: file });
  });
  await page.goto('https://cards.invalid/');
  await page.evaluate(async () => {
    for (const [family, url, weight] of [
      ['Display', '/display.woff2', '100 1000'],
      ['Mono', '/mono.woff2', '100 800'],
    ]) {
      const font = new FontFace(family, `url(${url})`, { weight });
      await font.load();
      document.fonts.add(font);
    }
  });
  for (const card of cards) {
    await page.evaluate(async (card) => {
      const canvas = document.querySelector('canvas');
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#2449ef';
      ctx.fillRect(0, 0, 1200, 630);
      // Quiet caustic traces echo the resting water surface on the site.
      ctx.strokeStyle = '#ffffff06';
      ctx.lineWidth = 2;
      for (let line = 0; line < 9; line++) {
        ctx.beginPath();
        for (let x = -100; x < 1300; x += 5) {
          const y = 65 + line * 76 + Math.sin(x / 165 + line * 1.6) * 45;
          if (x === -100) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      function text(
        value,
        x,
        y,
        size,
        weight = 400,
        family = 'Display',
        tracking = '0px',
        align = 'left',
      ) {
        ctx.fillStyle = '#fff';
        ctx.font = `${weight} ${size}px ${family}`;
        ctx.letterSpacing = tracking;
        ctx.textAlign = align;
        ctx.fillText(value, x, y);
      }
      function rule(y) {
        ctx.fillStyle = '#ffffff55';
        ctx.fillRect(56, y, 1088, 1);
      }
      text('devin schulz.', 56, 76, 32, 600, 'Display', '-1.7px');
      text(card.label, 1144, 71, 14, 400, 'Mono', '0px', 'right');
      rule(112);
      if (card.lines) {
        // Share previews show the site's resting state, with solid letters.
        // Pointer-driven particles belong to the interactive website.
        const size = card.name === 'home' ? 123 : 148;
        card.lines.forEach((line, index) => {
          const y = 292 + index * (card.name === 'home' ? 128 : 145);
          if (card.name === 'home') {
            const split = line.lastIndexOf(' ');
            text(
              line.slice(0, split),
              56,
              y,
              size,
              500,
              'Display',
              `${size * -0.075}px`,
            );
            text(
              line.slice(split + 1),
              1144,
              y,
              size,
              500,
              'Display',
              `${size * -0.075}px`,
              'right',
            );
          } else {
            text(
              line,
              index === 0 ? 56 : 1144,
              y,
              size,
              500,
              'Display',
              `${size * -0.075}px`,
              index === 0 ? 'left' : 'right',
            );
          }
        });
      } else if (card.article) {
        // Fit the complete title by measured glyph widths, preserving words.
        let size = 88;
        let lines;
        do {
          ctx.font = `500 ${size}px Display`;
          ctx.letterSpacing = `${size * -0.045}px`;
          lines = [];
          let line = '';
          for (const word of card.title.split(/\s+/)) {
            const candidate = line ? `${line} ${word}` : word;
            if (line && ctx.measureText(candidate).width > 1080) {
              lines.push(line);
              line = word;
            } else line = candidate;
          }
          if (line) lines.push(line);
          if (lines.length * size * 1.08 <= 310) break;
          size -= 2;
        } while (size >= 48);
        // Avoid leaving a single short word stranded on the final line.
        if (lines.length > 1) {
          const last = lines.length - 1;
          let previous = lines[last - 1].split(' ');
          while (
            previous.length > 1 &&
            ctx.measureText(lines[last]).width <
              ctx.measureText(lines[last - 1]).width * 0.55
          ) {
            const candidate = `${previous.at(-1)} ${lines[last]}`;
            if (ctx.measureText(candidate).width > 1080) break;
            previous.pop();
            lines[last - 1] = previous.join(' ');
            lines[last] = candidate;
          }
        }
        const lineHeight = size * 1.08;
        const top = 320 - (lines.length * lineHeight) / 2;
        lines.forEach((line, index) =>
          text(
            line,
            56,
            top + size + index * lineHeight,
            size,
            500,
            'Display',
            `${size * -0.045}px`,
          ),
        );
      } else {
        const image = new Image();
        image.src = `/${card.name}`;
        await image.decode();
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(555, 154, 589, 340, 10);
        ctx.clip();
        ctx.fillStyle = card.name === 'invision' ? '#222733' : '#f6f6f6';
        ctx.fillRect(555, 154, 589, 340);
        const scale = Math.min(589 / image.width, 340 / image.height);
        const width = image.width * scale;
        const height = image.height * scale;
        ctx.drawImage(
          image,
          555 + (589 - width) / 2,
          154 + (340 - height) / 2,
          width,
          height,
        );
        ctx.restore();
        const title = card.title.toUpperCase();
        let size = 116;
        do {
          ctx.font = `500 ${size}px Display`;
          ctx.letterSpacing = `${size * -0.065}px`;
          if (ctx.measureText(title).width <= 445) break;
          size -= 1;
        } while (size > 48);
        text(title, 56, 277, size, 500, 'Display', `${size * -0.065}px`);
        card.description.forEach((line, index) =>
          text(line, 56, 350 + index * 35, 28, 400, 'Display', '-0.6px'),
        );
      }
      rule(532);
      text('devinschulz.com', 56, 582, 18, 400, 'Mono');
      text(card.note, 1144, 582, 14, 400, 'Display', '0px', 'right');
    }, card);
    await page
      .locator('canvas')
      .screenshot({ path: path.join(OUT, `${card.name}.png`) });
  }
} finally {
  await browser.close();
}
console.log(`Rendered ${cards.length} sharing cards to ${OUT}/.`);
