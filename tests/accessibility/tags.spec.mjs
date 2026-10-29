import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const chat =
  '/blog/building-a-chat-interface-that-doesnt-fight-your-scroll-position/';
const title =
  "Building a Chat Interface That Doesn't Fight Your Scroll Position";

test('article tags open a topic archive, keep newest posts first, and support keyboard navigation', async ({
  page,
}) => {
  await page.goto(chat);
  const react = page
    .locator('.article-hero')
    .getByRole('link', { name: 'React', exact: true });
  await expect(react).toHaveAttribute('rel', 'tag');
  await react.focus();
  await react.press('Enter');
  await expect(page).toHaveURL(/\/tags\/react\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('React');
  const posts = page.locator('[data-post-list] .post-link');
  await expect(posts.first()).toHaveAttribute('href', chat);
  const dates = await posts
    .locator('time')
    .evaluateAll((nodes) => nodes.map((node) => node.dateTime));
  expect(dates).toEqual([...dates].sort().reverse());
  await expect(page.locator('.desktop-nav a[href="/blog/"]')).toHaveAttribute(
    'aria-current',
    'true',
  );
  await posts.first().click();
  await expect(page.locator('.article-hero h1')).toHaveText(title);
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('React');
});

test('archive rows and related posts have independent tag and article destinations', async ({
  page,
}) => {
  await page.goto('/blog/');
  const row = page
    .locator('.post-row')
    .filter({ has: page.getByRole('heading', { name: title, exact: true }) });
  await row.getByRole('link', { name: 'UX', exact: true }).click();
  await expect(page).toHaveURL(/\/tags\/ux\/$/);
  await expect(page.locator('[data-post-list] .post-link')).toHaveCount(1);
  await page.locator('[data-post-list] .post-link').click();
  await expect(page.locator('.article-hero h1')).toHaveText(title);

  const more = page.getByRole('region', { name: 'More writing' });
  const tag = more.locator('a[rel="tag"]').first();
  const destination = await tag.getAttribute('href');
  await tag.click();
  await expect(page).toHaveURL(new RegExp(destination + '$'));
  await expect(
    page.locator('[data-post-list] .post-link').first(),
  ).toBeVisible();
});

test('the tag index exposes topics with spaces and a way back to all writing', async ({
  page,
}) => {
  await page.goto('/blog/');
  await page.getByRole('link', { name: 'Browse tags', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Browse writing by tag',
  );
  await page
    .getByRole('navigation', { name: 'Writing tags' })
    .getByRole('link', { name: /^Static Sites / })
    .click();
  await expect(page).toHaveURL(/\/tags\/static-sites\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Static Sites',
  );
  await expect(page.locator('[data-post-list] .post-link')).toContainText([
    'From Hugo to Next.js and Back Again',
  ]);
  await page.getByRole('link', { name: 'All tags', exact: true }).click();
  await page.getByRole('link', { name: 'All writing', exact: true }).click();
  await expect(page).toHaveURL(/\/blog\/$/);
});

test('tag pages remain readable, accessible, and usable with text spacing in both themes', async ({
  page,
}) => {
  for (const route of ['/tags/', '/tags/react/', '/tags/static-sites/']) {
    await page.goto(route);
    const audit = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(audit.violations).toEqual([]);
    await page.addStyleTag({
      content:
        '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }',
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    const nested = await page
      .locator('a[rel="tag"]')
      .evaluateAll((links) =>
        links.some((link) => link.parentElement.closest('a')),
      );
    expect(nested).toBe(false);
  }
});

test('tag browsing works without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  await page.goto(chat);
  await page
    .locator('.article-hero')
    .getByRole('link', { name: 'React', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('React');
  await page.locator('[data-post-list] .post-link').first().click();
  await expect(page.locator('.article-hero h1')).toHaveText(title);
  await context.close();
});
