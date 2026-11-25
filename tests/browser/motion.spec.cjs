'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
const { prefix } = require('../../tools/lib/browser-fixture.cjs');
let sharp;
try { sharp = require('sharp'); } catch { /* Pixel checks require the optional image dependency. */ }
installHooks(test);
test.use({ reducedMotion: 'no-preference' });

test('layered entrances finish cleanly and navigation remains interactive', async ({ page, viewport }, info) => {
  await ready(page);
  const hero = page.locator('.hero__main');
  const desktop = await page.evaluate(() => matchMedia('(min-width: 801px) and (hover: hover) and (pointer: fine)').matches);
  if (desktop) await expect.poll(() => hero.evaluate(e => e.style.getPropertyValue('--morii-ambient-state'))).toBe('running');
  else await expect(hero).toHaveCSS('--morii-ambient-state', '');
  await expect.poll(() => hero.evaluate(e => e.getAnimations({ subtree: true }).filter(a => a.effect?.target instanceof Element && a.effect.target.closest('.hero__actions, h1, .eyebrow, p') && !a.animationName).length)).toBe(0);
  await expect(hero.locator('h1')).toHaveCSS('opacity', '1');
  const promo = page.getByRole('region', { name: 'Morii', exact: true });
  await expect(promo.getByRole('link', { name: '安装指南' })).toHaveAttribute('href', /hexo-theme-morii#quick-start$/);
  await expect(promo.getByRole('link', { name: 'GitHub 源码' })).toHaveAttribute('href', /hexo-theme-morii$/);
  const mainBox = await hero.boundingBox();
  const promoBox = await promo.boundingBox();
  if (viewport.width > 800) expect(promoBox.x).toBeGreaterThan(mainBox.x + mainBox.width);
  else expect(promoBox.y).toBeGreaterThan(mainBox.y + mainBox.height);
  await expect(page.locator('.hero-mini--quote, .hero-mini--stats')).toHaveCount(0);
  await noOverflow(page);
  if (viewport.width <= 580) {
    const heading = page.getByRole('heading', { name: '从这里开始' });
    const featureGrid = page.locator('.feature-grid');
    const featureCards = featureGrid.locator('.feature-card');
    await expect(featureGrid).toHaveCSS('row-gap', '8px');
    for (const width of [viewport.width, 320]) {
      await page.setViewportSize({ width, height: viewport.height });
      await expect.poll(async () => (await heading.boundingBox()).y).toBeLessThan(650);
      for (const link of await page.locator('.hero__actions a, .theme-promo__actions a').all()) {
        expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
      }
      for (const card of await featureCards.all()) {
        const bounds = await card.boundingBox();
        expect(bounds.height).toBeGreaterThanOrEqual(44);
        expect(bounds.height).toBeLessThan(85);
      }
      await noOverflow(page);
    }
    const firstCard = featureCards.first();
    const fitsLongText = await firstCard.evaluate(card => {
      const title = card.querySelector('strong');
      const description = card.querySelector('small');
      const previousTitle = title.textContent;
      const previousDescription = description.textContent;
      title.textContent = '一个需要在窄屏完整展示的自定义入口标题';
      description.textContent = 'A long description that should wrap without covering the icon or arrow. '.repeat(2);
      const bounds = card.getBoundingClientRect();
      const fits = [title, description].every(element => {
        const rect = element.getBoundingClientRect();
        return element.scrollWidth <= element.clientWidth + 1 && rect.bottom <= bounds.bottom;
      });
      title.textContent = previousTitle;
      description.textContent = previousDescription;
      return fits && bounds.height > 85;
    });
    expect(fitsLongText).toBe(true);
    await page.setViewportSize(viewport);
  }
  const preview = info.outputPath('home-depth.png');
  await page.screenshot({ path: preview, animations: 'disabled' });
  await info.attach('homepage depth', { path: preview, contentType: 'image/png' });
  // Safari does not focus buttons on pointer click; explicitly exercise keyboard return.
  await page.locator('#navigation-open').focus();
  await page.locator('#navigation-open').press('Enter');
  await expect(page.locator('#navigation-dialog')).toBeVisible();
  const cards = page.locator('.navigation-card');
  expect(await cards.count()).toBeGreaterThan(1);
  await expect(cards.nth(1)).toHaveCSS('animation-delay', '0.035s');
  await cards.first().focus();
  await expect(cards.first()).toHaveCSS('animation-name', 'none');
  await page.keyboard.press('Escape');
  await expect(page.locator('#navigation-open')).toBeFocused();
});

test('changing reduced motion cancels entrances and ambient movement', async ({ page }) => {
  await ready(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.locator('.hero__main').evaluate(e => e.style.getPropertyValue('--morii-ambient-state'))).toBe('paused');
  await expect.poll(() => page.locator('#main').evaluate(e => e.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length)).toBe(0);
  const feature = page.locator('.feature-card').first();
  await feature.focus();
  await expect(feature).toHaveCSS('translate', 'none');
  await page.locator('#navigation-open').click();
  await expect(page.locator('.navigation-card').first()).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.navigation-card').first()).toBeVisible();
});

test('the desktop Morii wordmark writes once and settles into the complete artwork', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Touch screens use a shorter ink animation.');
  let releaseMotion;
  const gate = new Promise(resolve => { releaseMotion = resolve; });
  await page.route(/\/js\/motion\.[a-f0-9]+\.js$/, async route => {
    await gate;
    await route.continue();
  });
  const promo = page.getByRole('region', { name: 'Morii', exact: true });
  const wordmark = promo.getByRole('heading', { name: 'Morii' });
  const lettering = wordmark.locator('.theme-promo__lettering');
  try {
    await page.goto(prefix, { waitUntil: 'commit' });
    await expect(page.locator('html')).toHaveAttribute('data-promo-ink', 'pending');
    await expect(wordmark).toHaveCSS('opacity', '1');
    await expect(lettering).toHaveCSS('mask-image', /morii-promo-ink/);
    await expect(promo).not.toHaveAttribute('data-writing', '');
  } finally {
    releaseMotion();
  }
  await expect(promo).toHaveAttribute('data-writing', '');
  await expect(wordmark).toHaveCSS('opacity', '1');
  await expect(lettering).toHaveCSS('mask-image', /morii-promo-ink/);
  await expect(promo.locator('[data-ink-end]')).toHaveCSS('animation-name', 'morii-ink-settle');
  await expect(promo).not.toHaveAttribute('data-writing', '');
  await expect(lettering).toHaveCSS('mask-image', 'none');
  await expect(page.locator('html')).not.toHaveAttribute('data-promo-ink');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'load' });
  await promo.scrollIntoViewIfNeeded();
  await expect(promo).not.toHaveAttribute('data-writing', '');
  await expect(lettering).toHaveCSS('mask-image', 'none');
});

test('mobile headline stays fixed while the wordmark writes with one mask', async ({ page, isMobile }, info) => {
  test.skip(!isMobile, 'Touch screens use a shorter ink animation.');
  let releaseMotion;
  const gate = new Promise(resolve => { releaseMotion = resolve; });
  const fonts = [];
  page.on('request', request => { if (request.resourceType() === 'font') fonts.push(request.url()); });
  await page.route(/\/js\/motion\.[a-f0-9]+\.js$/, async route => {
    await gate;
    await route.continue();
  });
  const hero = page.locator('.hero__main h1');
  const promo = page.locator('.theme-promo');
  const artwork = promo.locator('.theme-promo__art');
  const lettering = artwork.locator('.theme-promo__lettering');
  let before;
  try {
    await page.goto(prefix, { waitUntil: 'commit' });
    await expect(hero).toBeVisible();
    await expect(hero).toHaveCSS('opacity', '1');
    await expect(artwork).toHaveCSS('opacity', '1');
    await expect(lettering).toHaveCSS('fill', /morii-promo-colors-touch/);
    await expect(lettering).toHaveCSS('mask-image', /morii-promo-ink/);
    await expect(promo.locator('[data-ink-end]')).toHaveCSS('opacity', '0');
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    before = await hero.boundingBox();
  } finally {
    releaseMotion();
  }
  await page.waitForLoadState('load');
  await expect(hero).toHaveCSS('translate', 'none');
  expect(await hero.boundingBox()).toEqual(before);
  expect(fonts).toEqual([]);
  await promo.locator('h2').scrollIntoViewIfNeeded();
  await expect(promo).toHaveAttribute('data-writing', '');
  await expect(lettering).toHaveCSS('mask-image', /morii-promo-ink/);
  const aurora = () => page.locator('.morii-atmosphere').evaluate(element => getComputedStyle(element, '::before').animationPlayState);
  await expect.poll(aurora).toBe('paused');
  await expect(promo.locator('[data-ink-end]')).toHaveCSS('animation-delay', '1.9584s');
  await expect(promo).not.toHaveAttribute('data-writing');
  await expect.poll(aurora).toBe('running');
  await expect(lettering).toHaveCSS('mask-image', 'none');
  await expect(artwork).toHaveCSS('opacity', '1');
  if (sharp) {
    const preview = await promo.locator('h2').screenshot({ path: info.outputPath('color-wordmark.png') });
    const { data } = await sharp(preview).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    let teal = 0, purple = 0, orange = 0;
    for (let i = 0; i < data.length; i += 3) {
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      if (g - r > 22 && b - r > 22) teal++;
      if (r - g > 20 && b - r > 20) purple++;
      if (r - g > 38 && r - b > 38) orange++;
    }
    expect(Math.min(teal, purple, orange)).toBeGreaterThan(50);
  }
  await promo.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.reload({ waitUntil: 'load' });
  expect(await page.evaluate(() => ({ top: window.scrollY, hash: location.hash }))).toEqual({ top: 0, hash: '' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'load' });
  await expect(promo).not.toHaveAttribute('data-writing');
  await expect(artwork).toHaveCSS('opacity', '1');
});
