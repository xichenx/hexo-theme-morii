'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);

test('random friend visits respect filters and do not repeat consecutive sites', async ({ context, page }) => {
  await context.route('https://*.friend.test/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>Friend fixture</title>' }));
  await page.addInitScript(() => { Math.random = () => 0; });
  await ready(page, 'link/');
  const random = page.getByRole('button', { name: /随机逛逛/ });
  const visit = async url => {
    const [opened] = await Promise.all([context.waitForEvent('page'), random.click()]);
    try {
      await expect(opened).toHaveURL(url);
      expect(await opened.evaluate(() => window.opener)).toBeNull();
    } finally { await opened.close(); }
  };
  await expect(random).toBeEnabled();
  await noOverflow(page);
  await visit('https://alpha.friend.test/');
  await visit('https://beta.friend.test/');

  await page.getByRole('button', { name: /生活/ }).click();
  const search = page.locator('#friend-search');
  await search.fill('Alpha');
  await expect(random).toBeDisabled();
  await search.fill('Gamma');
  await expect(random).toBeEnabled();
  await visit('https://gamma.friend.test/');
  await expect(page).toHaveURL(/\/layout\/link\/$/);
});
