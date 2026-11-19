'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);

test('moments can be filtered by month and old anchor links still reveal their cards', async ({ page }) => {
  await ready(page, 'essay/');
  const select = page.locator('#moment-month');
  const shown = page.locator('.essay-card:visible');
  await expect(select).toBeVisible();
  await expect(shown).toHaveCount(3);
  await select.selectOption('2026-10');
  await expect(shown).toHaveCount(1);
  await expect(shown).toContainText('October note');
  await expect(page.locator('[data-moment-filter] [role="status"]')).toHaveText('显示 1 条即刻');
  await expect(page.locator('[data-moment-group]').last()).toBeHidden();
  await noOverflow(page);

  await page.evaluate(() => { location.hash = 'moment-1-2'; });
  await expect(select).toHaveValue('2026-09');
  await expect(shown).toContainText('September note');
  await select.selectOption('undated');
  await expect(shown).toContainText('Undated note');
  await select.selectOption('');
  await expect(shown).toHaveCount(3);
});
