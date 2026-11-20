'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready } = require('./helpers.cjs');
installHooks(test);

test('article settings can hide the whole outline or just its percentage', async ({ page, viewport }) => {
  await ready(page, 'posts/code-styles/');
  await expect(page.locator('.article-body h2').first()).toBeVisible();
  await expect(page.locator('.toc-card, .mobile-toc, #reading-toc-dialog, [data-reading-toc]')).toHaveCount(0);
  await expect(page.locator('.reading-progress')).toHaveCount(1);

  await ready(page, 'posts/layout-stress/');
  await expect(page.locator('[data-reading-percent]')).toHaveCount(0);
  const mobile = viewport.width <= 960;
  if (mobile) await page.locator('[data-reading-toc]').click();
  const toc = page.locator(mobile ? '#reading-toc-dialog' : '.toc-card');
  const first = toc.locator('.toc-content a').first();
  await expect(first).toBeVisible();
  const href = await first.getAttribute('href');
  await first.click();
  await expect.poll(() => page.evaluate(() => location.hash)).toBe(href);
  if (mobile) await expect(toc).toBeHidden();
});
