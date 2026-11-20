'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready } = require('./helpers.cjs');
installHooks(test);

test('body images load on scroll and in print preview, with image viewing available', async ({ page }) => {
  const requested = [];
  await page.route('**/test-images/*.svg', route => {
    requested.push(new URL(route.request().url()).pathname.split('/').at(-1));
    return route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60"><rect width="120" height="60" fill="teal"/></svg>' });
  });
  await ready(page, 'posts/lazy-images/');
  const inline = page.getByRole('img', { name: 'Morii 图标' });
  await expect(inline).toHaveAttribute('src', '/layout/icons/brand/morii-logo.png');
  await expect(inline).toHaveCSS('display', 'inline-block');
  await expect(inline).toHaveCSS('height', '18px');
  await expect(inline).not.toHaveAttribute('tabindex');
  await inline.click();
  await expect(page.locator('#image-dialog')).toBeHidden();
  const first = page.locator('.article-body img[alt="First"]');
  const later = page.locator('.article-body img[alt="Later"]');
  await expect(first).not.toHaveAttribute('loading', 'lazy');
  await expect(later).toHaveAttribute('loading', 'lazy');
  expect(requested).toEqual(['first.svg']);
  await later.scrollIntoViewIfNeeded();
  await expect.poll(() => requested.includes('later.svg')).toBe(true);
  await later.click();
  await expect(page.locator('#image-dialog')).toBeVisible();
  await page.locator('#image-close').click();
  await page.locator('.reading-settings summary').click();
  expect(requested).not.toContain('print.svg');
  await page.locator('.reading-settings [data-preview-print]').click();
  await expect.poll(() => requested.includes('print.svg')).toBe(true);
  await expect.poll(() => page.locator('.article-body img[alt="Print"]').evaluate(image => image.naturalWidth)).toBe(120);
});
