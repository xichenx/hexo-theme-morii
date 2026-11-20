'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);

test('article sidebar can sit on the left while focus, mobile and print stay single-column', async ({ page, viewport }) => {
  await ready(page, 'posts/toc-simple/');
  const layout = page.locator('.reading-layout');
  const sidebar = layout.locator('.reading-aside');
  const article = layout.locator('.article-card');
  await expect(layout).toHaveClass(/reading-layout--left/);
  if (viewport.width > 960) {
    const left = await sidebar.boundingBox();
    const right = await article.boundingBox();
    expect(left.x + left.width).toBeLessThan(right.x);
    await expect(sidebar.getByRole('link', { name: '第二个章节' })).toBeVisible();
  } else {
    await expect(sidebar).toBeHidden();
    await expect(page.locator('[data-reading-toc]')).toBeVisible();
  }
  await noOverflow(page);

  await page.locator('.reading-settings summary').click();
  const focus = page.locator('#reading-focus-toggle');
  await focus.click();
  await expect(sidebar).toBeHidden();
  await expect(article).toHaveCSS('grid-column-start', 'auto');
  await expect(page.locator('[data-reading-toc]')).toBeVisible();
  await noOverflow(page);
  await focus.click();

  await page.emulateMedia({ media: 'print' });
  await expect(layout).toHaveCSS('display', 'block');
  await expect(sidebar).toBeHidden();
});
