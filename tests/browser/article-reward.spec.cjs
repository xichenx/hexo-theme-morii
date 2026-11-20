'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);
test.use({ javaScriptEnabled: false });

test('article support opens with the keyboard and works with deployment prefixes', async ({ page }) => {
  await ready(page, 'posts/code-styles/');
  await expect(page.locator('.article-reward')).toHaveCount(0);

  await ready(page, 'posts/welcome/');
  const disclosure = page.locator('.article-reward');
  const summary = disclosure.locator('summary');
  const qr = disclosure.locator('img');
  await expect(disclosure).not.toHaveAttribute('open');
  await expect(qr).toBeHidden();
  await summary.press('Enter');
  await expect(disclosure).toHaveAttribute('open', '');
  await expect(disclosure).toContainText('感谢支持这篇文章');
  await expect(qr).toBeVisible();
  await expect(qr).toHaveAttribute('loading', 'lazy');
  await expect(qr).toHaveAttribute('src', '/layout/icons/brand/morii-logo.png');
  await expect(disclosure.getByRole('link', { name: '打开示例二维码' })).toHaveAttribute('href', '/layout/icons/brand/morii-logo.png');
  await expect(disclosure.getByRole('link')).toHaveCount(2);
  await noOverflow(page);
  await disclosure.getByRole('link', { name: '支持说明' }).press('Enter');
  await expect(page).toHaveURL(/\/layout\/about\/$/);
});
