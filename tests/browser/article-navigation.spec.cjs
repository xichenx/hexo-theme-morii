'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);
test.use({ javaScriptEnabled: false });

test('oldest-first navigation follows newer posts while series order stays intact', async ({ page }) => {
  await ready(page, 'posts/reading/');
  const navigation = page.getByRole('navigation', { name: '相邻文章' });
  const previous = navigation.locator('[rel=prev]');
  const next = navigation.locator('[rel=next]');
  await expect(previous).toHaveAttribute('href', '/layout/posts/cards/');
  await expect(next).toHaveAttribute('href', '/layout/posts/welcome/');
  const series = page.getByRole('navigation', { name: '系列文章导航' });
  await expect(series.getByRole('link', { name: /系列上一篇/ })).toHaveAttribute('href', '/layout/posts/settings/');
  await next.scrollIntoViewIfNeeded();
  await noOverflow(page);
  await next.press('Enter');
  await expect(page).toHaveURL(/\/layout\/posts\/welcome\/$/);
});
