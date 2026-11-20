'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);

test('sticky navigation shows a long article title only after the heading scrolls away', async ({ page }) => {
  await ready(page, 'posts/layout-stress/');
  const heading = page.locator('.article-header h1');
  const title = page.locator('.header-post-title');
  const brand = page.locator('.site-header .brand');
  const brandCopy = brand.locator('.brand__copy');
  await expect(title).toBeHidden();
  await expect(brandCopy).toBeVisible();

  await heading.evaluate(element => window.scrollTo({
    top: window.scrollY + element.getBoundingClientRect().bottom + 200,
    behavior: 'instant'
  }));
  await expect(title).toBeVisible();
  await expect(title).toHaveText(await heading.textContent());
  await expect(title).toHaveCSS('text-overflow', 'ellipsis');
  await expect(brandCopy).toBeHidden();
  await expect(brand).toHaveAttribute('href', '/layout/');
  await expect(page.locator('#search-open')).toBeInViewport();
  await noOverflow(page);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(title).toBeHidden();
  await expect(brandCopy).toBeVisible();
});
