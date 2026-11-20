'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);

test('simple article sidebar keeps its outline and skips profile and clock assets', async ({ page, viewport }) => {
  await ready(page, 'posts/toc-simple/');
  const sidebar = page.locator('.reading-aside');
  await expect(sidebar.locator('.profile-card, [data-weather-clock]')).toHaveCount(0);
  await expect(page.locator('script[src*="/js/clock."]')).toHaveCount(0);
  const mobile = viewport.width <= 960;
  if (mobile) await page.locator('[data-reading-toc]').click();
  const toc = page.locator(mobile ? '#reading-toc-dialog' : '.reading-aside .toc-card');
  const chapter = toc.getByRole('link', { name: '第二个章节' });
  await expect(chapter).toBeVisible();
  const href = await chapter.getAttribute('href');
  await chapter.click();
  await expect.poll(() => page.evaluate(() => location.hash)).toBe(href);
  if (mobile) await expect(toc).toBeHidden();
  await noOverflow(page);

  await ready(page, 'posts/code-styles/');
  await expect(sidebar.locator('.toc-card')).toHaveCount(0);
  await expect(sidebar.locator('.profile-card')).toHaveCount(1);
  await expect(sidebar.locator('[data-weather-clock]')).toHaveCount(1);
});
