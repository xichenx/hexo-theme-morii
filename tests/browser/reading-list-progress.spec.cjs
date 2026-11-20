'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);

test('saved reading progress can be found and resumed from the reading list', async ({ page }) => {
  await ready(page, 'posts/layout-stress/');
  await page.evaluate(() => {
    const { pathname } = location;
    const updated = document.getElementById('reading-resume').dataset.updated;
    localStorage.setItem('morii-reading-list', JSON.stringify([pathname, '/layout/posts/welcome/']));
    localStorage.setItem('morii-reading-progress', JSON.stringify([{ path: pathname, updated, at: Date.now(), ratio: .42 }]));
  });

  await ready(page, 'reading-list/');
  const cards = page.locator('.saved-card');
  await expect(cards).toHaveCount(2);
  await expect(cards.first()).toContainText('上次读到 42%');
  await noOverflow(page);
  await page.getByRole('checkbox', { name: '仅显示有阅读进度的文章' }).check();
  await expect(cards).toHaveCount(1);
  await cards.getByRole('link', { name: '继续阅读 →' }).click();
  await expect(page.locator('#reading-resume-description')).toContainText('上次读到 42%');
  await page.locator('#reading-resume-continue').click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
});
