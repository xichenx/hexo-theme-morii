'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);

test('album thumbnails select any photo and stay in sync with keyboard navigation', async ({ page }) => {
  await ready(page, 'album/morii/');
  const photos = page.locator('[data-gallery] .photo-card');
  const photo = photos.first().locator('img');
  if (await photo.getAttribute('srcset')) {
    await expect(photo).toHaveJSProperty('complete', true);
    expect(await photo.evaluate(image => image.currentSrc)).toMatch(/\/images\/morii\/[\da-f]+-\d+\.webp$/);
  }
  const viewer = page.locator('#image-dialog');
  const thumbnails = viewer.getByRole('group', { name: '相册缩略图' });
  await photos.first().click();
  await expect(viewer.locator('#image-original')).toHaveAttribute('href', /\/icons\/brand\/morii-logo-v2\.png$/);
  await expect(thumbnails.getByRole('button')).toHaveCount(2);
  const first = thumbnails.getByRole('button', { name: /^查看第 1 张/ });
  const second = thumbnails.getByRole('button', { name: /^查看第 2 张/ });
  await expect(first).toHaveAttribute('aria-current', 'true');
  await second.click();
  await expect(viewer.locator('#image-counter')).toHaveText('2 / 2');
  await expect(second).toHaveAttribute('aria-current', 'true');
  await expect(second).toHaveAttribute('tabindex', '0');
  await expect(viewer).toHaveAttribute('data-image-state', 'ready');
  await second.press('ArrowLeft');
  await expect(viewer.locator('#image-counter')).toHaveText('1 / 2');
  await expect(first).toBeFocused();
  await noOverflow(page);
  await viewer.locator('#image-close').click();
  await expect(viewer).not.toBeVisible();
  await expect(thumbnails.getByRole('button')).toHaveCount(0);
  await photos.last().click();
  await expect(second).toHaveAttribute('aria-current', 'true');
});

test('album photos keep their layout when an image fails and let readers retry in the viewer', async ({ page }) => {
  await ready(page, 'album/morii/');
  const card = page.locator('.photo-card').first();
  const placeholder = card.locator('.image-placeholder');
  const frames = () => page.locator('.photo-card__media').evaluateAll(items => items.map(frame => {
    const { x, y, width, height } = frame.getBoundingClientRect();
    return { x, y, width, height };
  }));
  const before = await frames();
  expect(before[0].width / before[0].height).toBeCloseTo(4 / 3, 2);
  expect(before[1].width / before[1].height).toBeCloseTo(1, 2);

  let available = false;
  await page.route('**/album-retry.svg', route => route.fulfill(available ? {
    contentType: 'image/svg+xml',
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="160"><rect width="100" height="160" fill="blue"/></svg>'
  } : { status: 404, headers: { 'cache-control': 'no-store' } }));
  await card.evaluate(link => {
    link.href = new URL('album-retry.svg', location.href);
    const img = link.querySelector('img');
    img.removeAttribute('srcset');
    img.src = link.href;
  });
  await expect(placeholder).toBeVisible();
  expect(await frames()).toEqual(before);
  await noOverflow(page);

  await placeholder.click();
  const viewer = page.locator('#image-dialog');
  await expect(viewer).toHaveAttribute('data-image-state', 'error');
  available = true;
  await viewer.locator('#image-retry').click();
  await expect(viewer).toHaveAttribute('data-image-state', 'ready');
});
