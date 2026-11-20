'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);

test('header and navigation follow the accent in both color modes', async ({ page, colorScheme, viewport }, info) => {
  await ready(page);
  const header = page.locator('.site-header');
  const root = page.locator('html');
  const menu = header.locator('#menu-toggle');
  const themeToggle = header.locator('#theme-toggle');
  const active = header.locator('.site-nav [aria-current="page"]');
  if (viewport.width <= 800) await menu.click();
  await expect(active).toBeVisible();

  const palette = () => header.evaluate(element => {
    const paint = selector => getComputedStyle(element.querySelector(selector)).backgroundColor;
    return {
      header: getComputedStyle(element).backgroundColor,
      nav: paint('.site-nav'),
      active: paint('[aria-current="page"]'),
      button: paint('#search-open'),
      ...(matchMedia('(max-width:800px)').matches && { inactive: paint('.site-nav a:not([aria-current="page"])') })
    };
  });
  const original = await palette();
  await root.evaluate(html => {
    html.style.setProperty('--brand-color', '#ae531a');
    html.style.setProperty('--brand-color-dark', '#68d6ad');
  });
  const customized = await palette();
  for (const key of Object.keys(original)) expect(customized[key]).not.toBe(original[key]);
  expect(customized.active).not.toBe(customized.nav);
  if (customized.inactive) expect(customized.active).not.toBe(customized.inactive);

  const next = colorScheme === 'dark' ? 'light' : 'dark';
  await themeToggle.click();
  await expect(root).toHaveAttribute('data-theme', next);
  if (viewport.width <= 800) await menu.click();
  await expect(active).toBeVisible();
  const switched = await palette();
  for (const key of Object.keys(customized)) expect(switched[key]).not.toBe(customized[key]);
  await noOverflow(page);
  await info.attach('custom accent', { body: await page.screenshot({ animations: 'disabled' }), contentType: 'image/png' });

  await root.evaluate(html => { html.dataset.glass = 'off'; });
  await expect(header).toHaveCSS('backdrop-filter', 'none');
  expect((await palette()).header).toBe(switched.button);
});
