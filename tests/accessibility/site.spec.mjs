import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

const pages = fs.readdirSync('dist', { recursive: true }).filter(file => file.endsWith('.html'));
const gifPage = '/blog/my-definition-of-a-first-class-pull-request/';

async function audit(page) {
  await page.evaluate(() => document.fonts.ready);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) }))).toEqual([]);
}

async function expectReflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  // Hero overflow is intentionally clipped for artwork, but never for its text.
  const clippedHeadings = await page.locator('h1, h2, h3').evaluateAll(headings => headings.flatMap(heading => {
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    let node;
    const clipped = [];
    while ((node = walker.nextNode())) {
      if (!node.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) {
        if (rect.left < -1 || rect.right > innerWidth + 1) clipped.push(node.textContent.trim());
      }
    }
    return clipped;
  }));
  expect(clippedHeadings).toEqual([]);
  if (await page.locator('[data-demo-form]').count()) {
    const overlaps = await page.locator('[data-demo-form]').evaluate(form =>
      form.getBoundingClientRect().bottom > document.querySelector('[data-demo-steps]').getBoundingClientRect().top
    );
    expect(overlaps, 'Demo form must not overlap the progress row').toBe(false);
  }
}

for (const file of pages) {
  test(`page audit and text-spacing reflow: ${file}`, async ({ page }) => {
    await page.goto('/' + file.replace(/index\.html$/, ''));
    await audit(page);
    await expectReflow(page);
    await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }' });
    await expectReflow(page);
  });
}

test('keyboard skip link and navigation', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  if (testInfo.project.name.startsWith('narrow')) {
    const menu = page.locator('summary');
    await menu.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
    await audit(page);
    await page.keyboard.press('Escape');
    await expect(menu).toBeFocused();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.locator('#states')).toBeFocused();
    await expect(page.locator('[data-mobile-menu]')).not.toHaveAttribute('open', '');
  }
  await page.getByRole('button', { name: 'Recovery', exact: true }).focus();
  const ring = await page.locator(':focus').evaluate(el => {
    const style = getComputedStyle(el);
    return { width: style.outlineWidth, shadow: style.boxShadow };
  });
  expect(ring.width).toBe('3px');
  expect(ring.shadow).not.toBe('none');
});

test('demo states, validation, simulated saving and restart', async ({ page }) => {
  await page.goto('/');
  const name = page.getByRole('textbox', { name: 'Display name' });
  const action = page.locator('[data-demo-continue]');
  for (const label of ['Ready', 'Keyboard', 'Recovery', 'Done']) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect(page.getByRole('button', { name: label, exact: true })).toHaveAttribute('aria-pressed', 'true');
    await audit(page);
  }
  await action.click();
  await expect(name).toBeFocused();
  await name.fill('D');
  await action.focus();
  await page.keyboard.press('Enter');
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(name).toHaveAttribute('aria-describedby', 'demo-name-hint demo-name-error');
  await name.fill('Devin');
  await expect(name).toHaveAttribute('aria-invalid', 'false');
  await page.clock.install();
  await action.click();
  await expect(action).toBeFocused();
  await expect(action).toHaveAttribute('aria-disabled', 'true');
  await expect(page.locator('[data-demo-form]')).toHaveAttribute('aria-busy', 'true');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-demo]')).toHaveAttribute('data-state', 'processing');
  await audit(page);
  await page.clock.fastForward(1600);
  await expect(action).toHaveText('Restart demo');
  await expect(action).toBeFocused();
  await expect(page.locator('[data-demo-form]')).toHaveAttribute('aria-busy', 'false');
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
    await expect(page.locator('#archive-status')).toContainText(`Showing ${count} `);
  }
});

test('system reduced motion stops drift and parallax without site controls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const hero = page.locator('[data-hero-motion]');
  await expect(page.locator('[data-motion-toggle]')).toHaveCount(0);
  await expect(hero).toHaveAttribute('data-motion', 'running');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(hero).toHaveAttribute('data-motion', 'paused');
  const circles = page.locator('[data-parallax]');
  const before = await circles.evaluateAll(els => els.map(el => el.style.getPropertyValue('--parallax-y')));
  await page.evaluate(() => scrollTo(0, 200));
  await expect.poll(() => circles.evaluateAll(els => els.map(el => el.style.getPropertyValue('--parallax-y')))).toEqual(before);
  await page.reload();
  await expect(hero).toHaveAttribute('data-motion', 'paused');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => scrollTo(0, 0));
  await expect(hero).toHaveAttribute('data-motion', 'running');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(hero).toHaveAttribute('data-motion', 'paused');
  await expect(page.locator('[data-parallax] > span').first()).toHaveCSS('animation-name', 'none');
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

test('static content and navigation work without JavaScript', async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport, colorScheme: testInfo.project.use.colorScheme });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4177/');
  await expect(page.locator('[data-state-controls]')).toBeHidden();
  await expect(page.locator('[data-archive-filters]')).toBeHidden();
  await expect(page.locator('[data-demo-continue]')).toBeHidden();
  if (testInfo.project.name.startsWith('desktop')) {
    const width = await page.locator('[data-demo]').evaluate(el => el.getBoundingClientRect().width);
    expect(width).toBeGreaterThan(700);
  }
  await expect(page.locator('[data-post-list] a').first()).toBeVisible();
  if (testInfo.project.name.startsWith('narrow')) {
    await page.locator('summary').click();
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
  }
  await page.goto('http://127.0.0.1:4177' + gifPage);
  await expect(page.locator('[data-animated-image] img')).toHaveAttribute('src', /\.webp$/);
  await context.close();
});

test('forced-colors retains a visible keyboard outline', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  const outline = await page.locator(':focus').evaluate(el => {
    const style = getComputedStyle(el);
    return { width: style.outlineWidth, style: style.outlineStyle };
  });
  expect(outline).toEqual({ width: '3px', style: 'solid' });
});
