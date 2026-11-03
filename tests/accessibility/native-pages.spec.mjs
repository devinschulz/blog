import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/js/script.js', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: '' }),
  );
});

test('titles and project images never request a graphics context', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    window.__graphicsRequests = [];
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      if (/webgl/i.test(kind)) {
        window.__graphicsRequests.push(kind);
        return null;
      }
      return original.call(this, kind, ...args);
    };
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const path of [
    '/',
    '/blog/',
    '/tags/',
    '/tags/react/',
    '/work/',
    '/work/cape/',
    '/work/warranties/',
    '/work/invision/',
    '/blog/building-a-chat-interface-that-doesnt-fight-your-scroll-position/',
  ]) {
    await page.goto(path);
    const title = page.getByRole('heading', { level: 1 });
    await expect(title).toBeVisible();
    await expect(title).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    await expect(title).not.toHaveCSS('user-select', 'none');
    const bounds = await title.boundingBox();
    await page.mouse.move(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
    );
    if (path === '/work/') await page.locator('.project-art').first().hover();
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect(
      page.locator('[data-wave-trigger], [data-fish-toggle]'),
    ).toHaveCount(0);
    expect(await page.evaluate(() => window.__graphicsRequests)).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test('project views switch natively with keyboard and reset after navigation', async ({
  page,
}) => {
  await page.goto('/work/');
  for (const name of ['Cape', 'Warranties', 'InVision']) {
    const project = page.locator('[data-project-preview]').filter({
      has: page.getByRole('heading', { name, exact: true }),
    });
    const button = project.locator('[data-preview-toggle]');
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(project.locator('[data-project-detail]')).toBeVisible();
    await expect(project.getByRole('status')).toContainText(
      `${name}: view 2 of 2`,
    );
    await expect(button).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expect(project.locator('[data-project-detail]')).toBeHidden();
    await expect(project.locator('.project-main img').first()).toBeVisible();
  }
  await page.locator('.project-0 [data-preview-toggle]').click();
  await expect(
    page.locator('.project-0 [data-preview-toggle]'),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.project-0 .project-link').click();
  await page.waitForURL('**/work/cape/');
  await page.goBack();
  await expect(
    page.locator('.project-0 [data-preview-toggle]'),
  ).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.project-0 [data-project-detail]')).toBeHidden();
});

test('failed project image decoding preserves the current view and allows retry', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.__failPreviewDecode = true;
    const original = HTMLImageElement.prototype.decode;
    HTMLImageElement.prototype.decode = function () {
      if (this.matches('[data-project-detail]') && window.__failPreviewDecode)
        return Promise.reject(new Error('Image unavailable'));
      return original.call(this);
    };
  });
  await page.goto('/work/');
  const project = page.locator('.project-0');
  const button = project.locator('[data-preview-toggle]');
  await button.click();
  await expect(project.getByRole('status')).toContainText(
    'Couldn’t load this view',
  );
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await expect(button).not.toHaveAttribute('aria-busy');
  await expect(project.locator('.project-main img').first()).toBeVisible();
  await page.evaluate(() => {
    window.__failPreviewDecode = false;
  });
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(project.locator('[data-project-detail]')).toBeVisible();
});

test('pending project views cannot change a saved navigation state', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLImageElement.prototype.decode;
    HTMLImageElement.prototype.decode = function () {
      if (this.matches('[data-project-detail]'))
        return new Promise((resolve) => {
          window.__finishPreview = resolve;
        });
      return original.call(this);
    };
  });
  await page.goto('/work/');
  const button = page.locator('.project-0 [data-preview-toggle]');
  await button.click();
  await expect(button).toHaveAttribute('aria-busy', 'true');
  await page.evaluate(() =>
    document.dispatchEvent(new Event('turbo:before-cache')),
  );
  await page.evaluate(() => window.__finishPreview());
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await expect(button).not.toHaveAttribute('aria-busy');
  await expect(button).toContainText('Show other view');
  await expect(page.locator('.project-0 [data-project-detail]')).toBeHidden();
});

test('titles, project links, and writing work without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
  });
  try {
    const page = await context.newPage();
    await page.goto('/work/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.project-main img').first()).toBeVisible();
    await expect(page.locator('[data-preview-toggle]').first()).toBeHidden();
    await page.locator('.project-0 .project-link').click();
    await expect(page).toHaveURL(/\/work\/cape\/$/);
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Hi, I’m Devin.' }),
    ).toBeVisible();
    await page.locator('.article-preview-title').first().click();
    await expect(page).toHaveURL(/\/blog\/building-a-chat-interface/);
  } finally {
    await context.close();
  }
});
