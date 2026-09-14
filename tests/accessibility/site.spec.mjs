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

test('project tiles render over their CSS illustration', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('#work').scrollIntoViewIfNeeded();
  for (const name of ['cape', 'warranties', 'invision']) {
    const tile = page.locator(`[data-work-tile="${name}"]`);
    // Narrow viewports stack the tiles, so each only runs once it is in view.
    await tile.scrollIntoViewIfNeeded();
    await expect(tile).toHaveAttribute('data-renderer', 'webgl');
    await expect(tile).toHaveAttribute('data-motion', 'running');
    await expect(tile).toHaveAttribute('aria-hidden', 'true');
  }
  await page.locator('[data-work-tile="cape"]').scrollIntoViewIfNeeded();
  // The illustration underneath steps aside only once a renderer has taken over.
  await expect(
    page.locator('[data-work-tile="cape"] .tile-fallback'),
  ).toBeHidden();
  const tile = page.locator('[data-work-tile="cape"]');
  const moving = await tile.screenshot();
  await expect
    .poll(async () => (await tile.screenshot()).equals(moving))
    .toBe(false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(tile).toHaveAttribute('data-motion', 'paused');
});

test('current chapter backdrop stays behind its text', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const panel = page.locator('[data-chapter-backdrop]');
  await panel.scrollIntoViewIfNeeded();
  await expect(panel).toHaveAttribute('data-renderer', 'webgl');
  await expect(panel).toHaveAttribute('data-motion', 'running');
  await expect(panel.locator('canvas')).toHaveAttribute('aria-hidden', 'true');
  // Held well under full strength; every tile colour is darker than the panel,
  // so the copy over it keeps the contrast it has on the flat background.
  const opacity = await panel
    .locator('canvas')
    .evaluate((el) => getComputedStyle(el).opacity);
  expect(Number(opacity)).toBeLessThanOrEqual(0.5);
  await expect(panel.getByRole('heading', { level: 2 })).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(panel).toHaveAttribute('data-motion', 'paused');
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
  // Project tiles fall back to the CSS illustration they were built with.
  await page.locator('#work').scrollIntoViewIfNeeded();
  await expect(
    page.locator('[data-work-tile="cape"] .tile-fallback'),
  ).toBeVisible();
  await expect(
    page.locator('[data-work-tile="invision"] .tile-fallback'),
  ).toBeVisible();
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

test('focusing an internal link prefetches it, once, and skips the rest', async ({
  page,
}) => {
  await page.goto('/');
  const hints = page.locator('link[rel="prefetch"]');
  await expect(hints).toHaveCount(0);

  const link = page.locator('a[href^="/work/"]').first();
  await link.focus();
  await expect(hints).toHaveCount(1);
  await expect(hints.first()).toHaveAttribute('as', 'document');
  expect(await hints.first().getAttribute('href')).toContain('/work/');

  // Re-focusing the same link must not queue it twice.
  await page.locator('a[href^="/blog/"], a[href^="/work/"]').nth(1).focus();
  await link.focus();
  await expect(hints).toHaveCount(2);

  // A fragment on the current page, an external host and a mailto have
  // nothing to fetch.
  const before = await hints.count();
  await page.locator('a[href="#content"]').first().focus();
  await page.locator('a[href^="mailto:"]').first().focus();
  await page.locator('a[href^="https://github.com"]').first().focus();
  await expect(hints).toHaveCount(before);
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
