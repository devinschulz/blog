import { test, expect } from '@playwright/test';

test('logo counts bounce without replacing the homepage', async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('.theme-toggle')).toBeVisible();
  const brand = page.getByRole('link', { name: 'Devin Schulz, home' });
  const original = await brand.elementHandle();
  for (let count = 1; count <= 3; count++) {
    if (isMobile) await brand.tap();
    else await brand.click();
    const pop = page.locator(`[data-logo-count="${count}"]`);
    await expect(pop).toHaveText(`+${count}`);
    await expect(pop).toHaveAttribute('aria-hidden', 'true');
    expect(await original.evaluate((element) => element.isConnected)).toBe(
      true,
    );
  }
  await expect(page.locator('[data-logo-count]')).toHaveCount(0);
});

test('reduced motion uses a static count, clears it on navigation, and retains the tally', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  await expect(page.locator('.theme-toggle')).toBeVisible();
  const brand = page.getByRole('link', { name: 'Devin Schulz, home' });
  for (let count = 1; count <= 2; count++) {
    if (isMobile) await brand.tap();
    else await brand.click();
    await expect(page.locator('[data-logo-count]')).toHaveText(`+${count}`);
    expect(
      await page
        .locator('[data-logo-count]')
        .evaluate((pop) => pop.getAnimations().length),
    ).toBe(0);
  }
  await page.evaluate(() => window.Turbo.visit('/blog/'));
  await page.waitForURL('**/blog/');
  await expect(page.locator('[data-logo-count]')).toHaveCount(0);
  await brand.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/');
  await expect(page.locator('[data-logo-count]')).toHaveCount(0);
  if (isMobile) await brand.tap();
  else await brand.click();
  await expect(page.locator('[data-logo-count]')).toHaveText('+3');
  await expect(page.locator('[data-logo-count]')).toHaveCount(0);
});

test('Inspect pauses logo feedback and exiting restarts the count at one', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  await expect(page.locator('.theme-toggle')).toBeVisible();
  const brand = page.getByRole('link', { name: 'Devin Schulz, home' });
  for (let count = 1; count <= 4; count++) {
    if (isMobile) await brand.tap();
    else await brand.click();
    await expect(page.locator(`[data-logo-count="${count}"]`)).toHaveText(
      `+${count}`,
    );
  }
  if (isMobile) await brand.tap();
  else await brand.click();
  const inspector = page.getByRole('region', {
    name: 'Inspect mode',
    exact: true,
  });
  await expect(inspector).toBeVisible();
  await expect(page.locator('[data-logo-count]')).toHaveCount(0);
  for (let click = 0; click < 3; click++) {
    if (isMobile) await brand.tap();
    else await brand.click();
    await expect(page.locator('[data-logo-count]')).toHaveCount(0);
  }
  await inspector.getByRole('button', { name: 'Close Inspect mode' }).click();
  if (isMobile) await brand.tap();
  else await brand.click();
  await expect(page.locator('[data-logo-count]')).toHaveText('+1');
  // The typing shortcut also clears any remaining feedback immediately.
  await page.keyboard.type('inspect');
  await expect(inspector).toBeVisible();
  await expect(page.locator('[data-logo-count]')).toHaveCount(0);
});
