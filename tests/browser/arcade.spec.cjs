'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);

test('the three arcade games play in place with keyboard, pointer or touch', async ({ page, hasTouch }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.clock.install();
  await ready(page, 'game/');
  const arcade = page.locator('[data-arcade]');
  const status = arcade.locator('[data-status]');
  const score = arcade.locator('[data-score]');
  const cells = arcade.locator('[data-cell]');
  const undo = arcade.locator('[data-undo]');
  const reset = arcade.locator('[data-reset]');
  const activate = node => hasTouch ? node.tap() : node.click();
  const route = page.url();

  await expect(cells).toHaveCount(25);
  await noOverflow(page);
  await activate(cells.nth(20));
  await expect(score).toHaveText('第 1 关 · 路标 0/3 · 0 步');
  await expect(status).toBeEmpty();
  await cells.nth(4).focus();
  await page.keyboard.press('ArrowDown');
  await expect(cells.nth(9)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(score).toHaveText('第 1 关 · 路标 0/3 · 1 步');
  await activate(undo);
  await expect(score).toHaveText('第 1 关 · 路标 0/3 · 0 步');
  for (const index of [3, 2, 7, 12, 11, 10, 15, 20]) await activate(cells.nth(index));
  await expect(status).toHaveText('到达终点！');
  for (const [level, walls, path] of [
    [2, 4, [9, 8, 13, 12, 11, 16, 21, 20]],
    [3, 7, [5, 6, 7, 8, 13, 18, 17, 16, 15, 20]]
  ]) {
    await expect(reset).toHaveText('下一关');
    await activate(reset);
    await expect(score).toHaveText(`第 ${level} 关 · 路标 0/3 · 0 步`);
    await expect(arcade.locator('[data-look="trail-wall"]')).toHaveCount(walls);
    await activate(arcade.locator('[data-look="trail-wall"]').first());
    await expect(score).toHaveText(`第 ${level} 关 · 路标 0/3 · 0 步`);
    for (const index of path) await activate(cells.nth(index + 4 - 2 * (index % 5)));
    await expect(status).toHaveText('到达终点！');
  }
  await expect(reset).toHaveText('再玩一轮');

  await activate(arcade.locator('[data-game="garden"]'));
  await expect(cells).toHaveCount(16);
  await noOverflow(page);
  const before = await score.textContent();
  await activate(cells.nth(0));
  await expect(score).toHaveText(/1 步/);
  await activate(undo);
  await expect(score).toHaveText(before);
  for (let index = 0; index < 5; index++) await activate(cells.nth(index));
  await expect(status).toHaveText('满园开花！');
  for (const [level, moves] of [[2, 7], [3, 9]]) {
    await activate(reset);
    await expect(score).toHaveText(new RegExp(`^第 ${level} 关`));
    for (let index = 0; index < moves; index++) await activate(cells.nth(index));
    await expect(status).toHaveText('满园开花！');
  }
  await expect(reset).toHaveText('再玩一轮');

  await activate(arcade.locator('[data-game="firefly"]'));
  await activate(reset);
  await noOverflow(page);
  const target = arcade.locator('[data-look="firefly-hit"]');
  const decoy = arcade.locator('[data-look="firefly-decoy"]');
  for (let count = 0; count < 5; count++) await activate(target);
  await expect(score).toHaveText(/6 分/);
  await expect(status).toHaveText('连击加分！');
  await activate(decoy);
  await expect(score).toHaveText(/5 分/);
  for (let count = 0; count < 5; count++) await activate(target);
  await expect(decoy).toHaveCount(2);
  await page.clock.fastForward(21000);
  await expect(status).toHaveText('新纪录！');
  await expect(score).toHaveText('0 秒 · 11 分 · 最佳 11');
  await page.reload();
  await activate(arcade.locator('[data-game="firefly"]'));
  await expect(score).toHaveText(/最佳 11$/);
  expect(page.url()).toBe(route);
});

test('switching games keeps both puzzles and freezes the sprint until it resumes', async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.clock.install();
  await ready(page, 'game/');
  const arcade = page.locator('[data-arcade]');
  const cells = arcade.locator('[data-cell]');
  const score = arcade.locator('[data-score]');
  const timer = arcade.locator('[data-timer]');
  const reset = arcade.locator('[data-reset]');
  const switchTo = game => arcade.locator(`[data-game="${game}"]`).click();

  await expect(arcade.locator('[data-next], [data-preview], [data-changed]')).toHaveCount(0);
  await cells.nth(3).click();
  await switchTo('garden');
  const initialGarden = await cells.allTextContents();
  await reset.focus();
  await page.keyboard.press('Tab');
  await expect(cells.nth(0)).toBeFocused();
  await page.keyboard.press('Enter');
  const playedGarden = await cells.allTextContents();
  expect(playedGarden).not.toEqual(initialGarden);
  const gardenScore = await score.textContent();
  await switchTo('trail');
  await expect(score).toHaveText('第 1 关 · 路标 0/3 · 1 步');
  await expect(cells.nth(3)).toHaveAttribute('data-look', 'trail-head');
  await switchTo('garden');
  await expect(score).toHaveText(gardenScore);
  expect(await cells.allTextContents()).toEqual(playedGarden);
  await reset.click();
  expect(await cells.allTextContents()).toEqual(initialGarden);

  await switchTo('firefly');
  await reset.click();
  await arcade.locator('[data-look="firefly-hit"]').click();
  await page.clock.fastForward(4000);
  await arcade.locator('[data-pause]').click();
  await expect(reset).toHaveText('继续挑战');
  await reset.click();
  await switchTo('trail');
  await page.clock.fastForward(30000);
  await switchTo('firefly');
  await expect(reset).toHaveText('继续挑战');
  await expect(score).toHaveText(/\d+ 秒 · 1 分 · 最佳 0/);
  const remaining = Number(await timer.getAttribute('value'));
  expect(remaining).toBeGreaterThan(0);
  expect(remaining).toBeLessThan(20);
  await expect(arcade.locator('[data-look="firefly-hit"]')).toHaveCount(0);
  await reset.click();
  await expect(arcade.locator('[data-look="firefly-hit"]')).toHaveCount(1);
  await page.clock.fastForward(21000);
  await expect(score).toHaveText('0 秒 · 1 分 · 最佳 1');
});
