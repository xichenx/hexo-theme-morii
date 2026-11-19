'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready } = require('./helpers.cjs');
installHooks(test);

test('the message board loads comments at the configured time', async ({ context, page }) => {
  const script = 'window.twikoo = { init({el}) { document.querySelector(el).textContent = "Comment provider is ready"; } };';
  let loads = 0;
  await context.route('**/test-comments.js', route => {
    loads++;
    return route.fulfill({ contentType: 'application/javascript', body: script });
  });
  const board = page.locator('#comment-service');
  const loaded = page.getByText('Comment provider is ready');

  await ready(page, 'comments/manual/');
  await expect(board).toHaveAttribute('data-load-mode', 'manual');
  await board.scrollIntoViewIfNeeded();
  await expect(board).toBeInViewport();
  expect(loads).toBe(0);
  await page.locator('#comments-load').click();
  await expect(loaded).toHaveCount(1);
  expect(loads).toBe(1);

  await ready(page, 'comments/viewport/');
  await expect(board).toHaveAttribute('data-load-mode', 'viewport');
  await expect(board).not.toBeInViewport();
  expect(loads).toBe(1);
  await board.scrollIntoViewIfNeeded();
  await expect(loaded).toHaveCount(1);
  expect(loads).toBe(2);

  await ready(page, 'comments/immediate/');
  await expect(board).toHaveAttribute('data-load-mode', 'immediate');
  await expect(board).not.toBeInViewport();
  await expect(loaded).toHaveCount(1);
  expect(loads).toBe(3);
});
