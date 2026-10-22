import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Inspect is dormant until discovered, measures real elements, and exits cleanly', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  await expect(page.locator('[data-inspect-ui]')).toHaveCount(0);
  const heading = page.locator('#hero-title');
  const before = await heading.boundingBox();
  await page.keyboard.type('inspect');
  const panel = page.getByRole('region', { name: 'Inspect mode', exact: true });
  await expect(panel).toBeVisible();
  await expect(
    panel.getByRole('button', { name: 'Close Inspect mode' }),
  ).toBeFocused();
  if (isMobile) await heading.tap();
  else await heading.click();
  await expect(panel.locator('[data-inspect-element]')).toHaveText(
    'h1#hero-title',
  );
  // Focusing a real page link also exercises the keyboard inspection route.
  const work = page.getByRole('link', { name: 'Explore selected work' });
  await work.focus();
  await expect(panel.locator('[data-inspect-element]')).toHaveText('a');
  const rect = await work.boundingBox();
  await expect(panel.locator('[data-inspect-size]')).toHaveText(
    `${Math.round(rect.width * 10) / 10} × ${Math.round(rect.height * 10) / 10} px`,
  );
  await expect(panel.locator('[data-inspect-type]')).toContainText('DM Sans');
  const padding = await work.evaluate((element) =>
    ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']
      .map(
        (side) =>
          Math.round(parseFloat(getComputedStyle(element)[side]) * 10) / 10,
      )
      .join(' / '),
  );
  await expect(panel.locator('[data-inspect-padding]')).toHaveText(
    `${padding} px`,
  );
  await page.keyboard.press('Enter');
  expect(new URL(page.url()).hash).toBe('');
  await panel.getByRole('button', { name: 'Parent', exact: false }).click();
  await expect(panel.locator('[data-inspect-element]')).toHaveText('div');
  expect(await heading.boundingBox()).toEqual(before);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const results = await new AxeBuilder({ page })
    .include('[data-inspect-ui]')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
  await panel.evaluate((element) => {
    const sizes = [element, ...element.querySelectorAll('*')].map((node) => [
      node,
      parseFloat(getComputedStyle(node).fontSize) * 2,
    ]);
    for (const [node, size] of sizes) node.style.fontSize = `${size}px`;
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const closeBounds = await panel
    .getByRole('button', { name: 'Close Inspect mode' })
    .boundingBox();
  expect(closeBounds.x).toBeGreaterThanOrEqual(0);
  expect(closeBounds.x + closeBounds.width).toBeLessThanOrEqual(
    await page.evaluate(() => innerWidth),
  );
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveAttribute('data-inspect-active');
  await work.click();
  await expect(page).toHaveURL(/#work$/);
});

test('typing in editable controls and browser shortcuts cannot reveal Inspect', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => {
    const input = document.createElement('input');
    input.id = 'inspect-test-input';
    input.setAttribute('aria-label', 'Test writing');
    document.querySelector('main').prepend(input);
  });
  await page.getByLabel('Test writing').fill('inspect');
  await page.getByLabel('Test writing').pressSequentially('inspect');
  await expect(page.locator('[data-inspect-ui]')).toHaveCount(0);
  await page.getByLabel('Test writing').evaluate((input) => input.remove());
  await page.keyboard.type('ins');
  await page.keyboard.press('Control+a');
  await page.keyboard.type('pect');
  await expect(page.locator('[data-inspect-ui]')).toHaveCount(0);
});

test('five logo taps reveal Inspect, touch selection preserves scrolling, and Done restores links', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Touch discovery runs in the iPhone WebKit project.');
  await page.goto('/');
  const brand = page.getByRole('link', { name: 'Devin Schulz, home' });
  for (let tap = 0; tap < 5; tap++) await brand.tap();
  const panel = page.getByRole('region', { name: 'Inspect mode', exact: true });
  await expect(panel).toBeVisible();
  await panel.getByRole('button', { name: 'Hide Inspect details' }).tap();
  await expect(panel.locator('dl')).toBeHidden();
  await page.getByRole('link', { name: 'Explore selected work' }).tap();
  await panel.getByRole('button', { name: 'Show Inspect details' }).tap();
  await expect(panel.locator('[data-inspect-element]')).toHaveText('a');
  expect(new URL(page.url()).hash).toBe('');
  await page.evaluate(() => window.scrollTo(0, 500));
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await panel.getByRole('button', { name: 'Close Inspect mode' }).tap();
  await expect(panel).toHaveCount(0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await brand.tap();
  await expect(page.locator('[data-inspect-ui]')).toHaveCount(0);
});

test('Inspect cleans up for Turbo navigation and can be rediscovered', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.type('inspect');
  await expect(page.locator('[data-inspect-ui]')).toHaveCount(1);
  await page.evaluate(() => window.Turbo.visit('/blog/'));
  await page.waitForURL('**/blog/');
  await expect(page.locator('[data-inspect-ui]')).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveAttribute('data-inspect-active');
  await page.keyboard.type('inspect');
  await expect(page.locator('[data-inspect-ui]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Close Inspect mode' }).click();
  await page.goBack();
  await expect(page.locator('[data-inspect-ui]')).toHaveCount(0);
});

test('Inspect restores native graphics and respects reduced motion on exit', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop-light',
    'One desktop run covers the graphics lifecycle.',
  );
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('.hero-title')).toHaveClass(
    /(^|\s)is-spatial(\s|$)/,
  );
  await page.keyboard.type('inspect');
  await expect(page.locator('.hero canvas')).toHaveCount(0);
  await expect(page.locator('.hero-title')).not.toHaveClass(
    /(^|\s)is-spatial(\s|$)/,
  );
  await page.keyboard.press('Escape');
  await expect(page.locator('.hero-title')).toHaveClass(
    /(^|\s)is-spatial(\s|$)/,
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.keyboard.type('inspect');
  await page.getByRole('button', { name: 'Close Inspect mode' }).click();
  await expect(page.locator('.hero canvas')).toHaveCount(0);
});
