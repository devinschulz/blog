import { test, expect } from '@playwright/test';

const dark = 'rgb(26, 27, 25)';
const light = 'rgb(245, 245, 243)';

test('dark system preference survives unavailable storage before CSS loads', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Storage unavailable', 'SecurityError');
      },
    });
  });
  await page.route('**/*.css', (route) => route.abort());
  await page.goto('/blog/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveCSS('background-color', dark);
  await expect(page.locator('body')).toHaveCSS('background-color', dark);
});

test('system dark mode paints correctly without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  try {
    await page.goto(`${baseURL}/blog/`);
    await expect(page.locator('html')).toHaveCSS('background-color', dark);
    await expect(page.locator('body')).toHaveCSS('background-color', dark);
  } finally {
    await context.close();
  }
});

for (const theme of ['light', 'dark']) {
  test(`saved ${theme} theme paints before CSS and overrides the system`, async ({
    page,
  }) => {
    await page.emulateMedia({
      colorScheme: theme === 'dark' ? 'light' : 'dark',
    });
    await page.addInitScript(
      (theme) => localStorage.setItem('portfolio-theme', theme),
      theme,
    );
    await page.route('**/*.css', (route) => route.abort());
    await page.goto('/blog/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.locator('html')).toHaveCSS(
      'background-color',
      theme === 'dark' ? dark : light,
    );
    await expect(page.locator('body')).toHaveCSS(
      'background-color',
      theme === 'dark' ? dark : light,
    );
    const colors = await page
      .locator('meta[name="theme-color"]')
      .evaluateAll((tags) => tags.map((tag) => tag.content));
    expect(
      colors.every(
        (color) => color === (theme === 'dark' ? '#1a1b19' : '#f5f5f3'),
      ),
    ).toBe(true);
  });
}

test('theme colors follow toggles, navigation, and reloads', async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/blog/');
  const toggle = page.getByRole('button', { name: 'Switch to light theme' });
  if (isMobile) await toggle.tap();
  else await toggle.click();
  await expect(page.locator('body')).toHaveCSS('background-color', light);
  await expect(
    page.locator('meta[name="theme-color"]').first(),
  ).toHaveAttribute('content', '#f5f5f3');
  await page.getByRole('link', { name: 'Devin Schulz, home' }).click();
  await expect(page.locator('body')).toHaveCSS('background-color', light);
  await expect(
    page.locator('meta[name="theme-color"]').first(),
  ).toHaveAttribute('content', '#2449ef');
  await page.reload();
  await expect(page.locator('body')).toHaveCSS('background-color', light);
});
