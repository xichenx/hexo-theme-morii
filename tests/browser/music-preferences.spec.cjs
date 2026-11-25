'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready } = require('./helpers.cjs');
const { prefix } = require('../../tools/lib/browser-fixture.cjs');
installHooks(test);

test('ordinary pages load music only on opening quick navigation and can retry a failed request', async ({ page }) => {
  let scripts = 0;
  let playlists = 0;
  await page.route(/\/js\/music\.[a-f0-9]+\.js$/, route => ++scripts === 1 ? route.abort() : route.continue());
  await page.route('https://music.example.test/playlist', route => {
    playlists++;
    return route.fulfill({ headers: { 'access-control-allow-origin': '*' }, json: [{ title: '测试曲目', url: 'https://music.example.test/track.mp3' }] });
  });
  await ready(page);
  expect(scripts).toBe(0);
  await expect(page.locator('link[href*="/css/music."]')).toHaveCount(0);
  await page.locator('#navigation-open').click();
  const control = page.locator('[data-control-music]');
  await expect(control).toHaveText('重试');
  await control.click();
  await expect(control).toBeEnabled();
  await expect(control).toHaveText('播放音乐');
  await expect(page.locator('link[href*="/css/music."]')).toHaveCount(1);
  expect(playlists).toBe(0);
  await control.click();
  await expect(page.locator('[data-control-track]')).toHaveText('测试曲目');
  expect(playlists).toBe(1);
  await page.keyboard.press('Escape');
  await page.locator('#navigation-open').click();
  await expect(page.locator('[data-control-track]')).toHaveText('测试曲目');
  expect(scripts).toBe(2);
});

test('music room remembers muted volume and playback mode after reloading', async ({ page }) => {
  await ready(page, 'music/');
  const mode = page.locator('#music-mode');
  const volume = page.locator('.music-volume');
  await expect(mode).toHaveAccessibleName('播放模式：顺序播放');
  await mode.click();
  await volume.press('Home');
  await expect(volume).toHaveValue('0');

  await page.reload({ waitUntil: 'load' });
  await expect(mode).toHaveAccessibleName('播放模式：列表循环');
  await expect(volume).toHaveValue('0');
  await expect(page.locator('#music-player')).toHaveJSProperty('paused', true);
});

test('invalid audio exposes recovery and valid audio switches the vector play icon', async ({ page, isMobile, viewport }) => {
  await page.route('https://music.example.test/playlist', route => route.fulfill({
    headers: { 'access-control-allow-origin': '*' },
    json: [
      { title: '空音频', url: prefix + 'test-audio/empty.wav' },
      { title: '有效音频', url: prefix + 'test-audio/valid.wav' }
    ]
  }));
  await ready(page, 'music/');
  const play = page.locator('#music-toggle');
  await expect(play).toBeEnabled();
  await play.click();
  const retry = page.getByRole('button', { name: '重试音频' });
  await expect(retry).toBeVisible({ timeout: 14000 });
  await expect(play).toHaveAccessibleName('播放');
  await expect(play.locator('.music-icon-pause')).toBeHidden();
  await page.locator('#music-next').click();
  await expect(retry).toBeHidden();
  await expect(play).toHaveAccessibleName('暂停');
  await expect(play.locator('.music-icon-pause')).toBeVisible();
  await play.click();
  if (isMobile) {
    await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(37, 42, 64)');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(37, 42, 64)');
    await expect(page.locator('.site-header')).toHaveCSS('background-color', 'rgb(37, 42, 64)');
    expect((await page.locator('.music-room').boundingBox()).height).toBeGreaterThanOrEqual(viewport.height);
  }
});
