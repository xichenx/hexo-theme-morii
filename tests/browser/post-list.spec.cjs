'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);

test('article cards keep aligned footers and readable category controls', async ({ page }) => {
  await ready(page);
  await page.locator('#latest').scrollIntoViewIfNeeded();
  const cards = page.locator('.post-grid .post-card');
  expect(await cards.count()).toBeGreaterThan(1);
  const rows = await cards.evaluateAll(nodes => nodes.map(card => {
    const box = card.getBoundingClientRect();
    const read = card.querySelector('.post-card__read').getBoundingClientRect();
    const date = card.querySelector('time');
    return { top: box.top, bottom: read.bottom, touchHeight: read.height, date: date?.dateTime };
  }));
  for (const card of rows) {
    expect(card.touchHeight).toBeGreaterThanOrEqual(44);
    expect(Number.isNaN(Date.parse(card.date))).toBe(false);
    for (const sibling of rows.filter(row => Math.abs(row.top - card.top) < 1)) {
      expect(Math.abs(sibling.bottom - card.bottom)).toBeLessThanOrEqual(1);
    }
  }
  await noOverflow(page);
});

test('very long categories fit the screen and keyboard focus reveals the last category', async ({ page }) => {
  await ready(page);
  const nav = page.locator('.category-nav').first();
  const category = nav.locator('a:has(small)').first();
  const longName = 'AndroidInternalsWithoutSpaces'.repeat(12);
  await category.locator('span').evaluate((e, name) => { e.textContent = name; e.parentElement.title = name; }, longName);
  await expect(category).toHaveAccessibleName(new RegExp(longName));
  expect(await category.locator('span').evaluate(e => e.scrollWidth > e.clientWidth)).toBe(true);
  await expect(category.locator('small')).toBeVisible();
  await nav.locator('a').last().focus();
  const bounds = await nav.evaluate(e => {
    const link = e.querySelector('a:last-child').getBoundingClientRect();
    const box = e.getBoundingClientRect();
    return { left: link.left - box.left, right: box.right - link.right, height: link.height };
  });
  expect(bounds.left).toBeGreaterThanOrEqual(-1);
  expect(bounds.right).toBeGreaterThanOrEqual(-1);
  expect(bounds.height).toBeGreaterThanOrEqual(44);
  await noOverflow(page);
});
