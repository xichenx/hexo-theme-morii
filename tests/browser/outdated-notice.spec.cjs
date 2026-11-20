'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);
test.use({ javaScriptEnabled: false });

test('article reminders honor site placement and per-post settings without JavaScript', async ({ page }) => {
  await ready(page, 'posts/outdated-bottom/');
  const notice = page.locator('.outdated-notice');
  await expect(notice).toHaveCount(1);
  await expect(page.locator('.article-body + .outdated-notice')).toBeVisible();
  await expect(notice).toHaveAttribute('data-days-limit', '30');
  await notice.scrollIntoViewIfNeeded();
  await noOverflow(page);

  await ready(page, 'posts/outdated-top/');
  await expect(notice).toHaveCount(1);
  await expect(page.locator('.outdated-notice ~ .article-body')).toHaveCount(1);
  await expect(notice).toBeVisible();
  await expect(notice).toHaveAttribute('data-days-limit', '365');
});
