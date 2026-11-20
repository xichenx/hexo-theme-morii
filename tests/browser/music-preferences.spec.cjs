'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready } = require('./helpers.cjs');
installHooks(test);

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
