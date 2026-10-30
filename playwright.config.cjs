'use strict';
const { defineConfig } = require('@playwright/test');
const port = Number(process.env.MORII_BROWSER_PORT || 8792);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('MORII_BROWSER_PORT must be an integer between 1024 and 65535.');
const scenarios = [
  { name: 'desktop', browserName: 'chromium', viewport: { width: 1440, height: 900 } },
  { name: 'narrow', browserName: 'chromium', viewport: { width: 1024, height: 700 } },
  { name: 'short', browserName: 'chromium', viewport: { width: 1280, height: 520 } },
  { name: 'mobile-chromium', browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  { name: 'mobile-webkit', browserName: 'webkit', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
];
module.exports = defineConfig({
  testDir: './tests/browser',
  testMatch: '**/*.spec.cjs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 2,
  timeout: 30000,
  expect: { timeout: 5000 },
  outputDir: '.cache/browser-layout-results',
  reporter: [['list'], ['html', { outputFolder: '.cache/browser-layout-report', open: 'never' }]],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  projects: scenarios.flatMap(({ name, ...use }) => ['light', 'dark'].map(colorScheme => ({ name: `${name}-${colorScheme}`, use: { ...use, colorScheme } }))),
  webServer: {
    command: 'node tools/browser-server.cjs',
    env: { MORII_BROWSER_PORT: String(port) },
    url: `http://127.0.0.1:${port}/__morii_layout_health`,
    reuseExistingServer: false,
    timeout: 90000
  }
});
