import { test, expect } from '@playwright/test';
import { createFishShadows } from '../../assets/js/fish-shadows.ts';

test('nearby fish accelerate away and recover to cruising speed', () => {
  const cruising = createFishShadows(0);
  const startled = createFishShadows(0);
  const width = 1200;
  const height = 400;
  cruising.update(0, width, height);
  startled.update(0, width, height);
  const origin = startled.uniforms.fishPose.value[0];
  const pointer = {
    x: origin.x * height - origin.z * 20,
    y: origin.y * height - origin.w * 20,
  };
  for (let frame = 0; frame < 30; frame++) {
    cruising.update(1 / 60, width, height);
    startled.update(1 / 60, width, height, pointer);
  }
  const distanceFrom = (school) => {
    const pose = school.uniforms.fishPose.value[0];
    return Math.hypot(pose.x * height - pointer.x, pose.y * height - pointer.y);
  };
  expect(distanceFrom(startled)).toBeGreaterThan(distanceFrom(cruising) * 1.4);
  const step = (school) => {
    const before = school.uniforms.fishPose.value[0].clone();
    school.update(1 / 60, width, height);
    const after = school.uniforms.fishPose.value[0];
    return Math.hypot(after.x - before.x, after.y - before.y);
  };
  const fast = step(startled);
  for (let frame = 0; frame < 600; frame++)
    startled.update(1 / 60, width, height);
  expect(step(startled)).toBeLessThan(fast * 0.5);
});

test('fish rendering pauses offscreen, on request, and for accessibility preferences', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    window.__fishDraws = 0;
    window.__fishContexts = 0;
    window.__testHidden = false;
    Object.defineProperty(document, 'hidden', {
      get: () => window.__testHidden,
    });
    const canvases = new WeakSet();
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      const context = getContext.call(this, type, ...args);
      if (
        (type === 'webgl' || type === 'webgl2') &&
        context &&
        !canvases.has(this)
      ) {
        canvases.add(this);
        window.__fishContexts++;
      }
      return context;
    };
    for (const Type of [WebGLRenderingContext, WebGL2RenderingContext]) {
      for (const name of ['drawElements', 'drawArrays']) {
        const draw = Type.prototype[name];
        Type.prototype[name] = function (...args) {
          window.__fishDraws++;
          return draw.apply(this, args);
        };
      }
    }
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/blog/');
  await expect(page.locator('.archive-hero')).toHaveAttribute(
    'data-spatial-ready',
    'true',
  );
  await expect(page.locator('.spatial-surface')).toHaveCount(1);
  expect(await page.evaluate(() => window.__fishContexts)).toBe(1);
  await expect(page.locator('.site-footer')).not.toHaveAttribute(
    'data-spatial-ready',
  );
  const draws = () => page.evaluate(() => window.__fishDraws);
  const first = await draws();
  await expect.poll(draws).toBeGreaterThan(first);
  const toggle = page.locator('[data-fish-toggle]');
  await toggle.evaluate((button) => button.click());
  await expect(toggle).toHaveText('Resume fish');
  const paused = await draws();
  await page.waitForTimeout(250);
  expect(await draws()).toBe(paused);
  await toggle.evaluate((button) => button.click());
  await expect.poll(draws).toBeGreaterThan(paused);

  await page.evaluate(() => {
    window.__testHidden = true;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const hidden = await draws();
  await page.waitForTimeout(250);
  expect(await draws()).toBe(hidden);
  await page.evaluate(() => {
    window.__testHidden = false;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(draws).toBeGreaterThan(hidden);
  await page.locator('.site-footer').scrollIntoViewIfNeeded();
  await expect(page.locator('.site-footer')).toHaveAttribute(
    'data-spatial-ready',
    'true',
  );
  await expect(page.locator('.spatial-surface')).toHaveCount(2);
  expect(await page.evaluate(() => window.__fishContexts)).toBe(2);
  await page
    .locator('#year-2020')
    .evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await expect
    .poll(async () => {
      const before = await draws();
      await page.waitForTimeout(200);
      return (await draws()) - before;
    })
    .toBe(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.spatial-surface')).toHaveCount(0);
  await expect(toggle).toBeHidden();
  await page.emulateMedia({
    reducedMotion: 'no-preference',
    forcedColors: 'active',
  });
  await expect(page.locator('.spatial-surface')).toHaveCount(0);
  await expect(toggle).toBeHidden();
  expect(errors).toEqual([]);
});

test('Make waves glyph flows only during fine-pointer hover', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const button = page.locator('[data-wave-trigger]');
  await expect(button).toBeVisible();
  const lines = button.locator('.wave-icon path');
  const fine = await page.evaluate(
    () => matchMedia('(hover: hover) and (pointer: fine)').matches,
  );
  await button.hover();
  if (fine) {
    await expect(lines.first()).toHaveCSS('animation-play-state', 'running');
    const before = await lines
      .first()
      .evaluate((element) => getComputedStyle(element).transform);
    await expect
      .poll(() =>
        lines
          .first()
          .evaluate((element) => getComputedStyle(element).transform),
      )
      .not.toBe(before);
    await page.mouse.move(1, 1);
    await expect(lines.first()).toHaveCSS('animation-play-state', 'paused');
  } else {
    await expect(lines.first()).toHaveCSS('animation-name', 'none');
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(lines.first()).toHaveCSS('animation-name', 'none');
});

test('wave instructions do not move the title in a short viewport', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: page.viewportSize().width, height: 500 });
  await page.goto('/');
  const button = page.locator('[data-wave-trigger]');
  const title = page.locator('.hero-title');
  const help = page.locator('[data-wave-help]');
  await expect(button).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const before = await title.boundingBox();
  await button.click();
  await expect(button).toContainText('Stop waves');
  expect(await title.boundingBox()).toEqual(before);
  const workLink = await page
    .getByRole('link', { name: 'Explore selected work', exact: true })
    .boundingBox();
  const instruction = await help.boundingBox();
  expect(instruction.y).toBeGreaterThanOrEqual(workLink.y + workLink.height);
  await button.click();
  await expect(button).toContainText('Make waves');
  expect(await title.boundingBox()).toEqual(before);
});
