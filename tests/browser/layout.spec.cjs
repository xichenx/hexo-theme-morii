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
for (const route of ['', 'archives/', 'categories/', 'about/', 'album/', 'music/', 'cinema/', 'game/', 'series/', 'posts/layout-stress/']) {
  test(`page fits viewport: ${route || 'home'}`, async ({ page, colorScheme }) => {
    await ready(page, route);
    await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme);
    await noOverflow(page);
  });
}

test('mobile backgrounds reach the viewport edges while controls respect safe areas', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Safe-area regression is exercised on mobile Chromium and WebKit.');
  for (const { width, height, top, right, bottom, left } of [
    { width: 390, height: 844, top: 54, right: 0, bottom: 34, left: 0 },
    { width: 844, height: 390, top: 0, right: 21, bottom: 21, left: 54 }
  ]) {
    await page.setViewportSize({ width, height });
    for (const [route, backdrop, intro] of [
      ['posts/layout-stress/', '.post-hero', '.post-hero-inner'],
      ['posts/welcome/', '.post-hero', '.post-hero-inner'],
      ['music/', '.music-room', '.music-room-top']
    ]) {
      await ready(page, route);
      await expect(page.locator('meta[name=viewport]')).toHaveAttribute('content', /viewport-fit=cover/);
      // Browser emulation does not supply hardware cutouts. Inject asymmetric insets to exercise the layout.
      await page.locator('html').evaluate((root, insets) => {
        for (const [side, pixels] of Object.entries(insets)) root.style.setProperty('--safe-' + side, pixels + 'px');
      }, { top, right, bottom, left });

      const header = await page.locator('.site-header').boundingBox();
      const controls = await page.locator('.site-header__inner').boundingBox();
      const stage = await page.locator(backdrop).boundingBox();
      expect(header.x).toBe(0);
      expect(header.width).toBe(width);
      expect(controls.x).toBeGreaterThanOrEqual(left);
      expect(controls.y).toBe(top);
      expect(controls.x + controls.width).toBeLessThanOrEqual(width - right);
      expect(stage.x).toBe(0);
      expect(stage.y).toBe(0);
      expect(stage.width).toBe(width);
      const heading = await page.locator(intro).boundingBox();
      expect(heading.x).toBeGreaterThanOrEqual(left);
      expect(heading.y).toBeGreaterThanOrEqual(header.y + header.height);
      expect(heading.x + heading.width).toBeLessThanOrEqual(width - right);
      await expect(page.locator('#back-to-top')).toHaveCSS('bottom', (24 + bottom) + 'px');

      await page.locator('#menu-toggle').click();
      await expect(page.locator('#site-nav')).toBeVisible();
      await page.locator('#menu-toggle').click();
      for (const [opener, dialog] of [['#search-open', '#search-dialog'], ['#navigation-open', '#navigation-dialog']]) {
        await page.locator(opener).click();
        const bounds = await page.locator(dialog).boundingBox();
        expect(bounds.x).toBeGreaterThanOrEqual(left - 1);
        expect(bounds.y).toBeGreaterThanOrEqual(top - 1);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width - right + 1);
        expect(bounds.y + bounds.height).toBeLessThanOrEqual(height - bottom + 1);
        await page.keyboard.press('Escape');
        await expect(page.locator(dialog)).not.toBeVisible();
      }
      await noOverflow(page);
    }
  }
});

test('desktop scroll boundaries keep the homepage header anchored', async ({ page, isMobile }) => {
  await ready(page);
  const root = page.locator('html');
  const header = page.locator('.site-header');
  await expect(root).toHaveCSS('overscroll-behavior-x', 'auto');
  await expect(root).toHaveCSS('overscroll-behavior-y', isMobile ? 'auto' : 'none');
  const headerTop = () => header.evaluate(element => element.getBoundingClientRect().top);
  expect(await headerTop()).toBeCloseTo(0, 0);

  await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(400);
  expect(await headerTop()).toBeCloseTo(0, 0);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  if (!isMobile) {
    await page.mouse.move(180, 210);
    await page.mouse.wheel(0, -350);
  }
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  expect(await headerTop()).toBeCloseTo(0, 0);
});

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

test('long post section search filters titles and jumps to the selected heading', async ({ page, viewport }) => {
  await ready(page, 'posts/welcome/');
  await expect(page.locator('[data-toc-filter]:not([hidden])')).toHaveCount(0);
  await ready(page, 'posts/layout-stress/');
  const mobile = viewport.width <= 960;
  if (mobile) await page.locator('[data-reading-toc]').click();
  const outline = page.locator(mobile ? '#reading-toc-dialog' : '.reading-aside .toc-card');
  const query = outline.getByRole('searchbox');
  const links = outline.locator('.toc-content a:visible');
  await expect(links).toHaveCount(37);
  await query.fill('没有这个章节');
  await expect(links).toHaveCount(0);
  await expect(outline.getByRole('status')).toHaveText('没有匹配的章节');
  await query.fill('１３. 实践记录');
  await expect(links).toHaveCount(1);
  await expect(outline.getByRole('status')).toBeHidden();
  await query.clear();
  await expect(links).toHaveCount(37);
  await query.fill('１３. 实践记录');
  const hash = await links.first().getAttribute('href');
  await query.press('ArrowDown');
  await expect(links.first()).toBeFocused();
  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => location.hash)).toBe(hash);
  if (mobile) {
    await expect(outline).not.toBeVisible();
    await expect(page.locator('[data-reading-toc]')).toBeFocused();
  }
  await noOverflow(page);
});
