import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const domain = 'https://devinschulz.com';
const files = fs
  .readdirSync(root, { recursive: true })
  .filter((file) => file.endsWith('.html'));
const errors = [];
const cards = new Map();
const redirects = fs
  .readFileSync('static/_redirects', 'utf8')
  .split('\n')
  .filter((line) => line.trim() && !line.startsWith('#'))
  .map((line) => line.trim().split(/\s+/));
const redirectSources = new Set(redirects.map(([source]) => source));
function localFile(url) {
  const decoded = decodeURIComponent(url.pathname);
  const target = path.resolve(root, '.' + decoded);
  if (!target.startsWith(root + path.sep) && target !== root) return null;
  if (fs.existsSync(target) && fs.statSync(target).isFile()) return target;
  const index = path.join(target, 'index.html');
  return fs.existsSync(index) ? index : null;
}
for (const file of files) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const url = new URL('/' + file.replace(/index\.html$/, ''), domain);
  assert.equal(
    (html.match(/<title>/g) || []).length,
    1,
    `${file}: exactly one title`,
  );
  assert(
    !html.includes('fonts.googleapis.com') &&
      !html.includes('fonts.gstatic.com'),
    `${file}: fonts must be local`,
  );
  if (file !== '404.html') {
    assert(html.includes('property="og:image"'), `${file}: sharing image`);
    const schema = JSON.parse(
      html.match(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
      )[1],
    );
    assert(schema['@type']);
    const image = html.match(/property="og:image" content="([^"]+)"/)[1];
    assert(
      localFile(new URL(image)),
      `${file}: generated social image missing`,
    );
    // A running `hugo server` can win the race for dist/ and stamp its own
    // base URL onto a production build, which crawlers cannot resolve.
    assert(
      image.startsWith(`${domain}/`),
      `${file}: social image must be absolute on ${domain}, got ${image}`,
    );
    cards.set(file, path.basename(new URL(image).pathname).split('_hu_')[0]);
    assert(
      html.includes(
        '<link rel="describedby" type="text/plain" href="/llms.txt"',
      ),
      `${file}: llms.txt must be advertised`,
    );
    const markdown = html.match(
      /<link rel="alternate" type="text\/markdown" href="([^"]+)"/,
    );
    assert(markdown, `${file}: Markdown alternate`);
    assert(
      localFile(new URL(markdown[1], domain)),
      `${file}: Markdown alternate ${markdown[1]} missing`,
    );
  } else assert(html.includes('content="noindex, follow"'));
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value = match[1].replaceAll('&amp;', '&');
    const target = new URL(value, url);
    if (target.origin !== domain) continue;
    if (!localFile(target) && !redirectSources.has(target.pathname))
      errors.push(`${file}: missing ${value}`);
  }
  if (file.startsWith('blog/') && file !== 'blog/index.html') {
    for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
      assert(
        /\bwidth="\d+"/.test(tag) && /\bheight="\d+"/.test(tag),
        `${file}: image dimensions`,
      );
      assert(
        tag.includes('loading="lazy"'),
        `${file}: below-fold image loading`,
      );
    }
  }
}
for (const [source, destination, status] of redirects) {
  assert.equal(status, '301', `${source}: permanent redirect required`);
  assert(
    localFile(new URL(destination, domain)),
    `${source}: destination ${destination} missing`,
  );
  assert(!redirectSources.has(destination), `${source}: avoid redirect chains`);
}
assert.deepEqual(errors, [], 'Broken internal links or assets');
// The home page and each case study carry their own artwork; writing shares one.
const signatures = [
  'index.html',
  'work/cape/index.html',
  'work/invision/index.html',
  'work/warranties/index.html',
].map((file) => cards.get(file));
assert(signatures.every(Boolean), 'Every signature page needs a sharing card');
assert.equal(
  new Set(signatures).size,
  signatures.length,
  `Signature pages must not share a card: ${signatures.join(', ')}`,
);
for (const [file, card] of cards) {
  if (file.startsWith('blog/'))
    assert.equal(
      card,
      'writing',
      `${file}: writing shares one card, got ${card}`,
    );
}
const feed = fs.readFileSync(path.join(root, 'index.xml'), 'utf8');
assert(
  !feed.includes('/work/'),
  'Case studies must not enter the historical feed',
);
const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
assert(robots.includes(`${domain}/sitemap.xml`));
assert(
  robots.includes(`${domain}/llms.txt`),
  'robots.txt must point at llms.txt',
);
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map(
  ([, loc]) => loc,
);
assert(sitemapLocs.length, 'sitemap must list URLs');
for (const loc of sitemapLocs) {
  assert(
    loc.trim(),
    'sitemap: empty <loc> (a page built with render "never" leaked in)',
  );
  assert(localFile(new URL(loc)), `sitemap: missing ${loc}`);
}
assert(
  sitemapLocs.includes(`${domain}/llms.txt`),
  'sitemap must list llms.txt so crawlers reach it',
);
const llms = fs.readFileSync(path.join(root, 'llms.txt'), 'utf8');
const llmsLinks = [...llms.matchAll(/\]\((https?:[^)]+)\)/g)].map(
  ([, link]) => link,
);
assert(llmsLinks.length, 'llms.txt must link to the pages it indexes');
for (const link of llmsLinks) {
  const target = new URL(link);
  assert.equal(target.origin, domain, `llms.txt: unexpected host ${link}`);
  assert(localFile(target), `llms.txt: missing ${link}`);
}
console.log(
  `Checked ${files.length} HTML pages: metadata, JSON-LD, agent discovery links, local links/assets, blog images, ${new Set(cards.values()).size} sharing cards, ${sitemapLocs.length} sitemap URLs, ${llmsLinks.length} llms.txt entries, and ${redirects.length} redirect mappings.`,
);
console.log(
  'Hosting redirect status, cache/compression headers, and Search Console still require deployment verification.',
);
