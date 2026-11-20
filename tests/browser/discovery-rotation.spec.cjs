'use strict';
const { test, expect } = require('@playwright/test');
const { prefix } = require('../../tools/lib/browser-fixture.cjs');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);
test.use({ reducedMotion: 'no-preference' });

test('discovery card controls fit mobile widths and moment paging stays usable', async ({ page, viewport }, info) => {
  await ready(page);
  const discovery = page.locator('.home-discovery');
  const moments = discovery.locator('[data-moments]');
  const random = discovery.locator('[data-random]');
  const previous = moments.getByRole('button', { name: '上一条即刻' });
  const next = moments.getByRole('button', { name: '下一条即刻' });
  const date = moments.locator('.moment-item:visible time');
  const refresh = random.locator('[data-random-refresh]');
  const count = moments.locator('[data-moment-count]');

  await next.click();
  await expect(count).toHaveText('2 / 2');
  await expect(moments.locator('.moment-item:visible')).toContainText('September note');
  await previous.click();
  await expect(count).toHaveText('1 / 2');
  await expect(moments.locator('.moment-item:visible')).toContainText('October note');
  await expect(random.getByRole('button')).toHaveCount(1);

  if (viewport.width <= 580) {
    await expect(discovery).toHaveCSS('row-gap', '12px');
    for (const width of [viewport.width, 320]) {
      await page.setViewportSize({ width, height: viewport.height });
      for (const control of [previous, next, refresh]) {
        expect((await control.boundingBox()).height).toBeGreaterThanOrEqual(44);
      }
      const dateBox = await date.boundingBox();
      const previousBox = await previous.boundingBox();
      expect(dateBox.x + dateBox.width).toBeLessThan(previousBox.x);
      await expect.poll(async () => {
        const time = await date.boundingBox();
        const button = await previous.boundingBox();
        return Math.abs(time.y + time.height / 2 - button.y - button.height / 2);
      }).toBeLessThan(1);
      await expect(page.locator('#back-to-top')).toBeVisible();
      const backToTop = await page.locator('#back-to-top').boundingBox();
      for (const control of [next, refresh]) {
        const box = await control.boundingBox();
        expect(box.x + box.width).toBeLessThan(backToTop.x);
      }
      await noOverflow(page);
    }
    await page.setViewportSize(viewport);
  }
  const preview = info.outputPath('home-discovery.png');
  await discovery.screenshot({ path: preview, animations: 'disabled' });
  await info.attach('homepage discovery', { path: preview, contentType: 'image/png' });
});

test('random articles rotate in view, pause for interaction and respect reduced motion', async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => {
    const animate = Element.prototype.animate;
    window.discoverySlides = [];
    Element.prototype.animate = function (keyframes, options) {
      if (this.matches('.random-result')) window.discoverySlides.push({
        frames: keyframes.map(({ transform, opacity }) => [transform, opacity]),
        total: options.duration + (options.delay || 0)
      });
      return animate.call(this, keyframes, options);
    };
  });
  await ready(page);
  const card = page.locator('[data-random]');
  const link = card.locator('[data-random-link]');
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
    { frames: [['translateX(0)', 1], ['translateX(-14px)', 0]], total: 140 },
    { frames: [['translateX(18px)', 0], ['translateX(0)', 1]], total: 300 }
  ]);
  expect((await card.boundingBox()).height).toBeCloseTo(initialHeight, 1);

  if (await page.evaluate(() => matchMedia('(hover: hover)').matches)) {
    await card.hover();
    const hovered = await link.getAttribute('href');
    await page.clock.fastForward(8000);
    await expect(link).toHaveAttribute('href', hovered);
    await page.mouse.move(1, 1);
  }

  await manual.focus();
  const paused = await link.getAttribute('href');
  await page.clock.fastForward(8000);
  await expect(link).toHaveAttribute('href', paused);
  await manual.evaluate(button => button.blur());
  await page.clock.runFor(100);
  await page.clock.fastForward(8000);
  await expect(link).not.toHaveAttribute('href', paused);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const stopped = await link.getAttribute('href');
  await page.clock.fastForward(8000);
  await expect(link).toHaveAttribute('href', stopped);
  await manual.press('Enter');
  await expect(link).not.toHaveAttribute('href', stopped);
  await expect(card.locator('.random-result--outgoing')).toHaveCount(0);
  await noOverflow(page);
});

test('turning autoplay off keeps manual article rotation', async ({ page }) => {
  await page.clock.install();
  await page.route(url => url.pathname === prefix, async route => {
    const response = await route.fetch();
    const body = (await response.text()).replace('data-random-autoplay="on"', 'data-random-autoplay="off"');
    await route.fulfill({ response, body });
  });
  await ready(page);
  const card = page.locator('[data-random]');
  const link = card.locator('[data-random-link]');
  await expect(card).toHaveAttribute('data-random-autoplay', 'off');
  await card.scrollIntoViewIfNeeded();
  await expect(card).toBeInViewport({ ratio: .35 });
  await page.mouse.move(1, 1);
  const initial = await link.getAttribute('href');
  await page.clock.runFor(160);
  await page.clock.fastForward(8000);
  await expect(link).toHaveAttribute('href', initial);
  await card.locator('[data-random-refresh]').click();
  await expect(link).not.toHaveAttribute('href', initial);
  await expect(card.locator('.random-result--outgoing')).toHaveCount(0);
});
