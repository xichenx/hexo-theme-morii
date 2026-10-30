'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);

async function clockBounds(page, selector = '.reading-aside .weather-clock') {
  return page.locator(selector).evaluate(card => {
    const rect = card.getBoundingClientRect();
    const credit = card.querySelector('.weather-clock__credit').getBoundingClientRect();
    const digits = [...card.querySelectorAll('.weather-clock__time > span')].map(e => e.getBoundingClientRect());
    const panel = card.closest('.reading-aside-sticky');
    const panelRect = panel?.getBoundingClientRect();
    const parentClips = panel && getComputedStyle(panel).overflowY !== 'visible' && (rect.top < panelRect.top - 1 || rect.bottom > panelRect.bottom + 1);
    return {
      clipped: card.scrollHeight > card.clientHeight + 1 || credit.bottom > rect.bottom + 1 || !!parentClips,
      digitsOverflow: digits.some(d => d.left < rect.left || d.right > rect.right),
      visible: rect.top >= 76 && rect.bottom <= innerHeight + 1,
      height: rect.height,
      creditBottom: credit.bottom, bottom: rect.bottom
    };
  });
}
for (const route of ['', 'archives/', 'categories/', 'about/', 'album/', 'music/', 'cinema/', 'series/', 'posts/layout-stress/']) {
  test(`page fits viewport: ${route || 'home'}`, async ({ page, colorScheme }) => {
    await ready(page, route);
    await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme);
    await noOverflow(page);
  });
}

test('long article keeps a complete clock while the outline scrolls', async ({ page, viewport }) => {
  test.skip(viewport.width <= 960, 'Mobile article uses the TOC dialog instead of the sidebar.');
  await ready(page, 'posts/layout-stress/');
  await page.locator('.article-body h2').nth(12).scrollIntoViewIfNeeded();
  await expect.poll(async () => (await clockBounds(page)).clipped).toBe(false);
  await expect.poll(async () => (await clockBounds(page)).digitsOverflow).toBe(false);
  const toc = page.locator('.reading-aside .toc-content');
  expect(await toc.evaluate(e => e.scrollHeight > e.clientHeight)).toBe(true);
  if (viewport.height > 560) {
    await expect.poll(async () => (await clockBounds(page)).visible).toBe(true);
    const before = await toc.evaluate(e => e.scrollTop);
    const windowY = await page.evaluate(() => scrollY);
    await toc.hover(); await page.mouse.wheel(0, 100);
    await expect.poll(() => toc.evaluate(e => e.scrollTop)).toBeGreaterThan(before);
    expect(await page.evaluate(() => scrollY)).toBeCloseTo(windowY, 0);
    expect((await clockBounds(page)).clipped).toBe(false);
  } else {
    await expect(page.locator('.reading-aside-sticky')).toHaveCSS('position', 'static');
    await expect(page.locator('.reading-aside-sticky')).toHaveCSS('overflow-y', 'visible');
  }
});

test('layout checks detect the original grid squeeze regression', async ({ page, viewport }) => {
  test.skip(viewport.width <= 960, 'The regression affects the desktop article sidebar.');
  await ready(page, 'posts/layout-stress/');
  await page.locator('.article-body h2').nth(12).scrollIntoViewIfNeeded();
  const oldStyle = await page.addStyleTag({ content: '.reading-aside-sticky{display:grid!important;position:sticky!important;max-height:calc(100dvh - 120px)!important;overflow:auto!important}.toc-card{display:block!important;min-height:auto!important}.toc-card>nav{display:block!important}.toc-card .toc-content{min-height:50dvh!important}.weather-clock{overflow:hidden!important;flex-shrink:1!important}' });
  await expect.poll(async () => (await clockBounds(page)).clipped, 'The detector must catch the historical bug').toBe(true);
  await oldStyle.evaluate(e => e.remove());
  await expect.poll(async () => (await clockBounds(page)).clipped).toBe(false);
});

test('weather card stays readable on the homepage and can refresh', async ({ page }) => {
  await ready(page);
  const card = page.locator('.sidebar .weather-clock');
  await card.scrollIntoViewIfNeeded();
  await expect(card.locator('[data-weather-temperature]')).toHaveText('23');
  await card.locator('[data-weather-refresh]').click();
  await expect(card.locator('[data-weather-refresh]')).toBeEnabled();
  expect((await clockBounds(page, '.sidebar .weather-clock')).clipped).toBe(false);
  expect((await clockBounds(page, '.sidebar .weather-clock')).digitsOverflow).toBe(false);
});

test('search, navigation and mobile TOC dialogs stay inside the viewport', async ({ page, viewport }) => {
  await ready(page, 'posts/layout-stress/');
  for (const [opener, selector] of [['#search-open', '#search-dialog'], ['#navigation-open', '#navigation-dialog']]) {
    await page.locator(opener).click();
    const dialog = page.locator(selector);
    await expect(dialog).toBeVisible();
    const bounds = await dialog.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(-1); expect(bounds.y).toBeGreaterThanOrEqual(-1);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height + 1);
    await page.keyboard.press('Escape'); await expect(dialog).not.toBeVisible();
  }
  if (viewport.width <= 960) {
    await page.locator('[data-reading-toc]').click();
    await expect(page.locator('#reading-toc-dialog')).toBeVisible();
    await page.locator('#reading-toc-dialog .toc-content a').nth(12).click();
    await expect(page.locator('#reading-toc-dialog')).not.toBeVisible();
    await noOverflow(page);
  }
});
