'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);

test('cinema watchlist filters saved titles, survives reload and supports removal', async ({ page }) => {
  await ready(page, 'cinema/');
  const saved = page.locator('[data-cinema-filter="watchlist"]');
  const cards = page.locator('[data-cinema-card]:visible');
  const empty = page.locator('[data-cinema-no-results]');
  await saved.click();
  await expect(empty).toContainText('想看片单还是空的');
  await page.locator('[data-cinema-filter="all"]').click();

  const star = page.getByRole('button', { name: '想看：花朵 · 播放示例' });
  await star.click();
  await expect(star).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-cinema-stage]')).toBeHidden();

  await page.reload({ waitUntil: 'load' });
  await expect(star).toHaveAttribute('aria-pressed', 'true');
  await expect(saved).toHaveText('想看 1');
  await saved.click();
  await expect(cards).toHaveCount(1);
  const search = page.getByRole('searchbox', { name: '搜索片名' });
  await search.fill('动漫');
  await expect(cards).toHaveCount(0);
  await expect(empty).toContainText('没有找到符合条件的作品');
  await search.clear();
  await noOverflow(page);

  await star.click();
  await expect(saved).toBeFocused();
  await expect(empty).toContainText('想看片单还是空的');
  await page.reload({ waitUntil: 'load' });
  await expect(star).toHaveAttribute('aria-pressed', 'false');
  await expect(saved).toHaveText('想看 0');
});

test('cinema recommendation opens a static detail and fetches video only after play', async ({ page, viewport }, info) => {
  const requests = [];
  page.on('request', request => {
    if (request.url().includes('/cc0-videos/flower.mp4')) requests.push(request.url());
  });
  await ready(page, 'cinema/');
  const feature = page.locator('.cinema-feature');
  await expect(feature).toContainText('花朵 · 播放示例');
  await expect(feature).toContainText('想在忙碌中停一下');
  if (viewport.width <= 650) {
    const posters = await page.locator('[data-cinema-card] .cinema-poster').evaluateAll(elements =>
      elements.map(element => { const { x, y, width, height } = element.getBoundingClientRect(); return { x, y, width, height }; }));
    expect(posters[1].x).toBeGreaterThan(posters[0].x);
    expect(posters[1].y).toBe(posters[0].y);
    expect(posters[2].y).toBeGreaterThan(posters[0].y);
    expect(posters[0].width / posters[0].height).toBeCloseTo(2 / 3, 2);
    await noOverflow(page);
    await page.screenshot({ path: info.outputPath('cinema-mobile-home.png'), animations: 'disabled' });
  }
  await page.getByRole('button', { name: '想看：花朵 · 播放示例' }).click();
  await feature.getByRole('link', { name: '看推荐与详情' }).click();
  await expect(page).toHaveURL(/\/cinema\/detail\/flower\/$/);
  await expect(page.locator('.cinema-detail')).toContainText('为什么推荐');
  await expect(page.getByRole('link', { name: '在 MDN 查看示例' })).toBeVisible();
  await expect(page.getByRole('button', { name: '想看：花朵 · 播放示例' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.cinema iframe')).toHaveCount(0);
  expect(requests).toEqual([]);
  await noOverflow(page);
  if (viewport.width <= 650) await page.screenshot({ path: info.outputPath('cinema-mobile-detail.png'), animations: 'disabled' });

  await page.getByRole('button', { name: '播放预告片' }).click();
  const player = page.locator('[data-cinema-video]');
  await expect(player).toHaveAttribute('src', /\/flower\.mp4$/);
  await page.getByRole('button', { name: '关闭播放器' }).click();
  await expect(player).not.toHaveAttribute('src');
  await expect(page.getByRole('button', { name: '播放预告片' })).toBeFocused();
  await page.getByRole('button', { name: '查看片源' }).click();
  await expect(page.getByRole('group', { name: '花朵 · 播放示例 选集' }).getByRole('button', { name: '播放', exact: true })).toBeVisible();
});

test('Bilibili episode loads the official iframe on selection and exposes the original link', async ({ page }) => {
  const playerRequests = [];
  await page.route('https://player.bilibili.com/player.html?*', route => {
    playerRequests.push(route.request().url());
    return route.fulfill({ status: 403, body: 'Unavailable in the test player' });
  });
  await ready(page, 'cinema/detail/my-three-body/');
  const fallback = page.getByRole('link', { name: '去 B 站观看' });
  await expect(page.locator('.cinema iframe')).toHaveCount(0);
  await expect(fallback).toBeHidden();
  await page.getByRole('button', { name: '查看片源' }).click();
  expect(playerRequests).toEqual([]);
  await page.getByRole('button', { name: '第 1 集', exact: true }).click();
  const player = page.locator('.cinema iframe');
  await expect(player).toHaveAttribute('src', 'https://player.bilibili.com/player.html?episodeId=30636&autoplay=1');
  await expect.poll(() => playerRequests.length).toBe(1);
  await expect(fallback).toBeVisible();
  await expect(fallback).toHaveAttribute('href', 'https://www.bilibili.com/bangumi/play/ep30636');
  await page.getByRole('button', { name: '关闭播放器' }).click();
  await expect(player).toHaveCount(0);
  await expect(fallback).toBeHidden();
});
