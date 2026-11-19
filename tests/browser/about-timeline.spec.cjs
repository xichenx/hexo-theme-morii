'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);
test.use({ javaScriptEnabled: false });

test('the about timeline shows dates and its internal link works without JavaScript', async ({ page }) => {
  await ready(page, 'about/');
  const timeline = page.locator('.about-journey');
  await expect(timeline.getByRole('listitem')).toHaveCount(3);
  await expect(timeline.locator('time').first()).toHaveAttribute('datetime', '2026-10-15');
  await expect(timeline.locator('time').last()).toHaveAttribute('datetime', '2026-10');
  await expect(timeline.getByRole('listitem').last()).toContainText('持续更新');
  const link = timeline.getByRole('link', { name: '写下第一篇主题笔记' });
  await expect(link).toHaveAttribute('href', '/layout/posts/welcome/');
  await link.scrollIntoViewIfNeeded();
  await noOverflow(page);
  await link.press('Enter');
  await expect(page).toHaveURL(/\/layout\/posts\/welcome\/$/);
});
