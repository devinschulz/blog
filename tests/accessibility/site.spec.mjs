import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

const pages = fs
  .readdirSync('dist', { recursive: true })
  .filter((file) => file.endsWith('.html'));
const gifPage = '/blog/my-definition-of-a-first-class-pull-request/';

async function audit(page) {
  await page.evaluate(() => document.fonts.ready);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    results.violations.map(({ id, nodes }) => ({
      id,
      nodes: nodes.map(({ target, failureSummary }) => ({
        target,
        failureSummary,
      })),
    })),
  ).toEqual([]);
}

// Layout is measured with polling assertions rather than a single sample. The
// WebGL tests run software-rendered alongside these, and under that contention
// a page can be caught mid-layout; a real overflow never resolves, so retrying
// absorbs the transient state without hiding a genuine failure.
async function expectReflow(page) {
  await expect
    .poll(
      () =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      { message: 'Page must not scroll horizontally' },
    )
    .toBe(true);
  // Hero overflow is intentionally clipped for artwork, but never for its text.
  await expect
    .poll(
      () =>
        page.locator('h1, h2, h3').evaluateAll((headings) =>
          headings.flatMap((heading) => {
            const walker = document.createTreeWalker(
              heading,
              NodeFilter.SHOW_TEXT,
            );
            let node;
            const clipped = [];
            while ((node = walker.nextNode())) {
              if (!node.textContent.trim()) continue;
              const range = document.createRange();
              range.selectNodeContents(node);
              for (const rect of range.getClientRects()) {
                if (rect.left < -1 || rect.right > innerWidth + 1)
                  clipped.push(node.textContent.trim());
              }
            }
            return clipped;
          }),
        ),
      { message: 'Headings must not be clipped horizontally' },
    )
    .toEqual([]);
  if (await page.locator('[data-demo-form]').count()) {
    await expect
      .poll(
        () =>
          page
            .locator('[data-demo-form]')
            .evaluate(
              (form) =>
                form.getBoundingClientRect().bottom >
                document
                  .querySelector('[data-demo-steps]')
                  .getBoundingClientRect().top,
            ),
        { message: 'Demo form must not overlap the progress row' },
      )
      .toBe(false);
  }
}

for (const file of pages) {
  test(`page audit and text-spacing reflow: ${file}`, async ({ page }) => {
    await page.goto('/' + file.replace(/index\.html$/, ''));
    await audit(page);
    await expectReflow(page);
    await page.addStyleTag({
      content:
        '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }',
    });
    await expectReflow(page);
  });
}

test('keyboard skip link and navigation', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  if (testInfo.project.name.startsWith('narrow')) {
    const menu = page.locator('summary');
    await menu.focus();
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('navigation', { name: 'Mobile navigation' }),
    ).toBeVisible();
    await audit(page);
    await page.keyboard.press('Escape');
    await expect(menu).toBeFocused();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.locator('#states')).toBeFocused();
    await expect(page.locator('[data-mobile-menu]')).not.toHaveAttribute(
      'open',
      '',
    );
  }
  await page.getByRole('button', { name: 'Recovery', exact: true }).focus();
  const ring = await page.locator(':focus').evaluate((el) => {
    const style = getComputedStyle(el);
    return { width: style.outlineWidth, shadow: style.boxShadow };
  });
  expect(ring.width).toBe('3px');
  expect(ring.shadow).not.toBe('none');
});

test('demo states, validation, simulated saving and restart', async ({
  page,
}) => {
  await page.goto('/');
  const name = page.getByRole('textbox', { name: 'Display name' });
  const action = page.locator('[data-demo-continue]');
  for (const label of ['Ready', 'Keyboard', 'Recovery', 'Done']) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect(
      page.getByRole('button', { name: label, exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    await audit(page);
  }
  await action.click();
  await expect(name).toBeFocused();
  await name.fill('D');
  await action.focus();
  await page.keyboard.press('Enter');
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(name).toHaveAttribute(
    'aria-describedby',
    'demo-name-hint demo-name-error',
  );
  await name.fill('Devin');
  await expect(name).toHaveAttribute('aria-invalid', 'false');
  await page.clock.install();
  await action.click();
  await expect(action).toBeFocused();
  await expect(action).toHaveAttribute('aria-disabled', 'true');
  await expect(page.locator('[data-demo-form]')).toHaveAttribute(
    'aria-busy',
    'true',
  );
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-demo]')).toHaveAttribute(
    'data-state',
    'processing',
  );
  await audit(page);
  await page.clock.fastForward(1600);
  await expect(action).toHaveText('Restart demo');
  await expect(action).toBeFocused();
  await expect(page.locator('[data-demo-form]')).toHaveAttribute(
    'aria-busy',
    'false',
  );
});

test('filter announces result count without moving focus', async ({ page }) => {
  await page.goto('/');
  for (const topic of ['react', 'javascript', 'web', 'all']) {
    const filter = page.locator(`[data-filter="${topic}"]`);
    await filter.focus();
    await page.keyboard.press('Space');
    await expect(filter).toBeFocused();
    await expect(filter).toHaveAttribute('aria-pressed', 'true');
    const count = await page.locator('[data-post-list] a:visible').count();
    await expect(page.locator('#archive-status')).toContainText(
      `Showing ${count} `,
    );
  }
});

test('WebGL sculpture animates, pauses offscreen, and respects reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const hero = page.locator('[data-hero-motion]');
  const canvas = page.locator('[data-hero-canvas]');
  await expect(page.locator('[data-motion-toggle]')).toHaveCount(0);
  await expect(hero).toHaveAttribute('data-renderer', 'webgl');
  await expect(hero).toHaveAttribute('data-motion', 'running');
  const moving = await canvas.screenshot();
  await expect
    .poll(async () => (await canvas.screenshot()).equals(moving))
    .toBe(false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(hero).toHaveAttribute('data-motion', 'paused');
  const still = await canvas.screenshot();
  await page.mouse.move(200, 150);
  expect((await canvas.screenshot()).equals(still)).toBe(true);
  await page.reload();
  await expect(hero).toHaveAttribute('data-renderer', 'webgl');
  await expect(hero).toHaveAttribute('data-motion', 'paused');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(hero).toHaveAttribute('data-motion', 'running');
  await page.locator('#archive').scrollIntoViewIfNeeded();
  await expect(hero).toHaveAttribute('data-motion', 'paused');
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await expect(hero).toHaveAttribute('data-motion', 'running');
});

test('states lattice runs one lifecycle, pauses offscreen and for reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const lattice = page.locator('[data-lattice]');
  await lattice.scrollIntoViewIfNeeded();
  await expect(lattice).toHaveAttribute('data-renderer', 'webgl');
  await expect(lattice).toHaveAttribute('data-motion', 'running');
  // Decorative only: it must never reach the accessibility tree.
  await expect(lattice).toHaveAttribute('aria-hidden', 'true');
  const moving = await lattice.screenshot();
  await expect
    .poll(async () => (await lattice.screenshot()).equals(moving))
    .toBe(false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(lattice).toHaveAttribute('data-motion', 'paused');
  const still = await lattice.screenshot();
  await page.waitForTimeout(250);
  expect((await lattice.screenshot()).equals(still)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(lattice).toHaveAttribute('data-motion', 'running');
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await expect(lattice).toHaveAttribute('data-motion', 'paused');
});

test('selected work shows each case study as one real screenshot link', async ({
  page,
}) => {
  await page.goto('/');
  const cards = page.locator('#work article a');
  await expect(cards).toHaveCount(3);
  for (const href of ['/work/cape/', '/work/warranties/', '/work/invision/']) {
    const card = page.locator(`#work a[href="${href}"]`);
    await card.scrollIntoViewIfNeeded();
    const image = card.locator('img');
    await expect(image).not.toHaveAttribute('alt', '');
    await expect
      // Lazy images under software-rendered WebGL can take a few seconds.
      .poll(() => image.evaluate((img) => img.complete && img.naturalWidth), {
        timeout: 15000,
      })
      .toBeGreaterThan(0);
    await expect(card.getByRole('heading', { level: 3 })).toBeVisible();
  }
});

test('hero entrance is skipped for reduced motion', async ({ page }) => {
  await page.goto('/');
  const names = await page
    .locator('[data-enter]')
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
  expect(names.length).toBe(4);
  expect(names.every((name) => name === 'none')).toBe(true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();
  await expect
    .poll(() =>
      page
        .locator('[data-enter]')
        .first()
        .evaluate((el) => getComputedStyle(el).animationName),
    )
    .toBe('enter');
});

test('work screenshots draw as tiles but keep the image and its alt text', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const frame = page.locator('#work a[href="/work/cape/"] .work-shot');
  await frame.scrollIntoViewIfNeeded();
  await expect(frame).toHaveAttribute('data-renderer', 'webgl');
  await expect(frame).toHaveAttribute('data-texture', 'ready');
  await expect(frame.locator('canvas')).toHaveAttribute('aria-hidden', 'true');
  // The image stays in the accessibility tree; only its pixels step aside.
  await expect(frame.getByRole('img')).toHaveAttribute('alt', /Cape Assistant/);
  // Keyboard focus gets the same lift a pointer does, and the link keeps its
  // own focus ring.
  const link = page.locator('#work a[href="/work/cape/"]');
  await link.focus();
  const ring = await link.evaluate((el) => getComputedStyle(el).outlineWidth);
  expect(ring).toBe('3px');
  // Forced colours hand the picture back to the <img>.
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(frame.locator('canvas')).toBeHidden();
  await expect(frame.getByRole('img')).toBeVisible();
});

test('the State Shift field follows the demo state, even with reduced motion', async ({
  page,
}) => {
  await page.goto('/');
  const field = page.locator('[data-webgl-scene-value="states-field"]');
  await field.scrollIntoViewIfNeeded();
  await expect(field).toHaveAttribute('data-renderer', 'webgl');
  await expect(field).toHaveAttribute('data-motion', 'paused');
  await expect(field.locator('.states-field')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  const canvas = field.locator('canvas');
  const ready = await canvas.screenshot();
  await page.getByRole('button', { name: 'Recovery', exact: true }).click();
  // Paused for reduced motion, yet it still redraws a still frame per state.
  await expect
    .poll(async () => (await canvas.screenshot()).equals(ready))
    .toBe(false);
  const recovery = await canvas.screenshot();
  await page.waitForTimeout(300);
  expect((await canvas.screenshot()).equals(recovery)).toBe(true);
});

test('the hero only unfolds on scroll when motion is allowed', async ({
  page,
}) => {
  await page.goto('/');
  const hero = page.locator('[data-hero-motion]');
  await expect(hero).toHaveAttribute('data-renderer', 'webgl');
  const canvas = page.locator('[data-hero-canvas]');
  const still = await canvas.screenshot();
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(300);
  expect((await canvas.screenshot()).equals(still)).toBe(true);
});

test('page transitions never block navigation and stay out of reduced motion', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('[data-page-transition]')).toHaveCount(0);

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();
  const sweep = page.locator('[data-page-transition]');
  await expect(sweep).toHaveCount(1);
  await expect(sweep).toHaveAttribute('aria-hidden', 'true');
  await expect(sweep).toHaveCSS('pointer-events', 'none');
  await expect(sweep).toHaveCSS('visibility', 'hidden');
  await page.evaluate(() =>
    document.querySelector('a[href="/work/cape/"]').click(),
  );
  await page.waitForURL('**/work/cape/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(sweep).toHaveCSS('visibility', 'hidden');
  // Back and forward are left instant.
  await page.goBack();
  await page.waitForURL(/\/$/);
  await expect(sweep).toHaveCSS('visibility', 'hidden');
});

test('the 404 lattice scatters the same states out of order', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/404.html');
  const lattice = page.locator('[data-lattice]');
  await expect(lattice).toHaveAttribute('data-lattice-mode', 'scattered');
  await expect(lattice).toHaveAttribute('data-renderer', 'webgl');
  await expect(lattice).toHaveAttribute('aria-hidden', 'true');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('hero keeps an illustration when WebGL is unavailable', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type.startsWith('webgl')
        ? null
        : getContext.call(this, type, ...args);
    };
  });
  await page.goto('/');
  await expect(page.locator('[data-hero-motion]')).toHaveAttribute(
    'data-motion',
    'paused',
  );
  await expect(page.locator('.hero-art-fallback')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  // The lattice has no static counterpart, so it leaves the layout instead.
  await expect(page.locator('[data-lattice]')).toHaveAttribute(
    'data-renderer',
    'none',
  );
  await expect(page.locator('[data-lattice]')).toBeHidden();
  // Project screenshots never depended on a renderer.
  await page.locator('#work').scrollIntoViewIfNeeded();
  await expect(page.locator('#work img').first()).toBeVisible();
});

test('GIF is opt-in and stops for reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(gifPage);
  const container = page.locator('[data-animated-image]');
  const img = container.locator('img');
  await expect(img).toHaveAttribute('src', /\.webp$/);
  await container.getByRole('button', { name: 'Play animation' }).click();
  await expect(img).toHaveAttribute('src', /\.gif$/);
  await container.getByRole('button', { name: 'Stop animation' }).click();
  await expect(img).toHaveAttribute('src', /\.webp$/);
  await container.getByRole('button', { name: 'Play animation' }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(img).toHaveAttribute('src', /\.webp$/);
  await expect(container.getByRole('button')).toBeDisabled();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(container.getByRole('button')).toHaveText('Play animation');
});

test('static content and navigation work without JavaScript', async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: testInfo.project.use.viewport,
    colorScheme: testInfo.project.use.colorScheme,
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4177/');
  await expect(page.locator('[data-state-controls]')).toBeHidden();
  await expect(page.locator('[data-archive-filters]')).toBeHidden();
  await expect(page.locator('[data-demo-continue]')).toBeHidden();
  await expect(page.locator('[data-lattice]')).toBeHidden();
  if (testInfo.project.name.startsWith('desktop')) {
    const width = await page
      .locator('[data-demo]')
      .evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeGreaterThan(700);
  }
  await expect(page.locator('[data-post-list] a').first()).toBeVisible();
  if (testInfo.project.name.startsWith('narrow')) {
    await page.locator('summary').click();
    await expect(
      page.getByRole('navigation', { name: 'Mobile navigation' }),
    ).toBeVisible();
  }
  await page.goto('http://127.0.0.1:4177' + gifPage);
  await expect(page.locator('[data-animated-image] img')).toHaveAttribute(
    'src',
    /\.webp$/,
  );
  await context.close();
});

test('Turbo prefetches an internal link on hover', async ({ page }) => {
  // Turbo marks a speculative fetch with a header rather than a
  // <link rel="prefetch"> element, so the request is what to assert on. It has
  // to send X-Sec-Purpose because Sec-Purpose is a forbidden header name that
  // scripts are not allowed to set.
  const prefetched = [];
  page.on('request', (request) => {
    const headers = request.headers();
    const purpose = headers['x-sec-purpose'] ?? headers['sec-purpose'] ?? '';
    if (purpose.includes('prefetch'))
      prefetched.push(new URL(request.url()).pathname);
  });
  await page.goto('/');
  const link = page.locator('a[href="/work/cape/"]').first();
  await link.scrollIntoViewIfNeeded();
  await link.hover();
  await expect.poll(() => prefetched).toContain('/work/cape/');
});

test('Turbo navigation does not leak WebGL contexts', async ({ page }) => {
  // Turbo swaps the body without reloading, so a surface that never released
  // its context would leak one per visit and exhaust the browser's supply.
  // Stimulus disconnect() is what returns them.
  await page.addInitScript(() => {
    window.__contexts = { created: 0, released: 0 };
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      const context = getContext.call(this, type, ...rest);
      if (context && String(type).startsWith('webgl')) {
        window.__contexts.created++;
        this.addEventListener(
          'webglcontextlost',
          () => window.__contexts.released++,
        );
      }
      return context;
    };
  });
  let fullLoads = 0;
  page.on('load', () => fullLoads++);
  // With motion allowed, so the page-transition context is part of the count.
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('[data-hero-motion]')).toHaveAttribute(
    'data-renderer',
    'webgl',
  );
  const live = () =>
    page.evaluate(() => window.__contexts.created - window.__contexts.released);
  const baseline = await live();
  expect(baseline).toBeGreaterThan(0);
  const loadsBefore = fullLoads;

  for (let visit = 0; visit < 3; visit++) {
    await page.evaluate(() =>
      document.querySelector('a[href="/work/cape/"]').click(),
    );
    await page.waitForURL('**/work/cape/');
    await page.goBack();
    await page.waitForURL(/\/$/);
    await expect(page.locator('[data-hero-motion]')).toHaveAttribute(
      'data-renderer',
      'webgl',
    );
  }

  await expect.poll(live).toBe(baseline);
  expect(fullLoads - loadsBefore, 'Turbo should drive navigation').toBe(0);
});

test('forced-colors retains a visible keyboard outline', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  const outline = await page.locator(':focus').evaluate((el) => {
    const style = getComputedStyle(el);
    return { width: style.outlineWidth, style: style.outlineStyle };
  });
  expect(outline).toEqual({ width: '3px', style: 'solid' });
});
