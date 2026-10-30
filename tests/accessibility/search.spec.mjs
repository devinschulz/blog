import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  searchPages,
  searchTerms,
  matchPattern,
} from '../../assets/js/search.ts';

async function openSearch(page, path) {
  if (path) await page.goto(path);
  await expect(page.locator('.theme-toggle')).toBeVisible();
  let opener = page
    .locator('.desktop-nav')
    .getByRole('button', { name: 'Search', exact: true });
  if (!(await opener.isVisible())) {
    const menu = page.locator('.mobile-menu summary');
    await menu.click();
    await page
      .getByRole('navigation', { name: 'Mobile navigation' })
      .getByRole('button', { name: 'Search', exact: true })
      .click();
    opener = menu;
  } else {
    await opener.click();
  }
  const panel = page.getByRole('dialog', { name: 'Search the site' });
  const input = panel.getByRole('searchbox', { name: 'Search terms' });
  await expect(panel).toBeVisible();
  await expect(input).toBeFocused();
  return { panel, input, opener };
}

async function query(input, value) {
  await input.fill(value);
}

test('search treats punctuation literally and requires every query word', () => {
  const makePage = (title, body = '') => ({
    title,
    body,
    url: '/',
    kind: 'Article',
    date: '',
    description: '',
    tags: [],
  });
  expect(
    searchPages(
      [makePage('Next.js'), makePage('NextXjs')],
      searchTerms('Next.js'),
    ).map((page) => page.title),
  ).toEqual(['Next.js']);
  expect(
    searchPages([makePage('C++'), makePage('C--')], searchTerms('C++')).map(
      (page) => page.title,
    ),
  ).toEqual(['C++']);
  expect(
    searchPages(
      [makePage('Scroll position'), makePage('Scroll'), makePage('Position')],
      searchTerms('scroll POSITION'),
    ).map((page) => page.title),
  ).toEqual(['Scroll position']);
  expect(searchPages([makePage('A')], searchTerms('   '))).toEqual([]);
  expect('aXb a.b'.match(matchPattern(['a.b']))).toEqual(['a.b']);
});

test('search opens horizontally centered near the top and restores focus on Escape', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const path of ['/', '/blog/', '/work/cape/', '/tags/react/']) {
    const { panel, input, opener } = await openSearch(page, path);
    const rect = await panel.boundingBox();
    expect(rect.x).toBeGreaterThanOrEqual(12);
    expect(rect.y).toBeGreaterThanOrEqual(12);
    expect(rect.x + rect.width).toBeLessThanOrEqual(
      page.viewportSize().width - 11,
    );
    expect(
      Math.abs(rect.x + rect.width / 2 - page.viewportSize().width / 2),
    ).toBeLessThan(2);
    expect(rect.y).toBeLessThanOrEqual(100);
    const originalURL = page.url();
    await input.press('Escape');
    await expect(panel).toBeHidden();
    await expect(opener).toBeFocused();
    expect(page.url()).toBe(originalURL);
  }
  expect(errors).toEqual([]);
});

test('results search articles, structured case-study content, and the homepage with highlighted words', async ({
  page,
}) => {
  let requests = 0;
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/search.json') requests++;
  });
  const { panel, input } = await openSearch(page, '/blog/');
  expect(requests).toBe(0);
  await query(input, 'scroll POSITION');
  const first = panel.locator('.search-result').first();
  await expect(first.locator('.search-result-link')).toContainText(
    "Building a Chat Interface That Doesn't Fight Your Scroll Position",
  );
  const words = await first
    .locator('.search-result-link mark')
    .allTextContents();
  expect(words.map((word) => word.toLowerCase())).toEqual(
    expect.arrayContaining(['scroll', 'position']),
  );
  await expect(first.locator('.search-excerpt mark').first()).toBeVisible();
  const palette = await panel.boundingBox();
  expect(palette.y).toBeLessThanOrEqual(100);
  expect(palette.height).toBeLessThanOrEqual(640);
  const inputTop = (await input.boundingBox()).y;
  await panel.locator('.search-scroll').evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  expect((await input.boundingBox()).y).toBe(inputTop);
  await expect(input).toBeFocused();

  await query(input, 'serial number');
  await expect(panel.locator('.search-result-link').first()).toHaveText(
    'Warranties',
  );
  await expect(panel.locator('.search-result').first()).toContainText(
    'Case study',
  );
  await expect(panel.locator('.search-excerpt mark').first()).toBeVisible();
  await query(input, 'Devin Schulz');
  await expect(panel.locator('.search-result-link').first()).toHaveAttribute(
    'href',
    '/',
  );
  await expect(panel.locator('.search-result').first()).toContainText('Home');
  expect(requests).toBe(1);
  expect(new URL(page.url()).pathname).toBe('/blog/');
});

test('Tab stays inside search as browse links and live results change', async ({
  page,
}) => {
  const { panel, input, opener } = await openSearch(page, '/blog/');
  const close = panel.getByRole('button', { name: 'Close search' });
  const lastBrowse = panel.getByRole('link', { name: 'Explore selected work' });
  await expect(panel).toHaveAttribute('aria-modal', 'true');
  const mainIsInert = () =>
    page
      .locator('main')
      .evaluate((element) => Boolean(element.closest('[inert]')));
  expect(await mainIsInert()).toBe(true);
  await input.press('Shift+Tab');
  await expect(close).toBeFocused();
  await close.press('Shift+Tab');
  await expect(lastBrowse).toBeFocused();
  await lastBrowse.press('Tab');
  await expect(close).toBeFocused();
  await close.press('Tab');
  await expect(input).toBeFocused();

  await input.fill('serial number');
  const result = panel.locator('.search-result-link').last();
  await expect(result).toHaveText('Warranties');
  await result.focus();
  await result.press('Tab');
  await expect(close).toBeFocused();
  await close.press('Shift+Tab');
  await expect(result).toBeFocused();

  await input.focus();
  await input.fill('no-matching-page-9328');
  await expect(panel.getByRole('status')).toContainText('No results');
  await input.press('Tab');
  await expect(close).toBeFocused();
  await close.press('Shift+Tab');
  await expect(input).toBeFocused();
  await page.locator('.brand').evaluate((element) => element.focus());
  await expect(input).toBeFocused();
  await input.press('Escape');
  await expect(panel).toBeHidden();
  await expect(opener).toBeFocused();
  expect(await mainIsInert()).toBe(false);
});

test('queries stay literal and safe; clearing removes marks and keeps input focus', async ({
  page,
}) => {
  const { panel, input } = await openSearch(page, '/');
  await query(input, 'Next.js');
  await expect(panel.locator('.search-result-link').first()).toContainText(
    'From Hugo to Next.js and Back Again',
  );
  await expect(panel.locator('mark').first()).toHaveText('Next.js');
  await query(input, '<img src=x onerror=window.__searchInjected=true>');
  await expect(panel.getByRole('status')).toContainText('No results');
  await expect(panel.locator('img, script')).toHaveCount(0);
  expect(await page.evaluate(() => window.__searchInjected)).toBeUndefined();
  await input.fill('');
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  await expect(panel.locator('mark, .search-result')).toHaveCount(0);
  await expect(panel.getByRole('button', { name: 'Clear search' })).toHaveCount(
    0,
  );
});

test('pointer entry and exit animate; reduced motion and keyboard remain immediate', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const { panel } = await openSearch(page, '/blog/');
  const popup = page.locator('#site-search-popover');
  const opening = await popup.evaluate((element) => {
    const animations = element.getAnimations();
    const properties = animations.map(
      (animation) => animation.transitionProperty,
    );
    animations.forEach((animation) => animation.finish());
    return properties;
  });
  expect(opening).toEqual(expect.arrayContaining(['opacity', 'transform']));
  const closing = await popup.evaluate((element) => {
    element
      .querySelector('button')
      .dispatchEvent(
        new MouseEvent('click', { bubbles: true, detail: 1, cancelable: true }),
      );
    const animations = element.getAnimations();
    const properties = animations.map(
      (animation) => animation.transitionProperty,
    );
    animations.forEach((animation) => {
      animation.pause();
      animation.currentTime = 60;
    });
    return {
      properties,
      display: getComputedStyle(element).display,
      open: element.matches(':popover-open'),
    };
  });
  expect(closing.open).toBe(true);
  expect(closing.display).not.toBe('none');
  expect(closing.properties).toEqual(
    expect.arrayContaining(['opacity', 'transform']),
  );
  await popup.evaluate((element) =>
    element.getAnimations().forEach((animation) => animation.finish()),
  );
  await expect(panel).toBeHidden();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reduced = await openSearch(page);
  expect(
    await popup.evaluate((element) => getComputedStyle(element).transform),
  ).toBe('none');
  await reduced.input.press('Escape');
  let trigger = page
    .locator('.desktop-nav')
    .getByRole('button', { name: 'Search', exact: true });
  if (!(await trigger.isVisible())) {
    await page.locator('.mobile-menu summary').click();
    trigger = page
      .getByRole('navigation', { name: 'Mobile navigation' })
      .getByRole('button', { name: 'Search', exact: true });
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await trigger.focus();
  await trigger.press('Enter');
  await expect(panel).toBeVisible();
  expect(
    await popup.evaluate(
      (element) => getComputedStyle(element).transitionDuration,
    ),
  ).toBe('0s');
});

test('failed index loading can be retried without losing the query', async ({
  page,
}) => {
  let attempts = 0;
  await page.route('**/search.json', (route) =>
    ++attempts === 1
      ? route.fulfill({ status: 503, body: 'Unavailable' })
      : route.continue(),
  );
  const { panel, input } = await openSearch(page, '/blog/');
  await query(input, 'React');
  await expect(panel.getByRole('status')).toContainText('Couldn’t load search');
  const retry = panel.getByRole('button', { name: 'Retry search' });
  const browse = panel.getByRole('link', { name: 'Browse all writing' });
  await expect(browse).toHaveAttribute('href', '/blog/');
  const close = panel.getByRole('button', { name: 'Close search' });
  await input.press('Tab');
  await expect(retry).toBeFocused();
  await retry.press('Tab');
  await expect(browse).toBeFocused();
  await browse.press('Tab');
  await expect(close).toBeFocused();
  await close.press('Shift+Tab');
  await expect(browse).toBeFocused();
  await browse.press('Shift+Tab');
  await expect(retry).toBeFocused();
  await retry.click();
  await expect(panel.locator('.search-result-link').first()).toBeVisible();
  await expect(input).toHaveValue('React');
  expect(attempts).toBe(2);
});

test('an index arriving late only renders the latest query', async ({
  page,
}) => {
  let release;
  await page.route('**/search.json', async (route) => {
    await new Promise((resolve) => {
      release = resolve;
    });
    await route.continue();
  });
  const { panel, input } = await openSearch(page, '/');
  await query(input, 'React');
  await expect.poll(() => typeof release).toBe('function');
  await query(input, 'warranties');
  release();
  await expect(panel.getByRole('status')).toContainText('“warranties”');
  await expect(panel.locator('.search-result-link').first()).toHaveText(
    'Warranties',
  );
});

test('opening a result closes search; Back and reopening retain one set of results', async ({
  page,
}) => {
  const { panel, input } = await openSearch(page, '/blog/');
  await query(input, 'scroll');
  const links = panel.locator('.search-result-link');
  await expect(links.first()).toBeVisible();
  const count = await links.count();
  const destination = await links.first().getAttribute('href');
  await links.first().click();
  await expect(page).toHaveURL(new RegExp(destination + '$'));
  await expect(
    page.getByRole('dialog', { name: 'Search the site' }),
  ).toBeHidden();
  await page.goBack();
  const reopened = await openSearch(page);
  await expect(reopened.input).toHaveValue('scroll');
  await expect(reopened.panel.locator('.search-result-link')).toHaveCount(
    count,
  );
  await expect(reopened.panel.locator('mark').first()).toBeVisible();
});

test('the popover dismisses on outside click and highlights remain accessible in both themes', async ({
  page,
}) => {
  const { panel, input } = await openSearch(page, '/blog/');
  await input.fill('scroll');
  await expect(panel.locator('.search-result-link').first()).toBeVisible();
  await panel.getByRole('button', { name: 'Close search' }).hover();
  const audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(audit.violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  const rect = await panel.boundingBox();
  expect(rect.y + rect.height).toBeLessThanOrEqual(
    page.viewportSize().height - 10,
  );
  await page.mouse.click(2, page.viewportSize().height - 2);
  await expect(panel).toBeHidden();
});

test('native popover offers useful browse links without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  await page.goto('/blog/');
  const desktop = page
    .locator('.desktop-nav')
    .getByRole('button', { name: 'Search', exact: true });
  if (await desktop.isVisible()) await desktop.click();
  else {
    await page.locator('.mobile-menu summary').click();
    await page
      .getByRole('navigation', { name: 'Mobile navigation' })
      .getByRole('button', { name: 'Search', exact: true })
      .click();
  }
  const panel = page.getByRole('dialog', { name: 'Search the site' });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('searchbox')).toHaveCount(0);
  await expect(panel).toContainText('Interactive search needs JavaScript');
  await panel.getByRole('link', { name: 'Browse all writing' }).click();
  await expect(page.locator('h1')).toHaveText('Writing');
  await context.close();
});
