'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);
const chromeColors = { light: '#f6f8fc', dark: '#111827', inverse: '#252a40' };

test('header and navigation follow the accent in both color modes', async ({ page, colorScheme, viewport }, info) => {
  await ready(page);
  const header = page.locator('.site-header');
  const root = page.locator('html');
  const chrome = page.locator('meta[name="theme-color"]');
  const menu = header.locator('#menu-toggle');
  const themeToggle = header.locator('#theme-toggle');
  const active = header.locator('.site-nav [aria-current="page"]');
  await expect(chrome).toHaveAttribute('content', chromeColors[colorScheme]);
  await expect(header).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await page.evaluate(() => window.scrollTo({ top: 160, behavior: 'instant' }));
  await expect(header).not.toHaveAttribute('data-header-top', '');
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
  await expect(chrome).toHaveAttribute('content', chromeColors[next]);
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

test('header and browser chrome follow immersive surfaces and restore the normal palette after a cover', async ({ page, colorScheme, viewport }) => {
  const header = page.locator('.site-header');
  const chrome = page.locator('meta[name="theme-color"]');
  const headerStyles = () => header.evaluate(node => {
    const styles = getComputedStyle(node);
    return { top: node.getBoundingClientRect().top, bottom: node.getBoundingClientRect().bottom, background: styles.backgroundColor, color: styles.color };
  });

  await ready(page, 'about/');
  const regular = await headerStyles();
  await expect(chrome).toHaveAttribute('content', chromeColors[colorScheme]);
  expect(regular.background).toBe('rgba(0, 0, 0, 0)');
  for (const [route, tone] of [['music/', 'inverse'], ['posts/welcome/', 'inverse'], ['posts/layout-stress/', 'surface']]) {
    await ready(page, route);
    const backdrop = page.locator(`main [data-header-backdrop="${tone}"]`);
    expect((await backdrop.boundingBox()).y).toBeCloseTo(0, 0);
    const immersive = await headerStyles();
    expect(immersive.top).toBeCloseTo(0, 0);
    expect(immersive.background).toBe(regular.background);
    expect(immersive.color).toBe(tone === 'inverse' ? 'rgb(255, 255, 255)' : regular.color);
    const pageColor = chromeColors[tone === 'inverse' ? tone : colorScheme];
    await expect(chrome).toHaveAttribute('content', pageColor);
    if (viewport.width <= 800) {
      const menu = header.locator('#menu-toggle');
      await menu.click();
      await expect(header.locator('.site-nav')).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await menu.click();
    }
    if (route === 'music/') continue;

    await page.evaluate(() => window.scrollTo({ top: 48, behavior: 'instant' }));
    await expect(header).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    expect((await headerStyles()).color).toBe(immersive.color);
    await expect(chrome).toHaveAttribute('content', pageColor);
    await backdrop.evaluate(element => window.scrollTo({ top: scrollY + element.getBoundingClientRect().bottom, behavior: 'instant' }));
    await expect(header).toHaveCSS('color', regular.color);
    await expect(chrome).toHaveAttribute('content', chromeColors[colorScheme]);
    expect((await headerStyles()).top).toBeCloseTo(0, 0);

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(header).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(header).toHaveCSS('color', immersive.color);
    await expect(chrome).toHaveAttribute('content', pageColor);
    await noOverflow(page);
  }
});
