'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);
test.use({ javaScriptEnabled: false });

test('a child category can be opened and its parent reached without JavaScript', async ({ page }) => {
  await ready(page, 'categories/主题使用/');
  const children = page.getByRole('navigation', { name: '子分类' });
  await expect(children.getByRole('link', { name: /入门/ })).toBeVisible();
  await noOverflow(page);
  await children.getByRole('link', { name: /入门/ }).click();
  const trail = page.getByRole('navigation', { name: '分类路径' });
  await expect(trail.locator('[aria-current="page"]')).toHaveText('入门');
  await expect(page.locator('.category-index [aria-current="page"]')).toHaveCount(1);
  await noOverflow(page);
  await trail.getByRole('link', { name: '主题使用' }).click();
  await expect(children).toBeVisible();
});
