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
const markdownTargets = new Set();
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
    markdownTargets.add(new URL(markdown[1], domain).href);
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
      const poster = tag.match(/data-static-src="([^"]+)"/);
      if (poster) {
        const target = localFile(new URL(poster[1], domain));
        assert(target, `${file}: GIF poster missing`);
        const bytes = fs.readFileSync(target);
        assert(
          bytes
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
          `${file}: GIF poster must be a single-frame PNG`,
        );
        for (let offset = 8; offset + 12 <= bytes.length;) {
          const length = bytes.readUInt32BE(offset);
          const type = bytes.toString('ascii', offset + 4, offset + 8);
          assert.notEqual(type, 'acTL', `${file}: GIF poster must not animate`);
          offset += length + 12;
        }
      }
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
// Home, case studies, and every article have their own share card.
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
assert.equal(
  cards.get('blog/index.html'),
  'writing',
  'Archive needs its own share card',
);
const articleCards = [...cards].filter(
  ([file]) => file.startsWith('blog/') && file !== 'blog/index.html',
);
for (const [file, card] of articleCards)
  assert(
    card.startsWith('post-'),
    `${file}: article needs a dedicated share card, got ${card}`,
  );
assert.equal(
  new Set(articleCards.map(([, card]) => card)).size,
  articleCards.length,
  'Every article needs a unique share image',
);
const feed = fs.readFileSync(path.join(root, 'index.xml'), 'utf8');
assert(
  !feed.includes('/work/'),
  'Case studies must not enter the writing feed',
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
for (const target of markdownTargets) {
  assert(
    llmsLinks.includes(target),
    `llms.txt: unlisted Markdown page ${target}`,
  );
  const file = localFile(new URL(target));
  const markdown = fs.readFileSync(file, 'utf8');
  assert(markdown.startsWith('# '), `${file}: missing Markdown title`);
  // Code samples may deliberately contain illustrative, non-existent URLs.
  const prose = markdown.replace(/^```[^\n]*\n[\s\S]*?^```/gm, '');
  for (const [, href] of prose.matchAll(/\]\((https?:[^\s)]+|\/[^\s)]+)\)/g)) {
    const url = new URL(href, domain);
    if (url.origin === domain)
      assert(
        localFile(url) || redirectSources.has(url.pathname),
        `${file}: missing Markdown link ${href}`,
      );
  }
}
for (const source of fs
  .readdirSync('content/blog')
  .filter((file) => file.endsWith('.md') && !file.startsWith('_'))) {
  const content = fs.readFileSync(path.join('content/blog', source), 'utf8');
  const slug =
    content.match(/^slug:\s*(.+)$/m)?.[1] || path.basename(source, '.md');
  const markdown = fs.readFileSync(
    path.join(root, 'blog', slug, 'index.md'),
    'utf8',
  );
  const year = content.match(/^date:\s*['"]?(\d{4})/m)[1];
  const archived = /^archived:\s*true\s*$/m.test(content.split('---')[1]);
  const html = fs.readFileSync(
    path.join(root, 'blog', slug, 'index.html'),
    'utf8',
  );
  assert.equal(
    markdown.includes(`Archived writing, published in ${year}.`),
    archived,
    `${source}: Markdown archive context must match frontmatter`,
  );
  assert.equal(
    html.includes('From the archive'),
    archived,
    `${source}: HTML archive context must match frontmatter`,
  );
  for (const feedPath of ['index.xml', 'blog/index.xml'])
    assert(
      fs
        .readFileSync(path.join(root, feedPath), 'utf8')
        .includes(`${domain}/blog/${slug}/`),
      `${source}: missing from ${feedPath}`,
    );
  for (const [sample] of content.matchAll(/^```[^\n]*\n[\s\S]*?^```/gm))
    assert(
      markdown.includes(sample),
      `${source}: Markdown export changed a code sample`,
    );
}
for (const name of ['cape', 'warranties', 'invision']) {
  const html = fs.readFileSync(
    path.join(root, 'work', name, 'index.html'),
    'utf8',
  );
  const markdown = fs.readFileSync(
    path.join(root, 'work', name, 'index.md'),
    'utf8',
  );
  assert.equal(
    [...markdown.matchAll(/!\[/g)].length,
    [...html.matchAll(/<img\s/g)].length,
    `${name}: Markdown is missing a project image`,
  );
}
console.log(
  `Checked ${files.length} HTML pages and ${markdownTargets.size} Markdown exports: metadata, JSON-LD, agent discovery links, local links/assets, archived code samples, case-study images, ${new Set(cards.values()).size} sharing cards, ${sitemapLocs.length} sitemap URLs, ${llmsLinks.length} llms.txt entries, and ${redirects.length} redirect mappings.`,
);
console.log(
  'Hosting redirect status, cache/compression headers, and Search Console still require deployment verification.',
);
