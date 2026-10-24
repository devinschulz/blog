import { test, expect } from '@playwright/test';

const article = '/blog/using-react-component-variants-to-compose-css-classes/';

async function expectLabelFits(copy) {
  const layout = await copy
    .locator('[data-code-target="label"]')
    .evaluate((label) => {
      const text = document.createRange();
      text.selectNodeContents(label);
      const bounds = text.getBoundingClientRect();
      const frame = label.parentElement.getBoundingClientRect();
      return {
        lines: text.getClientRects().length,
        contained:
          bounds.left >= frame.left &&
          bounds.right <= frame.right &&
          bounds.top >= frame.top &&
          bounds.bottom <= frame.bottom,
      };
    });
  expect(layout).toEqual({ lines: 1, contained: true });
}

test('copy preserves code whitespace, confirms success, and can be repeated', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text) => {
          window.copiedCode = text;
        },
      },
    });
  });
  await page.goto(article);
  const block = page.locator('.code-block').first();
  const code = await block.locator('pre code').textContent();
  const copy = block.getByRole('button', { name: 'Copy TypeScript code' });
  await page.evaluate(() => document.fonts.ready);
  await expectLabelFits(copy);
  await copy.focus();
  await page.keyboard.press('Enter');
  await expect(copy).toHaveText('Copied');
  await expectLabelFits(copy);
  await expect(block.getByRole('status')).toHaveText(
    'Code copied to clipboard.',
  );
  expect(await page.evaluate(() => window.copiedCode)).toBe(code);
  await copy.click();
  expect(await page.evaluate(() => window.copiedCode)).toBe(code);
  await expect(copy).toHaveText('Copy');
  await expectLabelFits(copy);
  const second = page.locator('.code-block').nth(1);
  await second.getByRole('button', { name: 'Copy TypeScript code' }).click();
  expect(await page.evaluate(() => window.copiedCode)).toBe(
    await second.locator('pre code').textContent(),
  );
});

test('clipboard denial gives a manual recovery path and allows retry', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text) => {
          if (!window.allowCopy)
            throw new DOMException('Denied', 'NotAllowedError');
          window.copiedCode = text;
        },
      },
    });
  });
  await page.goto(article);
  const block = page.locator('.code-block').first();
  const copy = block.getByRole('button', { name: 'Copy TypeScript code' });
  await copy.click();
  await expect(copy).toHaveText('Retry');
  await expectLabelFits(copy);
  await expect(block.getByRole('status')).toBeVisible();
  await expect(block.getByRole('status')).toContainText('Select the code');
  await expect(block.locator('pre')).toHaveAttribute('tabindex', '0');
  await page.evaluate(() => {
    window.allowCopy = true;
  });
  await copy.click();
  await expect(copy).toHaveText('Copied');
  await expectLabelFits(copy);
});

test('pending and success labels fit at normal and enlarged text sizes', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: () =>
          new Promise((resolve) => {
            window.finishCopy = resolve;
          }),
      },
    });
  });
  await page.goto(article);
  await page.evaluate(() => document.fonts.ready);
  const copy = page
    .locator('.code-block')
    .first()
    .getByRole('button', { name: 'Copy TypeScript code' });
  await copy.click();
  await expect(copy).toHaveText('Copy…');
  await expectLabelFits(copy);
  await page.evaluate(() => window.finishCopy());
  await expect(copy).toHaveText('Copied');
  await expectLabelFits(copy);
  await expect(copy).toHaveText('Copy');
  await copy.evaluate((button) => {
    button.style.fontSize = '24px';
  });
  await copy.click();
  await expect(copy).toHaveText('Copy…');
  await expectLabelFits(copy);
  await page.evaluate(() => window.finishCopy());
  await expect(copy).toHaveText('Copied');
  await expectLabelFits(copy);
});

test('unsupported clipboard leaves native reading and code scrolling available', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });
  });
  await page.goto(article);
  const block = page.locator('.code-block').first();
  await expect(block.locator('button')).toBeHidden();
  await expect(block.locator('pre')).toHaveAttribute('tabindex', '0');
  await expect(block.locator('pre')).toContainText('type ButtonSize');
});

test('keyboard users can move from copying to native code scrolling', async ({
  page,
}) => {
  await page.goto(article);
  const block = page.locator('.code-block').first();
  const copy = block.getByRole('button', { name: 'Copy TypeScript code' });
  await copy.focus();
  await page.keyboard.press('Tab');
  const pre = block.locator('pre');
  await expect(pre).toBeFocused();
  if (
    await pre.evaluate((element) => element.scrollWidth > element.clientWidth)
  ) {
    await page.keyboard.press('ArrowRight');
    await expect
      .poll(() => pre.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(0);
  }
});

test('history snapshots clear pending feedback and ignore late clipboard completion', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: () =>
          new Promise((resolve) => {
            window.finishCopy = resolve;
          }),
      },
    });
  });
  await page.goto(article);
  const block = page.locator('.code-block').first();
  const copy = block.getByRole('button', { name: 'Copy TypeScript code' });
  await copy.click();
  await expect(copy).toHaveText('Copy…');
  await page.evaluate(() =>
    document.dispatchEvent(new Event('turbo:before-cache')),
  );
  await expect(copy).toBeEnabled();
  await expect(copy).toHaveText('Copy');
  await page.evaluate(() => window.finishCopy());
  await expect(copy).toHaveText('Copy');
  await expect(block.getByRole('status')).toBeEmpty();
  await copy.click();
  await page.evaluate(() => window.finishCopy());
  await expect(copy).toHaveText('Copied');
});
