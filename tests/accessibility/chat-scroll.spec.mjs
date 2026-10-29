import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

const route =
  '/blog/building-a-chat-interface-that-doesnt-fight-your-scroll-position/';

async function openDemo(page) {
  await page.goto(route + '#chat-scroll-demo');
  const demo = page.locator('#chat-scroll-demo');
  await expect(
    demo.getByRole('button', { name: 'Stream a reply', exact: true }),
  ).toBeVisible();
  return {
    demo,
    viewport: demo.getByRole('region', { name: 'Demo conversation' }),
  };
}

async function gap(viewport) {
  return viewport.evaluate(
    (el) => el.scrollHeight - el.clientHeight - el.scrollTop,
  );
}

async function anchor(viewport) {
  return viewport.evaluate((el) => {
    const top = el.getBoundingClientRect().top + el.clientTop;
    const message = [...el.querySelectorAll('[data-message-id]')].find(
      (node) => node.getBoundingClientRect().bottom > top,
    );
    return {
      id: message.dataset.messageId,
      offset: message.getBoundingClientRect().top - top,
    };
  });
}

async function expectAnchor(viewport, expected) {
  await expect
    .poll(async () => {
      const current = await anchor(viewport);
      return (
        current.id === expected.id &&
        Math.abs(current.offset - expected.offset) < 2
      );
    })
    .toBe(true);
}

async function readEarlier(demo, viewport, top = 170) {
  await viewport.evaluate((el, value) => {
    el.scrollTop = value;
  }, top);
  await expect(
    demo.getByText('Reading earlier messages', { exact: true }),
  ).toBeVisible();
}

async function expectMoreText(demo) {
  const reply = demo
    .locator('[data-message-id^="stream-"]')
    .last()
    .locator('.chat-scroll-text');
  const before = await reply.textContent();
  await expect.poll(() => reply.textContent()).not.toBe(before);
}

test('streaming follows, upward input pauses, and Jump to latest resumes without losing focus', async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const { demo, viewport } = await openDemo(page);
  await demo
    .getByRole('button', { name: 'Stream a reply', exact: true })
    .click();
  await expectMoreText(demo);
  await expect.poll(() => gap(viewport)).toBeLessThanOrEqual(2);

  if (testInfo.project.name === 'mobile-safari') {
    await viewport.evaluate((el) => {
      for (const [type, y] of [
        ['touchstart', 100],
        ['touchmove', 160],
      ]) {
        const event = new Event(type, { bubbles: true });
        Object.defineProperty(event, 'touches', { value: [{ clientY: y }] });
        el.dispatchEvent(event);
      }
      el.scrollTop -= 160;
    });
  } else {
    await viewport.hover();
    await page.mouse.wheel(0, -180);
  }
  await expect(
    demo.getByText('Reading earlier messages', { exact: true }),
  ).toBeVisible();
  await expect.poll(() => gap(viewport)).toBeGreaterThan(100);
  const reading = await anchor(viewport);
  await expectMoreText(demo);
  await expectAnchor(viewport, reading);

  const jump = demo.getByRole('button', { name: 'Jump to latest' });
  await jump.focus();
  await jump.press('Enter');
  await expect(jump).toBeFocused();
  await expect(
    demo.getByText('Following latest', { exact: true }),
  ).toBeVisible();
  await expectMoreText(demo);
  await expect.poll(() => gap(viewport)).toBeLessThanOrEqual(2);

  await viewport.focus();
  await viewport.press('Home');
  await expect(
    demo.getByText('Reading earlier messages', { exact: true }),
  ).toBeVisible();
  await expect
    .poll(() => viewport.evaluate((el) => el.scrollTop))
    .toBeLessThan(2);
  await viewport.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await expect(
    demo.getByText('Following latest', { exact: true }),
  ).toBeVisible();
  await expectMoreText(demo);
  await expect.poll(() => gap(viewport)).toBeLessThanOrEqual(2);
  await demo.getByRole('button', { name: 'Stop streaming' }).click();
  expect(errors).toEqual([]);
});

test('loading history preserves the current message while streaming and while the reader moves', async ({
  page,
}) => {
  const { demo, viewport } = await openDemo(page);
  await demo
    .getByRole('button', { name: 'Stream a reply', exact: true })
    .click();
  await expectMoreText(demo);
  await readEarlier(demo, viewport);
  const original = await anchor(viewport);
  await demo.getByRole('button', { name: 'Load older messages' }).click();
  await expect(
    demo.getByRole('button', { name: 'Loading older messages…' }),
  ).toBeDisabled();
  await expect(demo.getByText(/Loaded earlier page 1/)).toBeVisible();
  await expectAnchor(viewport, original);
  await expectMoreText(demo);
  await expectAnchor(viewport, original);

  await demo.getByRole('button', { name: 'Load older messages' }).click();
  await readEarlier(demo, viewport, 80);
  const newerPosition = await anchor(viewport);
  await expect(demo.getByText(/Loaded earlier page 2/)).toBeVisible();
  await expectAnchor(viewport, newerPosition);
  await expect(
    demo.getByText('Reading earlier messages', { exact: true }),
  ).toBeVisible();
  await demo.getByRole('button', { name: 'Stop streaming' }).click();
});

test('late layout changes preserve the anchor or follow the bottom according to the current mode', async ({
  page,
}) => {
  const { demo, viewport } = await openDemo(page);
  await readEarlier(demo, viewport);
  const before = await anchor(viewport);
  await demo
    .locator('[data-message-id="question-1"] .chat-scroll-text')
    .evaluate((el) => {
      el.style.paddingBottom = '160px';
    });
  await expectAnchor(viewport, before);
  await viewport.evaluate((el) => {
    el.style.height = '280px';
  });
  await expectAnchor(viewport, before);

  await demo.getByRole('button', { name: 'Jump to latest' }).click();
  await demo
    .locator('[data-message-id="answer-3"] .chat-scroll-text')
    .evaluate((el) => {
      el.style.paddingBottom = '200px';
    });
  await expect.poll(() => gap(viewport)).toBeLessThanOrEqual(2);
  await viewport.evaluate((el) => {
    el.style.height = '220px';
  });
  await expect.poll(() => gap(viewport)).toBeLessThanOrEqual(2);
});

test('reset cancels pending history and streaming; all history has an end', async ({
  page,
}) => {
  const { demo } = await openDemo(page);
  await demo
    .getByRole('button', { name: 'Stream a reply', exact: true })
    .click();
  await demo.getByRole('button', { name: 'Load older messages' }).click();
  await demo.getByRole('button', { name: 'Reset demo' }).click();
  await expect(demo.locator('[data-message-id]')).toHaveCount(6);
  await expect(
    demo.getByText('Ready. All messages in this demo are simulated.'),
  ).toBeVisible();

  // Waiting through a fresh request also lets any uncancelled old timer fire.
  for (let pageNumber = 1; pageNumber <= 3; pageNumber++) {
    await demo.getByRole('button', { name: 'Load older messages' }).click();
    await expect(
      demo.getByText(new RegExp(`Loaded earlier page ${pageNumber}`)),
    ).toBeVisible();
  }
  await expect(demo.locator('[data-message-id]')).toHaveCount(15);
  await expect(
    demo.getByRole('button', { name: 'All history loaded' }),
  ).toBeDisabled();
});

test('demo supports both themes, narrow layouts, and a quiet accessible transcript', async ({
  page,
}) => {
  const { demo } = await openDemo(page);
  const result = await new AxeBuilder({ page })
    .include('#chat-scroll-demo')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(result.violations).toEqual([]);
  expect(
    await demo.locator('[role="log"], [aria-live="assertive"]').count(),
  ).toBe(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  const smallTargets = await demo
    .getByRole('button')
    .evaluateAll((buttons) =>
      buttons
        .filter((button) => button.getBoundingClientRect().height < 44)
        .map((button) => button.textContent),
    );
  expect(smallTargets).toEqual([]);

  const primary = demo.getByRole('button', {
    name: 'Stream a reply',
    exact: true,
  });
  await primary.hover();
  const hoverResult = await new AxeBuilder({ page })
    .include('#chat-scroll-demo')
    .withRules(['color-contrast'])
    .analyze();
  expect(hoverResult.violations).toEqual([]);
});

test('Turbo navigation mounts the React example and disposes the previous instance', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/blog/');
  await page.locator(`a[href="${route}"]`).first().click();
  const demo = page.locator('#chat-scroll-demo');
  await demo
    .getByRole('button', { name: 'Stream a reply', exact: true })
    .click();
  await expectMoreText(demo);
  await page
    .getByRole('link', { name: 'All writing', exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/blog\/$/);
  await page.goBack();
  await expect(
    demo.getByRole('button', { name: 'Stream a reply', exact: true }),
  ).toBeVisible();
  await expect(demo.locator('[data-message-id]')).toHaveCount(6);
  await expect(demo.locator('[data-chat-scroll-root]')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('article exports the exact running hook, source files, and a useful fallback without JavaScript', async ({
  browser,
  request,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  await page.goto(route);
  await expect(page.locator('#chat-scroll-demo')).toContainText(
    'The interactive example needs JavaScript',
  );
  await expect(
    page.getByRole('heading', {
      name: 'A React hook for following and preserving position',
    }),
  ).toBeVisible();
  await expect(page.locator('#chat-scroll-demo button')).toHaveCount(0);
  const markdown = await (await request.get(route + 'index.md')).text();
  expect(markdown).not.toContain('{{<');
  const hook = fs
    .readFileSync('assets/examples/chat-scroll/useChatScroll.ts', 'utf8')
    .trim();
  expect(markdown).toContain(hook);
  for (const file of [
    'useChatScroll.ts',
    'ChatScrollDemo.tsx',
    'chat-scroll.css',
  ]) {
    const download = await request.get('/examples/chat-scroll/' + file);
    expect(download.ok()).toBe(true);
    expect(await download.text()).toBe(
      fs.readFileSync('assets/examples/chat-scroll/' + file, 'utf8'),
    );
  }
  await context.close();
});
