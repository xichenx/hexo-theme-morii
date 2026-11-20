'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);
test.use({ javaScriptEnabled: false });

test('article header dates and reading metrics render without client scripts', async ({ page, colorScheme, viewport }, info) => {
  const hero = page.locator('.post-hero');
  const meta = page.locator('.article-header .article-meta');
  const groups = meta.locator('.article-meta__group');
  const dates = meta.locator('time[datetime]');
  if (viewport.width < 600) await page.setViewportSize({ width: 320, height: viewport.height });
  await ready(page, 'posts/welcome/');
  await page.locator('html').evaluate((html, theme) => { html.dataset.theme = theme; }, colorScheme);
  await expect(groups).toHaveCount(2);
  await expect(groups.first().locator('time')).toHaveCount(2);
  await expect(groups.last().getByText(/分钟阅读/)).toBeVisible();
  await expect(dates).toHaveCount(2);
  await expect(meta).toContainText('发布于');
  await expect(meta).toContainText('更新于');
  await expect(meta.getByText(/分钟阅读/)).toBeVisible();
  await expect(meta.getByText(/字数/)).toHaveCount(0);
  await noOverflow(page);
  const coverScreenshot = info.outputPath('hero-cover.png');
  await hero.screenshot({ path: coverScreenshot });
  await info.attach('hero-cover', { path: coverScreenshot, contentType: 'image/png' });

  await ready(page, 'posts/toc-simple/');
  await page.locator('html').evaluate((html, theme) => { html.dataset.theme = theme; }, colorScheme);
  await expect(dates).toHaveCount(1);
  await expect(dates).toBeVisible();
  await expect(dates).toHaveText('2024-02-03');
  await expect(dates).toHaveAttribute('datetime', /^2024-02-03T/);
  await expect(meta).toContainText('更新于');
  await expect(meta.getByText('字数 16', { exact: true })).toBeVisible();
  await expect(meta.getByText(/分钟阅读/)).toHaveCount(0);
  await noOverflow(page);
  const plainScreenshot = info.outputPath('hero-plain.png');
  await hero.screenshot({ path: plainScreenshot });
  await info.attach('hero-plain', { path: plainScreenshot, contentType: 'image/png' });

  await page.emulateMedia({ media: 'print' });
  await expect(meta.locator('svg').first()).toBeHidden();
  await expect(meta).toHaveCSS('border-top-width', '0px');
  await expect(dates).toBeVisible();
  await page.emulateMedia({ media: 'screen' });
});
