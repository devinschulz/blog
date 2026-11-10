// Render 1200 × 630 share images with the site's current reading-page identity.
// Run npm run build:social after changing card content or the visual identity.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const OUT = 'assets/images/social';
function frontmatter(file) {
  const source = fs.readFileSync(file, 'utf8');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error(`${file}: missing frontmatter`);
  return match[1];
}
function field(source, key) {
  return source
    .match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]
    .replace(/^(['"])(.*)\1$/, '$2');
}
const posts = fs
  .readdirSync('content/blog')
  .filter((file) => file.endsWith('.md') && !file.startsWith('_'))
  .sort()
  .map((file) => {
    const source = frontmatter(path.join('content/blog', file));
    const title = field(source, 'title');
    const date = field(source, 'date')?.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    if (!title || !date) throw new Error(`${file}: missing title or date`);
    const topics = field(source, 'tags')
      ?.replace(/^\[|\]$/g, '')
      .replaceAll(/['"]/g, '');
    return {
      name: `post-${path.basename(file, '.md')}`,
      title,
      type:
        field(source, 'archived') === 'true' ? 'Archived writing' : 'Writing',
      year: date.slice(0, 4),
      description: new Intl.DateTimeFormat('en', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(`${date}T12:00:00Z`)),
      note: topics ?? '',
      article: true,
    };
  });
const years = posts.map((post) => post.year).sort();
const writingYears = [...new Set([years[0], years.at(-1)])].join('–');
const home = fs.readFileSync('layouts/index.html', 'utf8');
const homeTitle = home.match(/id="writing-title"[^>]*>([^<]+)<\/h1>/)?.[1];
const homeDescription = home.match(/<p\b[^>]*>([^<]+)<\/p>/)?.[1];
if (!homeTitle || !homeDescription)
  throw new Error('Homepage title or introduction missing');
const cards = [
  { name: 'home', title: homeTitle, description: homeDescription },
  {
    name: 'writing',
    title: 'Writing',
    description: `${posts.length} articles, ${writingYears}`,
  },
  ...[
    ['work', 'content/work/_index.md', 'Work'],
    ['about', 'content/about.md', 'About'],
    ['colophon', 'content/colophon.md', 'Colophon'],
  ].map(([name, file, title]) => ({
    name,
    title,
    description: field(frontmatter(file), 'description'),
  })),
  ...[
    ['cape', 'assets/images/cape/slide-1.png'],
    ['warranties', 'assets/images/warranties/slide-3.jpg'],
    ['invision', 'assets/images/invision/slide-3.png'],
  ].map(([name, image]) => {
    const source = frontmatter(`content/work/${name}/index.md`);
    return {
      name,
      image,
      type: 'Work',
      title: field(source, 'title'),
      description: field(source, 'description'),
      note: field(source, 'period')?.replace('-', '–'),
    };
  }),
  ...posts,
];
const assets = {
  '/dm-sans.woff2': 'static/fonts/dm-sans-latin-variable.woff2',
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
    return file
      ? route.fulfill({ path: file })
      : route.fulfill({ status: 404, body: '' });
  });
  await page.goto('https://cards.invalid/');
  await page.evaluate(async () => {
    const font = new FontFace('DM Sans', 'url(/dm-sans.woff2)', {
      weight: '100 1000',
    });
    await font.load();
    document.fonts.add(font);
  });
  for (const card of cards) {
    await page.evaluate(async (card) => {
      const ctx = document.querySelector('canvas').getContext('2d');
      const colors = {
        paper: '#202730',
        ink: '#eeefeb',
        muted: '#adb7c4',
        accent: '#a2b3ff',
        surface: '#2b3440',
      };
      ctx.fillStyle = colors.paper;
      ctx.fillRect(0, 0, 1200, 630);
      ctx.textBaseline = 'top';
      function font(size, weight = 400) {
        ctx.font = `${weight} ${size}px "DM Sans"`;
        ctx.letterSpacing = `${size >= 48 ? size * -0.025 : size * -0.01}px`;
      }
      function text(
        value,
        x,
        y,
        size,
        weight = 400,
        color = colors.ink,
        align = 'left',
      ) {
        font(size, weight);
        ctx.fillStyle = color;
        ctx.textAlign = align;
        const width = ctx.measureText(value).width;
        const left = align === 'right' ? x - width : x;
        if (left < 79 || left + width > 1121 || y + size * 1.3 > 600) {
          throw new Error(`${card.name}: text exceeds its safe area: ${value}`);
        }
        ctx.fillText(value, x, y);
        return width;
      }
      function wrap(value, width, size, weight) {
        font(size, weight);
        const lines = [];
        let line = '';
        for (const word of value.split(/\s+/)) {
          if (ctx.measureText(word).width > width)
            throw new Error(`${card.name}: word exceeds its column: ${word}`);
          const candidate = line ? `${line} ${word}` : word;
          if (line && ctx.measureText(candidate).width > width) {
            lines.push(line);
            line = word;
          } else line = candidate;
        }
        if (line) lines.push(line);
        return lines;
      }
      function fit(value, width, height, start, weight = 400) {
        for (let size = start; size >= 24; size -= 2) {
          const lines = wrap(value, width, size, weight);
          const leading = size * 1.25;
          if (lines.length * leading <= height)
            return { lines, size, leading, height: lines.length * leading };
        }
        throw new Error(`${card.name}: text cannot fit: ${value}`);
      }
      function block(layout, x, y, weight, color) {
        layout.lines.forEach((line, index) =>
          text(line, x, y + index * layout.leading, layout.size, weight, color),
        );
      }
      const brandWidth = text('devin schulz', 80, 64, 28);
      text('.', 80 + brandWidth, 64, 28, 400, colors.accent);
      if (card.type) text(card.type, 1120, 68, 22, 400, colors.muted, 'right');
      if (card.image) {
        const title = fit(card.title, 440, 84, 64, 500);
        const description = fit(card.description, 440, 224, 28);
        const top = 174 + (304 - title.height - 24 - description.height) / 2;
        block(title, 80, top, 500, colors.ink);
        block(description, 80, top + title.height + 24, 400, colors.muted);
        const image = new Image();
        image.src = `/${card.name}`;
        await image.decode();
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(600, 174, 520, 304, 8);
        ctx.clip();
        ctx.fillStyle = colors.surface;
        ctx.fillRect(600, 174, 520, 304);
        const scale = Math.min(520 / image.width, 304 / image.height);
        ctx.drawImage(
          image,
          600 + (520 - image.width * scale) / 2,
          174 + (304 - image.height * scale) / 2,
          image.width * scale,
          image.height * scale,
        );
        ctx.restore();
      } else {
        const title = fit(card.title, 1040, card.article ? 244 : 100, 72, 500);
        const description = fit(
          card.description,
          1000,
          card.article ? 40 : 160,
          card.article ? 26 : 30,
        );
        const top = 174 + (304 - title.height - 24 - description.height) / 2;
        block(title, 80, top, 500, colors.ink);
        block(description, 80, top + title.height + 24, 400, colors.muted);
      }
      const urlWidth = text('devinschulz.com', 80, 550, 22, 400, colors.accent);
      ctx.fillStyle = colors.accent;
      ctx.fillRect(80, 578, urlWidth, 1);
      if (card.note) text(card.note, 1120, 550, 22, 400, colors.muted, 'right');
    }, card);
    await page
      .locator('canvas')
      .screenshot({ path: path.join(OUT, `${card.name}.png`) });
  }
} finally {
  await browser.close();
}
console.log(`Rendered ${cards.length} sharing cards to ${OUT}/.`);
