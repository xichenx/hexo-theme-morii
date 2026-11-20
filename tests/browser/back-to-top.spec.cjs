'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);

test('back-to-top shows page scroll progress and still returns to the top', async ({ page }) => {
  await ready(page, 'posts/layout-stress/');
  const backToTop = page.locator('#back-to-top');
  await expect(backToTop).toBeHidden();

  const scrollToFraction = async fraction => {
    await page.evaluate(value => {
      const scroll = document.scrollingElement;
      window.scrollTo({ top: (scroll.scrollHeight - scroll.clientHeight) * value, behavior: 'instant' });
    }, fraction);
  };
  await scrollToFraction(0.5);
  await expect(backToTop).toHaveText('50%');
  await expect(backToTop).toBeVisible();

  await scrollToFraction(1);
  await expect(backToTop).toHaveText('100%');
  expect(await backToTop.evaluate(button => button.scrollWidth <= button.clientWidth)).toBe(true);
  await noOverflow(page);

  await page.locator('main').evaluate(main => {
    const extraContent = document.createElement('div');
    extraContent.style.height = '4000px';
    main.append(extraContent);
  });
  await expect(backToTop).toHaveText(/^[1-9][0-9]%$/);
  await page.getByRole('button', { name: '返回顶部' }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(backToTop).toBeHidden();
});
