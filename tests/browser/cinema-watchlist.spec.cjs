'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);

test('cinema watchlist filters saved titles, survives reload and supports removal', async ({ page }) => {
  await ready(page, 'cinema/');
  const saved = page.locator('[data-cinema-filter="watchlist"]');
  const cards = page.locator('[data-cinema-card]:visible');
  const empty = page.locator('[data-cinema-no-results]');
  await saved.click();
  await expect(empty).toContainText('想看片单还是空的');
  await page.locator('[data-cinema-filter="all"]').click();

  const star = page.getByRole('button', { name: '想看：花朵 · 播放示例' });
  await star.click();
  await expect(star).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-cinema-stage]')).toBeHidden();

  await page.reload({ waitUntil: 'load' });
  await expect(star).toHaveAttribute('aria-pressed', 'true');
  await expect(saved).toHaveText('想看 1');
  await saved.click();
  await expect(cards).toHaveCount(1);
  const search = page.getByRole('searchbox', { name: '搜索片名' });
  await search.fill('动漫');
  await expect(cards).toHaveCount(0);
  await expect(empty).toContainText('没有找到符合条件的作品');
  await search.clear();
  await noOverflow(page);

  await star.click();
  await expect(saved).toBeFocused();
  await expect(empty).toContainText('想看片单还是空的');
  await page.reload({ waitUntil: 'load' });
  await expect(star).toHaveAttribute('aria-pressed', 'false');
  await expect(saved).toHaveText('想看 0');
});
