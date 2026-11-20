'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);
test.use({ reducedMotion: 'no-preference' });

test('layered entrances finish cleanly and navigation remains interactive', async ({ page, viewport }, info) => {
  await ready(page);
  const hero = page.locator('.hero__main');
  await expect.poll(() => hero.evaluate(e => e.style.getPropertyValue('--morii-ambient-state'))).toBe('running');
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

test('the Morii wordmark writes once and settles into the complete artwork', async ({ page }) => {
  await ready(page);
  const promo = page.getByRole('region', { name: 'Morii', exact: true });
  const wordmark = promo.getByRole('heading', { name: 'Morii' });
  await promo.scrollIntoViewIfNeeded();
  await expect(promo).toHaveAttribute('data-writing', '');
  await expect(wordmark).toHaveCSS('mask-image', /morii-promo-ink/);
  await expect(promo.locator('[data-ink-end]')).toHaveCSS('animation-name', 'morii-write');
  await expect(promo).not.toHaveAttribute('data-writing', '');
  await expect(wordmark).toHaveCSS('mask-image', 'none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'load' });
  await promo.scrollIntoViewIfNeeded();
  await expect(promo).not.toHaveAttribute('data-writing', '');
  await expect(wordmark).toHaveCSS('mask-image', 'none');
});
