import { test, expect } from '@playwright/test';

const demos = [
  {
    route: '/blog/rendering-markdown-while-streaming/',
    host: '[data-streaming-markdown-root]',
    button: 'Next chunk',
  },
  {
    route:
      '/blog/building-a-chat-interface-that-doesnt-fight-your-scroll-position/',
    host: '[data-chat-scroll-root]',
    button: 'Stream a reply',
  },
];

test('demo scripts survive Cloudflare rewriting during navigation and history restoration', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  let optimizedResponses = 0;
  // Cloudflare leaves opted-out scripts executable. Untagged scripts become
  // inert data blocks; Turbo cannot start those when it swaps article bodies.
  await page.route('**/*', async (route) => {
    const request = route.request();
    if (!request.headers()['x-turbo-request-id']) return route.continue();
    const response = await route.fetch();
    if (!(response.headers()['content-type'] || '').includes('text/html')) {
      return route.fulfill({ response });
    }
    optimizedResponses++;
    const body = (await response.text()).replace(/<script\b[^>]*>/g, (tag) => {
      if (
        tag.includes('application/ld+json') ||
        tag.includes('data-cfasync="false"')
      )
        return tag;
      return tag.replace(
        '<script',
        '<script type="cloudflare-text/javascript"',
      );
    });
    await route.fulfill({ response, body });
  });
  await page.goto('/blog/');
  for (const demo of demos) {
    await page.locator(`[data-post-list] a[href="${demo.route}"]`).click();
    await expect(page).toHaveURL(new RegExp(demo.route + '$'));
    const host = page.locator(demo.host);
    await expect(
      host.getByRole('button', { name: demo.button, exact: true }),
    ).toBeVisible();
    await host.getByRole('button', { name: demo.button, exact: true }).click();
    await expect(
      host
        .getByRole('button', { name: 'Reset', exact: true })
        .or(host.getByRole('button', { name: 'Reset demo', exact: true })),
    ).toBeVisible();
    await page
      .locator('.article-hero')
      .getByRole('link', { name: 'All writing', exact: true })
      .click();
    await expect(page).toHaveURL(/\/blog\/$/);
    await expect(page.locator('#archive-title')).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(demo.route + '$'));
    await expect(
      host.getByRole('button', { name: demo.button, exact: true }),
    ).toBeVisible();
    await expect(host).toHaveCount(1);
    await page.goForward();
    await expect(page).toHaveURL(/\/blog\/$/);
    await expect(page.locator('#archive-title')).toBeVisible();
  }
  expect(optimizedResponses).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

for (const demo of demos) {
  test(`cached ${demo.host} retains its fallback until React remounts`, async ({
    page,
  }) => {
    await page.goto(demo.route);
    const host = page.locator(demo.host);
    await expect(
      host.getByRole('button', { name: demo.button, exact: true }),
    ).toBeVisible();
    await page.evaluate(() =>
      document.dispatchEvent(new Event('turbo:before-cache')),
    );
    await expect(host).toContainText('JavaScript');
    await expect(host.locator('button')).toHaveCount(0);
    await page.evaluate(() =>
      document.dispatchEvent(new Event('turbo:render')),
    );
    await expect(
      host.getByRole('button', { name: demo.button, exact: true }),
    ).toBeVisible();
    await page.evaluate(() => document.dispatchEvent(new Event('turbo:load')));
    await expect(
      host.getByRole('button', { name: demo.button, exact: true }),
    ).toHaveCount(1);
  });
}
