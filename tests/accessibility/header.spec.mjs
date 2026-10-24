import { test, expect } from '@playwright/test';

for (const path of ['/', '/blog/']) {
  test(`header links follow the keyboard tab order on ${path}`, async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === 'webkit',
      'WebKit Tab behavior depends on macOS keyboard preferences; links are covered separately with Option-Tab.',
    );
    await page.goto(path);
    await expect(page.locator('.theme-toggle')).toBeVisible();
    const desktop = await page.locator('.desktop-nav').isVisible();
    const order = [
      page.getByRole('link', { name: 'Skip to content', exact: true }),
      page.locator('.brand'),
    ];
    const waves = page.locator('[data-wave-trigger]');
    if (await waves.isVisible()) order.push(waves);
    if (desktop) {
      order.push(...(await page.locator('.desktop-nav a').all()));
    }
    order.push(page.locator('.theme-toggle'));
    order.push(
      page.locator(desktop ? '.contact-link' : '.mobile-menu summary'),
    );

    // Use actual sequential navigation; direct focus() masks skipped links.
    for (const target of order) {
      await page.keyboard.press('Tab');
      await expect(target).toBeFocused();
    }
    for (const target of order.slice(0, -1).reverse()) {
      await page.keyboard.press('Shift+Tab');
      await expect(target).toBeFocused();
    }
  });
}

for (const path of ['/', '/blog/']) {
  test(`desktop Safari can reach header links with Option-Tab on ${path}`, async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'webkit' || process.platform !== 'darwin');
    await page.goto(path);
    test.skip(!(await page.locator('.desktop-nav').isVisible()));
    await expect(page.locator('.theme-toggle')).toBeVisible();
    const targets = [
      page.getByRole('link', { name: 'Skip to content', exact: true }),
      page.locator('.brand'),
      ...(await page.locator('.desktop-nav a').all()),
      page.locator('.contact-link'),
    ];
    // Option-Tab includes links even with Safari's link-tabbing preference off.
    // Native buttons may also participate, depending on macOS Keyboard navigation.
    for (const target of targets) {
      for (let step = 0; step < 3; step++) {
        await page.keyboard.press('Alt+Tab');
        if (
          await target.evaluate((element) => element === document.activeElement)
        )
          break;
        await expect(page.locator('.site-header button:focus')).toHaveCount(1);
      }
      await expect(target).toBeFocused();
    }
  });
}

for (const [path, label, href] of [
  ['/work/cape/', 'Work', '/#work'],
  ['/blog/', 'Writing', '/blog/'],
]) {
  test(`navigation identifies the current section on ${path}`, async ({
    page,
  }) => {
    await page.goto(path);
    const links = page.locator(
      '.desktop-nav a[aria-current], .mobile-navigation a[aria-current]',
    );
    await expect(links).toHaveCount(2);
    for (const link of await links.all()) {
      await expect(link).toContainText(label);
      await expect(link).toHaveAttribute('href', href);
    }
  });
}

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
      const expectStable = async () => {
        const after = await bounds();
        for (let index = 0; index < before.length; index++) {
          for (const property of ['x', 'y', 'width', 'height']) {
            // WebKit can round fractional flex positions by one layout unit.
            expect(
              Math.abs(after[index][property] - before[index][property]),
            ).toBeLessThanOrEqual(1 / 64);
          }
        }
      };
      await expectStable();
      if (path === '/' && desktop) {
        // The optional graphics control must not move navigation when revealed.
        await page.locator('[data-wave-trigger]').evaluate((button) => {
          button.hidden = false;
        });
        await expectStable();
      }
    } finally {
      release();
    }
  });
}
