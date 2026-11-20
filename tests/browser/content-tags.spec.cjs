'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);
test.use({ javaScriptEnabled: false });

test('article timeline and button work on a subdirectory without JavaScript', async ({ page }) => {
  await ready(page, 'posts/reading/');
  const timeline = page.locator('.content-timeline');
  await expect(timeline).toHaveAttribute('data-tone', 'purple');
  await expect(timeline.getByRole('listitem')).toHaveCount(2);
  await expect(timeline.locator('time')).toHaveAttribute('datetime', '2026-10');
  await expect(timeline.locator('li strong').first()).toHaveText('阅读工具');
  const link = page.getByRole('link', { name: '浏览文章归档' });
  await expect(link).toHaveAttribute('href', '/layout/archives/');
  await link.scrollIntoViewIfNeeded();
  await noOverflow(page);
  await link.press('Enter');
  await expect(page).toHaveURL(/\/layout\/archives\/$/);
});
