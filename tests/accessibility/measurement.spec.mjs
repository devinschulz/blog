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
