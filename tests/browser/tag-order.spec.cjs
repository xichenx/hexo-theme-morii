'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);

test('tag order can switch between post count and name while preserving links', async ({ page }) => {
  await ready(page, 'tags/');
  const select = page.getByRole('combobox', { name: '标签排序' });
  const links = page.locator('.taxonomy-tags a');
  const addresses = () => links.evaluateAll(items => items.map(item => item.href));
  const names = () => links.evaluateAll(items => items.map(item => item.firstChild.textContent.trim().slice(1).trim()));
  await expect(select).toHaveValue('count');
  await expect(links.first()).toContainText('开始写作');
  const initialLinks = await addresses();
  const namesByLocale = (await names()).sort(new Intl.Collator('zh-CN', { numeric: true }).compare);
  await select.focus();
  await select.selectOption('name');
  await expect(select).toBeFocused();
  expect(await names()).toEqual(namesByLocale);
  expect(new Set(await addresses())).toEqual(new Set(initialLinks));
  await noOverflow(page);
  await select.selectOption('count');
  expect(await addresses()).toEqual(initialLinks);
  await links.first().click();
  await expect(page.locator('.post-grid .post-card')).toHaveCount(2);
  await expect(select).toHaveCount(0);
});
