'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);
test.use({ reducedMotion: 'no-preference' });

test('layered entrances finish cleanly and navigation remains interactive', async ({ page }) => {
  await ready(page);
  const hero = page.locator('.hero__main');
  await expect.poll(() => hero.evaluate(e => e.style.getPropertyValue('--morii-ambient-state'))).toBe('running');
  await expect.poll(() => hero.evaluate(e => e.getAnimations({ subtree: true }).filter(a => a.effect?.target instanceof Element && a.effect.target.closest('.hero__actions, h1, .eyebrow, p') && !a.animationName).length)).toBe(0);
  await expect(hero.locator('h1')).toHaveCSS('opacity', '1');
  await noOverflow(page);
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
  await page.locator('#navigation-open').click();
  await expect(page.locator('.navigation-card').first()).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.navigation-card').first()).toBeVisible();
});
