import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/accessibility',
  fullyParallel: true,
  workers: 4,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4177',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Optional local Chrome fallback; CI uses Playwright's pinned Chromium.
    ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
  },
  projects: ['light', 'dark'].flatMap(colorScheme => [
    { name: `desktop-${colorScheme}`, use: { colorScheme, viewport: { width: 1440, height: 1000 } } },
    { name: `narrow-${colorScheme}`, use: { colorScheme, viewport: { width: 320, height: 800 } } },
  ]),
  webServer: {
    command: 'node scripts/serve-test-site.mjs',
    url: 'http://127.0.0.1:4177',
    reuseExistingServer: false,
  },
});
