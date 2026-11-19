'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);
test.use({ javaScriptEnabled: false });

test('archive months can be reached with the keyboard and across a subdirectory', async ({ page }) => {
  await ready(page, 'archives/');
  const index = page.locator('.archive-months');
  const nav = index.locator('nav');
  const outer = index.locator(':scope > summary');
  await expect(nav).toBeHidden();
  await outer.press('Enter');
  await expect(nav).toBeVisible();
  const olderMonth = nav.locator('a[href="/layout/archives/2020/01/"]');
  await expect(olderMonth).toBeHidden();
  await nav.locator('summary').filter({ hasText: /^2020$/ }).press('Enter');
  await expect(olderMonth).toBeVisible();
  await noOverflow(page);
  await olderMonth.press('Enter');
  await expect(page).toHaveURL(/\/layout\/archives\/2020\/01\/$/);
  await expect(index.locator('a[aria-current="date"]')).toHaveAttribute('href', '/layout/archives/2020/01/');
  await expect(page.locator('.archive-entry')).toHaveCount(1);
  await ready(page, 'categories/');
  await expect(index).toHaveCount(0);
});
