'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);
test.use({ javaScriptEnabled: false });

test('article header dates render without client scripts', async ({ page }) => {
  const meta = page.locator('.article-header .article-meta');
  const dates = meta.locator('time[datetime]');
  await ready(page, 'posts/welcome/');
  await expect(dates).toHaveCount(2);
  await expect(meta).toContainText('发布于');
  await expect(meta).toContainText('更新于');
  await noOverflow(page);

  await ready(page, 'posts/toc-simple/');
  await expect(dates).toHaveCount(1);
  await expect(dates).toBeVisible();
  await expect(dates).toHaveText('2024-02-03');
  await expect(dates).toHaveAttribute('datetime', /^2024-02-03T/);
  await expect(meta).toContainText('更新于');
  await expect(meta).toContainText('分钟');
  await noOverflow(page);
});
