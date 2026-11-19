'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);
test.use({ javaScriptEnabled: false });

test('the grouped footer works across pages without JavaScript', async ({ page, viewport }) => {
  await ready(page);
  const footer = page.locator('.footer-nav');
  const groups = footer.locator('.footer-nav__group');
  await expect(groups).toHaveCount(3);
  await footer.scrollIntoViewIfNeeded();
  const bounds = await footer.boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width);
  await noOverflow(page);
  await footer.locator('a[href="/layout/archives/"]').click();
  await expect(page).toHaveURL(/\/layout\/archives\/$/);
  await expect(footer.locator('[aria-current="page"]')).toHaveAttribute('href', '/layout/archives/');
  await expect(footer.locator('a[href^="https://github.com/"]')).toHaveCount(1);
});
