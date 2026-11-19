'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);

test('a search result shows separated highlighted passages and opens the article once', async ({ page }) => {
  await ready(page);
  await page.locator('#search-open').click();
  const dialog = page.locator('#search-dialog');
  await expect(dialog).toHaveAttribute('data-search-ready', 'true');
  await dialog.locator('#search-input').fill('orioncache nebularender');
  const links = dialog.locator('#search-results a');
  await expect(links).toHaveCount(1);
  const snapshots = links.first().locator('.search-result-summary');
  await expect(snapshots).toHaveCount(2);
  await expect(snapshots.first().locator('mark')).toHaveText('orioncache');
  await expect(snapshots.last().locator('mark')).toHaveText('nebularender');
  await noOverflow(page);
  await links.first().click();
  await expect(page).toHaveURL(/\/layout\/posts\/search-matches\/$/);
});
