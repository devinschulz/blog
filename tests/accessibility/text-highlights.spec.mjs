import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const route = '/blog/highlighting-text-without-wrapping-it-in-spans/';

test('search crosses inline elements without changing markup, and annotations survive reflow', async ({
  page,
}, testInfo) => {
  await page.goto(route);
  const demo = page.locator('[data-text-highlights-demo]');
  const query = demo.getByRole('searchbox');
  await expect(query).toBeVisible();
  const passage = demo.locator('[data-highlight-passage]');
  const original = await passage.innerHTML();
  await query.fill('cross bold text');
  await expect(demo.locator('[data-highlight-status]')).toContainText(
    '1 match.',
  );
  expect(
    await page.evaluate(() => {
      const range = [...CSS.highlights.get('blog-text-search')][0];
      return {
        text: range.toString(),
        start: range.startContainer.parentElement.tagName,
        end: range.endContainer.parentElement.tagName,
      };
    }),
  ).toEqual({ text: 'cross bold text', start: 'P', end: 'STRONG' });
  await query.fill('bold text, include a link');
  await expect(demo.locator('[data-highlight-status]')).toContainText(
    '1 match.',
  );
  expect(
    await page.evaluate(
      () =>
        [...CSS.highlights.get('blog-text-search')][0].endContainer
          .parentElement.tagName,
    ),
  ).toBe('A');
  await query.fill('text');
  await demo.getByRole('checkbox').check();
  await expect(demo.locator('[data-highlight-status]')).toContainText(
    '2 annotations shown.',
  );
  const slider = demo.getByRole('slider');
  await slider.focus();
  await slider.press('Home');
  await expect(slider).toHaveValue('55');
  expect(await passage.innerHTML()).toBe(original);
  expect(
    await page.evaluate(() => ({
      search: CSS.highlights.get('blog-text-search').size,
      notes: CSS.highlights.get('blog-text-notes').size,
      priority:
        CSS.highlights.get('blog-text-search').priority >
        CSS.highlights.get('blog-text-notes').priority,
    })),
  ).toEqual({ search: 2, notes: 2, priority: true });
  await demo.getByText('See the original markup', { exact: true }).click();
  await expect(demo.locator('[data-highlight-integrity]')).toContainText(
    'Markup unchanged',
  );
  await expect(demo.locator('pre code')).toContainText(
    '<strong>bold text</strong>',
  );
  await expect(
    demo.getByRole('button', { name: 'Copy HTML code' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  const audit = await new AxeBuilder({ page })
    .include('[data-text-highlights-demo]')
    .analyze();
  expect(audit.violations).toEqual([]);
  if (
    ['desktop-light', 'narrow-light', 'desktop-dark'].includes(
      testInfo.project.name,
    )
  ) {
    await demo.screenshot({
      path: `/tmp/blog-highlights-${testInfo.project.name}.png`,
    });
  }
  await query.fill('text. Resize');
  await expect(demo.locator('[data-highlight-status]')).toContainText(
    '1 match.',
  );
  await query.fill('a+b');
  await expect(demo.locator('[data-highlight-status]')).toContainText(
    '0 matches.',
  );
  await query.fill('');
  await expect(demo.locator('[data-highlight-status]')).toContainText(
    '0 matches.',
  );
});

test('navigation cleans up owned highlights and remounts once from history', async ({
  page,
}) => {
  await page.goto('/blog/');
  await page.locator(`[data-post-list] a[href="${route}"]`).click();
  const demo = page.locator('[data-text-highlights-demo]');
  await expect(demo.getByRole('searchbox')).toBeVisible();
  await demo.getByRole('checkbox').check();
  await page.evaluate(() =>
    CSS.highlights.set('another-component', new Highlight()),
  );
  await page
    .locator('.article-hero')
    .getByRole('link', { name: 'All writing', exact: true })
    .click();
  await expect(page).toHaveURL(/\/blog\/$/);
  expect(
    await page.evaluate(() => ({
      own:
        CSS.highlights.has('blog-text-search') ||
        CSS.highlights.has('blog-text-notes'),
      other: CSS.highlights.has('another-component'),
    })),
  ).toEqual({ own: false, other: true });
  await page.goBack();
  await expect(demo.getByRole('searchbox')).toHaveCount(1);
  await expect(demo.getByRole('searchbox')).toBeVisible();
  await expect(demo.getByRole('checkbox')).not.toBeChecked();
  await demo.getByRole('searchbox').fill('cross bold text');
  await expect(demo.locator('[data-highlight-status]')).toContainText(
    '1 match.',
  );
  const markdown = await (await page.request.get(route + 'index.md')).text();
  expect(markdown).toContain('export function findTextRanges');
  expect(markdown).toContain('Try the text highlighting playground');
  expect(markdown).not.toContain('{{< text-highlights-');
});

test('sample and article remain readable without JavaScript or highlight support', async ({
  browser,
  page,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const plain = await context.newPage();
  await plain.goto('http://127.0.0.1:4177' + route);
  await expect(plain.locator('[data-highlight-passage]')).toContainText(
    'bold text',
  );
  await expect(plain.locator('[data-highlight-fallback]')).toBeVisible();
  await expect(plain.getByRole('searchbox')).toBeHidden();
  await expect(
    plain.getByRole('heading', {
      name: 'A range can cross element boundaries',
    }),
  ).toBeVisible();
  await context.close();
  await page.addInitScript(() =>
    Object.defineProperty(window, 'Highlight', {
      value: undefined,
      configurable: true,
    }),
  );
  await page.goto(route);
  await expect(page.locator('[data-highlight-fallback]')).toContainText(
    'does not support',
  );
  await expect(page.locator('[data-highlight-passage]')).toBeVisible();
  await expect(page.getByRole('searchbox')).toBeHidden();
});
