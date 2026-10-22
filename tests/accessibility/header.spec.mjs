import { test, expect } from '@playwright/test';

for (const path of ['/', '/blog/']) {
  test(`header stays in place while JavaScript loads on ${path}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    let release;
    const scripts = new Promise((resolve) => (release = resolve));
    await page.route('**/*.js', async (route) => {
      await scripts;
      await route.continue();
    });
    try {
      await page.goto(path, { waitUntil: 'commit' });
      await expect(page.locator('.brand')).toBeVisible();
      // WebKit's fonts.ready waits for document loading, including held scripts.
      await page.evaluate(() =>
        Promise.all([
          document.fonts.load('600 26px "DM Sans"'),
          document.fonts.load('400 13px "DM Sans"'),
          document.fonts.load('400 9px "JetBrains Mono"'),
        ]),
      );
      const desktop = await page.locator('.desktop-nav').isVisible();
      const targets = page.locator(
        desktop
          ? '.brand, .desktop-nav, .header-actions'
          : '.brand, .header-actions, .mobile-menu summary',
      );
      const bounds = () =>
        targets.evaluateAll((elements) =>
          elements.map((element) => {
            const { x, y, width, height } = element.getBoundingClientRect();
            return { x, y, width, height };
          }),
        );
      const before = await bounds();
      release();
      await page.waitForLoadState('load');
      await expect(page.locator('.theme-toggle')).toBeVisible();
      expect(await bounds()).toEqual(before);
      if (path === '/' && desktop) {
        // The optional graphics control must not move navigation when revealed.
        await page.locator('[data-wave-trigger]').evaluate((button) => {
          button.hidden = false;
        });
        expect(await bounds()).toEqual(before);
      }
    } finally {
      release();
    }
  });
}
