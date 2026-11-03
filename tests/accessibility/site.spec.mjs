import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

const pages = fs
  .readdirSync('dist', { recursive: true })
  .filter((file) => file.endsWith('.html'));
const articleCount = pages.filter(
  (file) => file.startsWith('blog/') && file !== 'blog/index.html',
).length;
const gifPage = '/blog/my-definition-of-a-first-class-pull-request/';

async function audit(page) {
  await page.evaluate(() => document.fonts.ready);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    results.violations.map(({ id, nodes }) => ({
      id,
      nodes: nodes.map(({ target, failureSummary }) => ({
        target,
        failureSummary,
      })),
    })),
  ).toEqual([]);
}

// Layout is measured with polling assertions rather than a single sample. The
// A page can be caught during font loading; polling absorbs transient layout
// without hiding a genuine overflow.
async function expectReflow(page) {
  await expect
    .poll(
      () =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      { message: 'Page must not scroll horizontally' },
    )
    .toBe(true);
  // Hero overflow is intentionally clipped for artwork, but never for its text.
  await expect
    .poll(
      () =>
        page
          .locator('h1, h2, h3, .footer-top > a, .hero-topline')
          .evaluateAll((headings) =>
            headings.flatMap((heading) => {
              const walker = document.createTreeWalker(
                heading,
                NodeFilter.SHOW_TEXT,
              );
              let node;
              const clipped = [];
              while ((node = walker.nextNode())) {
                if (!node.textContent.trim()) continue;
                const range = document.createRange();
                range.selectNodeContents(node);
                const panel = heading.closest(
                  '.hero, .archive-hero, .case-hero, .article-hero, .site-footer',
                );
                const bounds = panel?.getBoundingClientRect();
                for (const rect of range.getClientRects()) {
                  if (
                    rect.left < (bounds?.left ?? 0) - 1 ||
                    rect.right > (bounds?.right ?? innerWidth) + 1
                  )
                    clipped.push(node.textContent.trim());
                }
              }
              return clipped;
            }),
          ),
      { message: 'Headings must not be clipped horizontally' },
    )
    .toEqual([]);
  if (await page.locator('[data-demo-form]').count()) {
    await expect
      .poll(
        () =>
          page
            .locator('[data-demo-form]')
            .evaluate(
              (form) =>
                form.getBoundingClientRect().bottom >
                document
                  .querySelector('[data-demo-steps]')
                  .getBoundingClientRect().top,
            ),
        { message: 'Demo form must not overlap the progress row' },
      )
      .toBe(false);
  }
}

test('display lettering reflows at 200 percent zoom and text size', async ({
  page,
}, testInfo) => {
  test.skip(
    !testInfo.project.name.startsWith('desktop'),
    'Desktop zoom uses a 720px CSS viewport.',
  );
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  // A 1440px desktop at 200% page zoom has a 720px CSS viewport. Also check
  // doubled text separately, since Safari can zoom text without the page.
  for (const textOnly of [false, true]) {
    await page.setViewportSize({ width: textOnly ? 1440 : 720, height: 900 });
    for (const path of [
      '/',
      '/blog/',
      '/work/cape/',
      '/work/warranties/',
      '/work/invision/',
      '/blog/using-react-component-variants-to-compose-css-classes/',
    ]) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      if (textOnly) {
        await page.evaluate(() => {
          const sizes = [...document.querySelectorAll('body, body *')]
            .filter((el) => !(el instanceof SVGElement))
            .map((el) => [el, parseFloat(getComputedStyle(el).fontSize) * 2]);
          for (const [el, size] of sizes) el.style.fontSize = `${size}px`;
        });
      }
      await expectReflow(page);
      await page.locator('.site-footer').scrollIntoViewIfNeeded();
      await expect(page.locator('.site-footer canvas')).toHaveCount(0);
      await expect(
        page.getByRole('navigation', { name: 'Footer navigation' }),
      ).toBeVisible();
      if (await page.locator('.hero').count()) {
        const [topline, title] = await page
          .locator('.hero-topline, .hero-title')
          .evaluateAll((nodes) =>
            nodes.map((node) => {
              const { top, bottom } = node.getBoundingClientRect();
              return { top, bottom };
            }),
          );
        expect(topline.bottom).toBeLessThanOrEqual(title.top);
      }
    }
  }
});

for (const file of pages) {
  test(`page audit and text-spacing reflow: ${file}`, async ({ page }) => {
    await page.goto('/' + file.replace(/index\.html$/, ''));
    await audit(page);
    await expectReflow(page);
    await page.addStyleTag({
      content:
        '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }',
    });
    await expectReflow(page);
  });
}

test('keyboard skip link and mobile navigation', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  if (testInfo.project.name.startsWith('narrow')) {
    const menu = page.locator('summary');
    await menu.focus();
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('navigation', { name: 'Mobile navigation' }),
    ).toBeVisible();
    await audit(page);
    await page.keyboard.press('Escape');
    await expect(menu).toBeFocused();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.locator('#work')).toBeFocused();
    await expect(page.locator('[data-mobile-menu]')).not.toHaveAttribute(
      'open',
      '',
    );
  }
});

test('every project remains visible and opens its case study', async ({
  page,
}) => {
  await page.goto('/');
  const projects = page.locator('.project-link');
  await expect(projects).toHaveCount(3);
  for (const title of ['Cape', 'Warranties', 'InVision']) {
    const link = projects.filter({
      has: page.getByRole('heading', { name: title, exact: true }),
    });
    await expect(link).toBeVisible();
    await expect(link.locator('img').first()).toHaveAttribute('alt', /.+/);
  }
  await projects.last().focus();
  await page.keyboard.press('Enter');
  await page.waitForURL('**/work/invision/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.goBack();
  await expect(projects).toHaveCount(3);
});

test('theme choice persists through navigation and reload', async ({
  page,
}) => {
  await page.goto('/');
  const before = await page.locator('html').getAttribute('data-theme');
  await page.getByRole('button', { name: /Switch to .* theme/ }).click();
  const after = before === 'dark' ? 'light' : 'dark';
  await expect(page.locator('html')).toHaveAttribute('data-theme', after);
  await page.locator('.project-link').first().click();
  await page.waitForURL('**/work/cape/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', after);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', after);
});

test('page transitions keep the previous page opaque and preserve history', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const start = document.startViewTransition.bind(document);
    window.__pageTransitions = [];
    document.startViewTransition = (...args) => {
      const transition = start(...args);
      transition.ready
        .then(() => {
          const root = document.documentElement;
          const old = getComputedStyle(root, '::view-transition-old(root)');
          const incoming = getComputedStyle(
            root,
            '::view-transition-new(root)',
          );
          window.__pageTransitions.push({
            oldOpacity: old.opacity,
            oldAnimation: old.animationName,
            oldBlend: old.mixBlendMode,
            incomingAnimation: incoming.animationName,
            duration: incoming.animationDuration,
            incomingBlend: incoming.mixBlendMode,
          });
        })
        .catch(() => {});
      return transition;
    };
  });
  await page.goto('/');
  await page.locator('.project-link').first().click();
  await page.waitForURL('**/work/cape/');
  await expect
    .poll(() => page.evaluate(() => window.__pageTransitions.length))
    .toBe(1);
  expect(await page.evaluate(() => window.__pageTransitions[0])).toEqual({
    oldOpacity: '1',
    oldAnimation: 'none',
    oldBlend: 'normal',
    incomingAnimation: 'page-enter',
    duration: '0.16s',
    incomingBlend: 'normal',
  });
  await page.goBack();
  await expect(page.locator('.hero-title')).toBeVisible();
  await page.goForward();
  await expect(page.locator('.case-hero h1')).toHaveText('CAPE');
  await expectReflow(page);
});

test('navigation stays immediate with reduced motion or no view transition API', async ({
  page,
}) => {
  await page.addInitScript(() => {
    document.startViewTransition = () => {
      throw new Error('Reduced motion must not start a view transition');
    };
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.locator('.project-link').first().click();
  await page.waitForURL('**/work/cape/');
  await expect(page.locator('.case-hero h1')).toHaveText('CAPE');
  expect(errors).toEqual([]);

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => {
    document.startViewTransition = undefined;
  });
  await page.getByRole('link', { name: 'Devin Schulz, home' }).click();
  await page.waitForURL('http://127.0.0.1:4177/');
  await expect(page.locator('.hero-title')).toBeVisible();
  expect(errors).toEqual([]);
});

test('the themed page background is painted before the stylesheet loads', async ({
  page,
}) => {
  // An unavailable stylesheet makes this assertion independent of the main CSS.
  await page.route('**/*.css', (route) => route.abort());
  await page.addInitScript(() =>
    localStorage.setItem('portfolio-theme', 'dark'),
  );
  await page.goto('/blog/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveCSS(
    'background-color',
    'rgb(26, 27, 25)',
  );
  await page.evaluate(() => {
    localStorage.setItem('portfolio-theme', 'light');
  });
  await page.locator('html').evaluate((html) => {
    html.dataset.theme = 'light';
  });
  await expect(page.locator('html')).toHaveCSS(
    'background-color',
    'rgb(245, 245, 243)',
  );
});

test('writing highlights lead to the complete archive', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.note-entry')).toHaveCount(4);
  await page
    .getByRole('link', { name: `All ${articleCount} articles` })
    .click();
  await page.waitForURL('**/blog/');
  await expect(page.locator('[data-post-list] .post-link')).toHaveCount(
    articleCount,
  );
});

test('Writing opens the full archive and its year shortcuts reach older posts', async ({
  page,
}, testInfo) => {
  await page.goto('/blog/reflecting-on-twelve-years-of-remote-work/');
  const mobile = testInfo.project.name.startsWith('narrow');
  if (mobile) await page.locator('.mobile-menu summary').click();
  const navigation = page.getByRole('navigation', {
    name: mobile ? 'Mobile navigation' : 'Main navigation',
    exact: true,
  });
  await expect(
    navigation.getByRole('link', { name: 'Writing', exact: true }),
  ).toHaveAttribute('aria-current', 'true');
  await navigation.getByRole('link', { name: 'Writing', exact: true }).click();
  await page.waitForURL('**/blog/');
  await expect(page.locator('.desktop-nav a[aria-current="page"]')).toHaveText(
    'Writing',
  );
  const years = page.getByRole('navigation', {
    name: 'Browse writing by year',
  });
  await years.getByRole('link', { name: '2018', exact: true }).click();
  await expect(page.locator('#year-2018')).toBeInViewport();
  await expect(
    page.getByRole('region', { name: '2018 4 articles' }).locator('.post-link'),
  ).toHaveCount(4);
  await expect(page.locator('[data-post-list] .post-link')).toHaveCount(
    articleCount,
  );
});

test('reduced motion retains native typography and project images', async ({
  page,
}) => {
  await page.goto('/work/');
  await expect(page.locator('.hero-title')).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('.project-art').first()).toHaveCSS(
    'animation-name',
    'none',
  );
  await expect(page.locator('.project-main img').first()).toBeVisible();
  await audit(page);
});

test('GIF remains opt-in and stops for reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(gifPage);
  const container = page.locator('[data-animated-image]');
  const image = container.locator('img');
  const poster = await image.getAttribute('data-static-src');
  const animation = await image.getAttribute('data-animated-src');
  expect(poster).toMatch(/\.webp$/);
  expect(animation).toMatch(/\.webp$/);
  expect(poster).not.toBe(animation);
  await expect(image).toHaveAttribute('src', poster);
  await container.getByRole('button', { name: 'Play animation' }).click();
  await expect(image).toHaveAttribute('src', animation);
  await container.getByRole('button', { name: 'Stop animation' }).click();
  await expect(image).toHaveAttribute('src', poster);
  await container.getByRole('button', { name: 'Play animation' }).click();
  await expect(image).toHaveAttribute('src', animation);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(image).toHaveAttribute('src', poster);
  await expect(container.getByRole('button')).toBeDisabled();
});

test('all project and writing destinations work without JavaScript', async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: testInfo.project.use.viewport,
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4177/');
  await expect(page.locator('.hero canvas')).toHaveCount(0);
  for (const title of ['Cape', 'Warranties', 'InVision']) {
    await expect(
      page
        .locator('.project-gallery')
        .getByRole('link', { name: new RegExp(title) }),
    ).toBeVisible();
  }
  await expect(
    page.getByRole('link', { name: `All ${articleCount} articles` }),
  ).toBeVisible();
  if (testInfo.project.name.startsWith('narrow')) {
    await page.locator('summary').click();
    await expect(
      page.getByRole('navigation', { name: 'Mobile navigation' }),
    ).toBeVisible();
  }
  await context.close();
});

test('forced colors retain a visible keyboard outline', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  const outline = await page.locator(':focus').evaluate((el) => ({
    width: getComputedStyle(el).outlineWidth,
    style: getComputedStyle(el).outlineStyle,
  }));
  expect(outline).toEqual({ width: '3px', style: 'solid' });
});

test('project previews work with keyboard and reduced motion', async ({
  page,
}) => {
  await page.goto('/work/');
  for (const name of ['Cape', 'Warranties', 'InVision']) {
    const project = page
      .locator('[data-project-preview]')
      .filter({ has: page.getByRole('heading', { name, exact: true }) });
    const toggle = project.locator('[data-preview-toggle]');
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(project.locator('[data-project-detail]')).toBeVisible();
    await expect(project.getByRole('status')).toContainText(
      `${name}: view 2 of 2`,
    );
    await expect(toggle).toBeFocused();
    await expect(project.locator('canvas')).toHaveCount(0);
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(project.locator('[data-project-detail]')).toBeHidden();
    await expect(project.locator('.project-main img').first()).toBeVisible();
  }
  await audit(page);
  await page.getByRole('button', { name: /Show other view.*Cape/ }).click();
  await page.locator('.project-0 .project-link').click();
  await page.waitForURL('**/work/cape/');
  await page.goBack();
  await expect(
    page.locator('.project-0 [data-preview-toggle]'),
  ).toHaveAttribute('aria-pressed', 'false');
});

test('article sections, code blocks, and archive navigation remain usable', async ({
  page,
}, testInfo) => {
  await page.goto(
    '/blog/using-react-component-variants-to-compose-css-classes/',
  );
  await expect(page.locator('.article-hero h1')).toHaveText(
    'Using React Component Variants to Compose CSS Classes',
  );
  const mobile = testInfo.project.name.startsWith('narrow');
  if (mobile) await page.locator('.article-layout summary').click();
  const contents = page.getByRole('navigation', {
    name: mobile ? 'Article sections on mobile' : 'Article sections',
    exact: true,
  });
  await expect(contents).toBeVisible();
  await contents
    .getByRole('link', { name: 'Define the union types', exact: true })
    .click();
  await page.waitForURL('**/#define-the-union-types');
  await expect(page.locator('#define-the-union-types')).toBeInViewport();
  await expect(
    contents.getByRole('link', { name: 'Define the union types', exact: true }),
  ).toHaveAttribute('aria-current', 'location');
  await expect(page.locator('.article-body pre').first()).toHaveAttribute(
    'tabindex',
    '0',
  );
  await expect(page.locator('.article-body pre').first()).toContainText(
    'type ButtonSize = "small" | "medium";',
  );
  const more = page.getByRole('region', { name: 'More writing' });
  await expect(more).toContainText(
    "Building a Chat Interface That Doesn't Fight Your Scroll Position",
  );
  const firstCode = page.locator('.code-block').first();
  if (mobile) {
    await expect(firstCode.locator('[data-code-scroll-hint]')).toBeVisible();
  } else {
    await expect(firstCode.locator('[data-code-scroll-hint]')).toBeHidden();
  }
  const nextArticle = more.locator('.related-post-link').first();
  const nextHref = await nextArticle.getAttribute('href');
  const nextTitle = await nextArticle.locator('p span').first().innerText();
  await nextArticle.click();
  await page.waitForURL(`**${nextHref}`);
  await expect(page.locator('.article-hero h1')).toHaveText(nextTitle);
  await page
    .locator('.article-hero')
    .getByRole('link', { name: 'All writing', exact: true })
    .click();
  await page.waitForURL('**/blog/');
  await expect(page.locator('[data-post-list] .post-link')).toHaveCount(
    articleCount,
  );
});
