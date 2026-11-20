'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);
test.use({ reducedMotion: 'no-preference' });

test('random articles rotate in view, pause for interaction and respect reduced motion', async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => {
    const animate = Element.prototype.animate;
    window.discoverySlides = [];
    Element.prototype.animate = function (keyframes, options) {
      if (this.matches('.random-result')) window.discoverySlides.push(keyframes.map(frame => frame.transform));
      return animate.call(this, keyframes, options);
    };
  });
  await ready(page);
  const card = page.locator('[data-random]');
  const link = card.locator('[data-random-link]');
  const playback = card.locator('[data-random-autoplay]');
  const manual = card.locator('[data-random-refresh]');
  await page.locator('.site-footer').scrollIntoViewIfNeeded();
  await expect(card).not.toBeInViewport();
  const initial = await link.getAttribute('href');
  await page.clock.fastForward(8000);
  await expect(link).toHaveAttribute('href', initial);

  await card.scrollIntoViewIfNeeded();
  await expect(card).toBeInViewport({ ratio: .35 });
  await page.mouse.move(1, 1);
  await page.clock.runFor(160);
  const initialHeight = (await card.boundingBox()).height;
  await page.clock.fastForward(8000);
  await expect(link).not.toHaveAttribute('href', initial);
  expect(await page.evaluate(() => window.discoverySlides)).toEqual([
    ['translateX(0)', 'translateX(-100%)'], ['translateX(100%)', 'translateX(0)']
  ]);
  expect((await card.boundingBox()).height).toBeCloseTo(initialHeight, 1);

  if (await page.evaluate(() => matchMedia('(hover: hover)').matches)) {
    await card.hover();
    const hovered = await link.getAttribute('href');
    await page.clock.fastForward(8000);
    await expect(link).toHaveAttribute('href', hovered);
    await page.mouse.move(1, 1);
  }

  await playback.press('Enter');
  await expect(playback).toHaveText('继续轮播');
  await playback.evaluate(button => button.blur());
  const paused = await link.getAttribute('href');
  await page.clock.fastForward(8000);
  await expect(link).toHaveAttribute('href', paused);
  await playback.press('Enter');
  await expect(playback).toHaveText('暂停轮播');
  await page.clock.fastForward(8000);
  await expect(link).toHaveAttribute('href', paused);
  await playback.evaluate(button => button.blur());
  await page.clock.fastForward(8000);
  await expect(link).not.toHaveAttribute('href', paused);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(playback).toBeHidden();
  const stopped = await link.getAttribute('href');
  await page.clock.fastForward(8000);
  await expect(link).toHaveAttribute('href', stopped);
  await manual.press('Enter');
  await expect(link).not.toHaveAttribute('href', stopped);
  await expect(card.locator('.random-result--outgoing')).toHaveCount(0);
  await noOverflow(page);
});
