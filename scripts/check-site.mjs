import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const domain = 'https://devinschulz.com';
const files = fs.readdirSync(root, { recursive: true }).filter(file => file.endsWith('.html'));
const errors = [];
const redirects = fs.readFileSync('static/_redirects', 'utf8').split('\n').filter(line => line.trim() && !line.startsWith('#')).map(line => line.trim().split(/\s+/));
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
  assert.equal((html.match(/<title>/g) || []).length, 1, `${file}: exactly one title`);
  assert(!html.includes('fonts.googleapis.com') && !html.includes('fonts.gstatic.com'), `${file}: fonts must be local`);
  if (file !== '404.html') {
    assert(html.includes('property="og:image"'), `${file}: sharing image`);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert(schema['@type']);
    const image = html.match(/property="og:image" content="([^"]+)"/)[1];
    assert(localFile(new URL(image)), `${file}: generated social image missing`);
  } else assert(html.includes('content="noindex, follow"'));
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value = match[1].replaceAll('&amp;', '&');
    const target = new URL(value, url);
    if (target.origin !== domain) continue;
    if (!localFile(target) && !redirectSources.has(target.pathname)) errors.push(`${file}: missing ${value}`);
  }
  if (file.startsWith('blog/') && file !== 'blog/index.html') {
    for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
      assert(/\bwidth="\d+"/.test(tag) && /\bheight="\d+"/.test(tag), `${file}: image dimensions`);
      assert(tag.includes('loading="lazy"'), `${file}: below-fold image loading`);
    }
  }
}
for (const [source, destination, status] of redirects) {
  assert.equal(status, '301', `${source}: permanent redirect required`);
  assert(localFile(new URL(destination, domain)), `${source}: destination ${destination} missing`);
  assert(!redirectSources.has(destination), `${source}: avoid redirect chains`);
}
assert.deepEqual(errors, [], 'Broken internal links or assets');
const feed = fs.readFileSync(path.join(root, 'index.xml'), 'utf8');
assert(!feed.includes('/work/'), 'Case studies must not enter the historical feed');
assert(fs.readFileSync(path.join(root, 'robots.txt'), 'utf8').includes(`${domain}/sitemap.xml`));
console.log(`Checked ${files.length} HTML pages: metadata, JSON-LD, local links/assets, blog images, and ${redirects.length} redirect mappings.`);
console.log('Hosting redirect status, cache/compression headers, and Search Console still require deployment verification.');
