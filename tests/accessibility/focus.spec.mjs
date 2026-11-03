import { test, expect } from '@playwright/test';

const blue = 'rgb(36, 73, 239)';
const paleBlue = 'rgb(162, 179, 255)';

async function expectBlueFocus(page, control, color) {
  await page.keyboard.press('Tab');
  await control.focus();
  await expect(control).toBeFocused();
  await expect(control).toHaveCSS('outline-style', 'solid');
  await expect(control).toHaveCSS('outline-color', color);
}

test('keyboard focus stays blue across navigation, search, artwork, and code', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.article-preview-title')).toHaveCount(8);
  await expect(page.locator('.article-preview a')).toHaveCount(8);
  const accent =
    (await page.locator('html').getAttribute('data-theme')) === 'dark'
      ? paleBlue
      : blue;
  await expectBlueFocus(page, page.locator('a[href="#content"]'), blue);
  await expectBlueFocus(page, page.locator('.brand'), accent);
  await expectBlueFocus(page, page.locator('.theme-toggle'), accent);
  await expectBlueFocus(
    page,
    page.locator('.article-preview-title').first(),
    accent,
  );
  if (!(await page.locator('.desktop-nav').isVisible())) {
    await page.locator('.mobile-menu summary').press('Enter');
    await expectBlueFocus(
      page,
      page.locator('.mobile-navigation a').first(),
      accent,
    );
  }
  const search = page.locator(
    '.desktop-nav button:visible, .mobile-navigation button:visible',
  );
  await search.press('Enter');
  await expect(page.locator('.search-input')).toBeFocused();
  await expect(page.locator('.search-input')).toHaveCSS(
    'outline-style',
    'none',
  );
  await expect(page.locator('.search-form')).toHaveCSS(
    'border-bottom-color',
    accent,
  );
  await expect(page.locator('.search-form')).toHaveCSS(
    'border-bottom-width',
    '2px',
  );
  await page.keyboard.press('Escape');

  await page.goto('/work/');
  await expectBlueFocus(
    page,
    page.locator('.project-0 [data-preview-toggle]'),
    blue,
  );
  await page.goto(
    '/blog/using-react-component-variants-to-compose-css-classes/',
  );
  const block = page.locator('.code-block').first();
  await expectBlueFocus(page, block.locator('button'), paleBlue);
  await expectBlueFocus(page, block.locator('pre'), paleBlue);
});

test('measurement and chat controls keep the same blue focus language', async ({
  page,
}) => {
  await page.goto('/work/invision/');
  const accent =
    (await page.locator('html').getAttribute('data-theme')) === 'dark'
      ? paleBlue
      : blue;
  await expectBlueFocus(page, page.locator('#measurement-scenario'), accent);
  const layer = page.locator('[data-measurement-target="mover"]');
  await page.keyboard.press('Tab');
  await layer.focus();
  const ring = page.locator('[data-measurement-target="focusRing"]');
  await expect(ring).toHaveCSS('opacity', '1');
  await expect(ring).toHaveCSS('stroke', accent);

  await page.goto(
    '/blog/building-a-chat-interface-that-doesnt-fight-your-scroll-position/',
  );
  await expectBlueFocus(
    page,
    page.locator('.chat-scroll-demo button').first(),
    accent,
  );
  await expectBlueFocus(page, page.locator('.chat-scroll-viewport'), accent);
});
