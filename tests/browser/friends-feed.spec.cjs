'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);

test('friends feed can revisit cached pages, retry failures, and stay on the last nonempty page', async ({ context, page }) => {
  const requests = [];
  const post = index => ({ title: 'Friend post ' + index, link: 'https://blog.example.test/post/' + index });
  const firstPage = [post(1), post(2)];
  const secondPage = [post(3), post(4)];
  let attemptedSecondPage = false;
  await context.route('https://feed.example.test/**', route => {
    const { searchParams } = new URL(route.request().url());
    expect(searchParams.get('source')).toBe('fixture');
    const start = Number(searchParams.get('start'));
    expect(Number(searchParams.get('end'))).toBe(start + 2);
    requests.push(start);
    if (start === 2 && !attemptedSecondPage) {
      attemptedSecondPage = true;
      return route.fulfill({ status: 503 });
    }
    return route.fulfill({
      headers: { 'access-control-allow-origin': '*' },
      json: { article_data: start === 0 ? firstPage : start === 2 ? secondPage : [] }
    });
  });
  await ready(page, 'fcircle/');
  const list = page.locator('#feed-grid .feed-card h3');
  const previous = page.locator('#feed-prev');
  const next = page.locator('#feed-more');
  const retry = page.locator('#feed-retry');
  const position = page.locator('#feed-page');
  await expect(list).toHaveText(['Friend post 1', 'Friend post 2']);
  await expect(previous).toBeDisabled();
  await next.click();
  await expect(retry).toBeVisible();
  await expect(list).toHaveText(['Friend post 1', 'Friend post 2']);
  await retry.click();
  await expect(list).toHaveText(['Friend post 3', 'Friend post 4']);
  await expect(position).toHaveText('第 2 页');
  await expect(page.locator('#feed-heading')).toBeFocused();
  await previous.click();
  await expect(list).toHaveText(['Friend post 1', 'Friend post 2']);
  await next.click();
  await expect(list).toHaveText(['Friend post 3', 'Friend post 4']);
  expect(requests).toEqual([0, 2, 2]);
  await next.click();
  await expect(page.locator('.feed-status')).toContainText('已经到底了');
  await expect(list).toHaveText(['Friend post 3', 'Friend post 4']);
  await expect(position).toHaveText('第 2 页');
  await expect(next).toBeDisabled();
  expect(requests).toEqual([0, 2, 2, 4]);
  await noOverflow(page);
});
