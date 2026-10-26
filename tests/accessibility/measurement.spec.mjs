import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  measureLayers,
  examples,
  selectedLayer,
} from '../../assets/js/measurements.ts';

test('measurements distinguish gaps, edge offsets, and contained insets', () => {
  const distances = (key) =>
    measureLayers(selectedLayer, examples[key].layer).map(({ name, value }) => [
      name,
      value,
    ]);
  expect(distances('separated')).toEqual([['Horizontal gap', 60]]);
  expect(distances('overlapping')).toEqual([
    ['Left edge', 70],
    ['Right edge', 70],
    ['Top edge', 50],
    ['Bottom edge', 50],
  ]);
  expect(distances('contained')).toEqual([
    ['Left edge', 50],
    ['Right edge', 80],
    ['Top edge', 50],
    ['Bottom edge', 50],
  ]);
});

test('gaps work in either direction and shared edges do not create phantom distances', () => {
  const a = { x: 30, y: 20, width: 40, height: 30 };
  const b = { x: 0, y: 80, width: 10, height: 10 };
  expect(measureLayers(a, b).map(({ value }) => value)).toEqual([20, 30]);
  expect(measureLayers(b, a).map(({ value }) => value)).toEqual([20, 30]);
  expect(measureLayers(a, a)).toEqual([]);
  expect(measureLayers(a, { ...a, x: 70 })).toEqual([]);
});

test('measurement example supports relationship changes and keyboard zoom without changing distances', async ({
  page,
}) => {
  await page.goto('/work/invision/#measurement-demo');
  const demo = page.locator('#measurement-demo');
  const summary = demo.getByRole('status', { name: 'Measurement result' });
  await expect(summary).toContainText('Horizontal gap: 60 px');
  await demo.getByLabel('Layer relationship').selectOption('overlapping');
  await expect(summary).toContainText('Left edge: 70 px');
  await expect(demo.locator('[data-measurement]')).toHaveCount(4);
  await demo.getByLabel('Layer relationship').selectOption('contained');
  await expect(summary).toContainText('Right edge: 80 px');
  const distances = await demo
    .locator('[data-measurement] text')
    .allTextContents();
  const zoom = demo.getByLabel('Display zoom');
  await zoom.focus();
  await zoom.press('ArrowRight');
  await expect(demo.locator('output')).toHaveText('125%');
  expect(
    await demo.locator('[data-measurement] text').allTextContents(),
  ).toEqual(distances);
  await expect(
    demo.locator('[data-measurement-target="scene"]'),
  ).toHaveAttribute('transform', /scale\(1\.25\)/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const results = await new AxeBuilder({ page })
    .include('#measurement-demo')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

test('measurement example remains useful without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`${baseURL}/work/invision/#measurement-demo`);
    const demo = page.locator('#measurement-demo');
    await expect(demo.getByRole('img')).toBeVisible();
    await expect(demo.getByRole('status')).toContainText('60 px');
    await expect(demo.getByLabel('Layer relationship')).toBeHidden();
    await expect(demo.getByRole('link')).toHaveAttribute(
      'href',
      '/blog/building-the-inspect-measurement-engine/',
    );
  } finally {
    await context.close();
  }
});

test('moving a layer keeps design coordinates accurate at every display zoom', async ({
  page,
}, testInfo) => {
  await page.goto('/work/invision/#measurement-demo');
  const demo = page.locator('#measurement-demo');
  const mover = demo.locator('[data-measurement-target="mover"]');
  const selected = demo.locator('[data-measurement-target="selected"]');
  const summary = demo.getByRole('status', { name: 'Measurement result' });
  const reset = demo.getByRole('button', { name: 'Reset', exact: true });
  for (const zoom of [75, 125]) {
    await demo.getByLabel('Display zoom').fill(String(zoom));
    await expect(reset).toBeDisabled();
    await mover.focus();
    await mover.press('ArrowRight');
    await mover.press('Shift+ArrowRight');
    await expect(selected).toHaveAttribute('x', '191');
    await expect(summary).toContainText('Horizontal gap: 49 px');
    await mover.press('ArrowDown');
    await expect(selected).toHaveAttribute('y', '151');
    await reset.click();
    await expect(summary).toContainText('Horizontal gap: 60 px');
    const hitArea = await demo
      .locator('[data-measurement-target="hitArea"]')
      .boundingBox();
    expect(hitArea.width).toBeGreaterThanOrEqual(43.99);
    expect(hitArea.height).toBeGreaterThanOrEqual(43.99);
    const box = await selected.boundingBox();
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    const scale = await demo
      .locator('[data-measurement-target="scene"]')
      .evaluate((scene) => scene.getScreenCTM().a);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 80 * scale, y, { steps: 5 });
    const position = Number(await selected.getAttribute('x'));
    // Browser pointer coordinates can round to physical viewport pixels.
    expect(Math.abs(position - 260)).toBeLessThanOrEqual(Math.ceil(1 / scale));
    // Announce once on release, not at every pointer position.
    await expect(summary).toContainText('Horizontal gap: 60 px');
    await page.mouse.up();
    await expect(summary).toContainText('Overlapping layers');
    await expect(summary).toContainText(`Left edge: ${360 - position} px`);
    await reset.click();
    await expect(selected).toHaveAttribute('x', '180');
    await expect(selected).toHaveAttribute('y', '150');
  }
  await demo
    .getByRole('button', { name: 'Move selected layer right', exact: true })
    .click();
  await expect(summary).toContainText('Horizontal gap: 50 px');
  await demo.getByLabel('Layer relationship').selectOption('contained');
  await expect(reset).toBeDisabled();
  await expect(summary).toContainText('Right edge: 80 px');
  await demo.getByLabel('Display zoom').fill('75');
  const left = demo.getByRole('button', {
    name: 'Move selected layer left',
    exact: true,
  });
  if (testInfo.project.use.hasTouch) await left.tap();
  else await left.click();
  await expect(summary).toContainText('Left edge: 40 px');
  await expect(summary).toContainText('Right edge: 90 px');
  await demo.getByLabel('Display zoom').fill('100');
  await demo.screenshot({ path: testInfo.outputPath('measurement-demo.png') });
});

test('a grabbed layer cancels with Escape and stays inside the canvas', async ({
  page,
}) => {
  await page.goto('/work/invision/#measurement-demo');
  const demo = page.locator('#measurement-demo');
  const selected = demo.locator('[data-measurement-target="selected"]');
  await selected.scrollIntoViewIfNeeded();
  const box = await selected.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 40, y + 10);
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await expect(selected).toHaveAttribute('x', '180');
  await expect(selected).toHaveAttribute('y', '150');
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 1000, y + 1000);
  await page.mouse.up();
  await expect(selected).toHaveAttribute('x', '424');
  await expect(selected).toHaveAttribute('y', '240');
  await demo.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(selected).toHaveAttribute('x', '180');
});
