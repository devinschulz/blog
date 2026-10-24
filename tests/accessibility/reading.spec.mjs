import { test, expect } from '@playwright/test';

const article = '/blog/reflecting-on-twelve-years-of-remote-work/';
const section = 'then-covid-happened';
const key = `portfolio-reading:${article}`;

test('returning readers can resume their last section without an automatic jump', async ({
  page,
}) => {
  await page.goto(article);
  await expect(page.locator('[data-reading-target="resume"]')).toBeHidden();
  await page
    .locator(`#${section}`)
    .evaluate((heading) => heading.scrollIntoView({ block: 'start' }));
  await expect(
    page.locator(`.article-contents a[href="#${section}"]`).first(),
  ).toHaveAttribute('aria-current', 'location');
  await page.goto('/blog/');
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
    section,
  );
  await page.goto(article);
  const resume = page.locator('[data-reading-target="resume"]');
  await expect(resume).toBeVisible();
  await expect(resume.getByRole('link')).toHaveText('Then COVID happened');
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await resume.getByRole('link').focus();
  await page.keyboard.press('Enter');
  await page.waitForURL(`**/#${section}`);
  await expect(page.locator(`#${section}`)).toBeFocused();
  await expect(page.locator(`#${section}`)).toBeInViewport();
  await expect(resume).toBeHidden();
});

test('direct section links win and obsolete reading places are discarded', async ({
  page,
}) => {
  await page.goto('/blog/');
  await page.evaluate(
    ({ key, section }) => localStorage.setItem(key, section),
    { key, section },
  );
  await page.goto(`${article}#the-things-i-still-appreciate`);
  await expect(page.locator('[data-reading-target="resume"]')).toBeHidden();
  await page.goto('/blog/');
  await page.evaluate(
    (key) => localStorage.setItem(key, 'a-section-that-no-longer-exists'),
    key,
  );
  await page.goto(article);
  await expect(page.locator('[data-reading-target="resume"]')).toBeHidden();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), key),
  ).toBeNull();
});

test('reaching the end clears the saved place', async ({ page }) => {
  await page.goto(`${article}#what-twelve-years-have-taught-me`);
  await page.locator('.article-body > p').last().scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator('.article-body > p')
        .last()
        .evaluate(
          (paragraph) => paragraph.getBoundingClientRect().bottom - innerHeight,
        ),
    )
    .toBeLessThanOrEqual(1);
  await expect(
    page
      .locator('.article-contents a[href="#what-twelve-years-have-taught-me"]')
      .first(),
  ).toHaveAttribute('aria-current', 'location');
  await page.goto('/blog/');
  expect(
    await page.evaluate((key) => localStorage.getItem(key), key),
  ).toBeNull();
  await page.goto(article);
  await expect(page.locator('[data-reading-target="resume"]')).toBeHidden();
});

test('blocked storage leaves article navigation usable', async ({ page }) => {
  await page.addInitScript(() => {
    for (const method of ['getItem', 'setItem', 'removeItem']) {
      Storage.prototype[method] = () => {
        throw new Error('Storage blocked');
      };
    }
  });
  await page.goto(`${article}#${section}`);
  await expect(page.locator('[data-reading-target="resume"]')).toBeHidden();
  await expect(page.locator(`#${section}`)).toBeInViewport();
  await page.goto('/blog/');
  await expect(page.locator('#archive-title')).toBeVisible();
});
