import { test, expect } from '@playwright/test';

test('tracks successful logo activation once, not ordinary clicks or keyboard activation', async ({
  page,
}) => {
  await page.route(
    'https://green-disk-c9b4.devin5443.workers.dev/**',
    (route) => route.abort(),
  );
  await page.addInitScript(() => {
    window.trackedEvents = [];
    window.plausible = (name) => window.trackedEvents.push(name);
  });
  await page.goto('/');
  await expect(page.locator('.theme-toggle')).toBeVisible();
  const logo = page.locator('.brand');
  for (let i = 0; i < 4; i++) await logo.click();
  expect(await page.evaluate(() => window.trackedEvents)).toEqual([]);
  await logo.click();
  await expect(
    page.getByRole('region', { name: 'Inspect mode', exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => window.trackedEvents)).toEqual([
    'Logo Easter Egg Activated',
  ]);
  await page.getByRole('button', { name: 'Close Inspect mode' }).click();
  await page.keyboard.type('inspect');
  await expect(
    page.getByRole('region', { name: 'Inspect mode', exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => window.trackedEvents)).toEqual([
    'Logo Easter Egg Activated',
  ]);
});

test('logo activation still works when analytics is unavailable', async ({
  page,
}) => {
  await page.route(
    'https://green-disk-c9b4.devin5443.workers.dev/**',
    (route) => route.abort(),
  );
  await page.goto('/');
  await expect(page.locator('.theme-toggle')).toBeVisible();
  await page.evaluate(() => {
    delete window.plausible;
  });
  for (let i = 0; i < 5; i++) await page.locator('.brand').click();
  await expect(
    page.getByRole('region', { name: 'Inspect mode', exact: true }),
  ).toBeVisible();
});
