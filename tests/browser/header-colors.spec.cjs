'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);
const chromeColors = { light: '#f6f8fc', dark: '#111827', inverse: '#252a40' };
const chromePaint = { light: 'rgb(246, 248, 252)', dark: 'rgb(17, 24, 39)', inverse: 'rgb(37, 42, 64)' };
const homeColors = { light: '#e9f0f9', dark: '#172238' };
const homePaint = { light: 'rgb(233, 240, 249)', dark: 'rgb(23, 34, 56)' };
const clear = 'rgba(0, 0, 0, 0)';

test('header and navigation follow the accent in both color modes', async ({ page, colorScheme, viewport, isMobile }, info) => {
  await ready(page);
  const header = page.locator('.site-header');
  const root = page.locator('html');
  const chrome = page.locator('meta[name="theme-color"]');
  const menu = header.locator('#menu-toggle');
  const themeToggle = header.locator('#theme-toggle');
  const active = header.locator('.site-nav [aria-current="page"]');
  await expect(chrome).toHaveAttribute('content', homeColors[colorScheme]);
  await expect(root).toHaveCSS('background-color', homePaint[colorScheme]);
  await expect(header).toHaveCSS('background-color', isMobile ? homePaint[colorScheme] : clear);
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
  for (const key of Object.keys(original)) {
    if (isMobile && key === 'header') expect(customized[key]).toBe(chromePaint[colorScheme]);
    else expect(customized[key]).not.toBe(original[key]);
  }
  expect(customized.active).not.toBe(customized.nav);
  if (customized.inactive) expect(customized.active).not.toBe(customized.inactive);

  const next = colorScheme === 'dark' ? 'light' : 'dark';
  await themeToggle.click();
  await expect(root).toHaveAttribute('data-theme', next);
  await expect(chrome).toHaveAttribute('content', (isMobile ? chromeColors : homeColors)[next]);
  if (viewport.width <= 800) await menu.click();
  await expect(active).toBeVisible();
  const switched = await palette();
  for (const key of Object.keys(customized)) expect(switched[key]).not.toBe(customized[key]);
  await noOverflow(page);
  await info.attach('custom accent', { body: await page.screenshot({ animations: 'disabled' }), contentType: 'image/png' });

  await root.evaluate(html => { html.dataset.glass = 'off'; });
  await expect(header).toHaveCSS('backdrop-filter', 'none');
  expect((await palette()).header).toBe(isMobile ? chromePaint[next] : switched.button);
});

test('header and browser chrome follow immersive surfaces and restore the normal palette after a cover', async ({ page, colorScheme, viewport, isMobile }) => {
  const header = page.locator('.site-header');
  const root = page.locator('html');
  const chrome = page.locator('meta[name="theme-color"]');
  const headerStyles = () => header.evaluate(node => {
    const styles = getComputedStyle(node);
    return { top: node.getBoundingClientRect().top, bottom: node.getBoundingClientRect().bottom, background: styles.backgroundColor, color: styles.color };
  });

  await ready(page, 'about/');
  const regular = await headerStyles();
  await expect(chrome).toHaveAttribute('content', chromeColors[colorScheme]);
  expect(regular.background).toBe(isMobile ? chromePaint[colorScheme] : clear);
  for (const [route, tone] of [['music/', 'inverse'], ['posts/welcome/', 'inverse'], ['posts/layout-stress/', 'surface']]) {
    await ready(page, route);
    const backdrop = page.locator(`main [data-header-backdrop="${tone}"]`);
    expect((await backdrop.boundingBox()).y).toBeCloseTo(0, 0);
    const immersive = await headerStyles();
    expect(immersive.top).toBeCloseTo(0, 0);
    expect(immersive.background).toBe(isMobile && tone === 'inverse' ? chromePaint.inverse : regular.background);
    expect(immersive.color).toBe(tone === 'inverse' ? 'rgb(255, 255, 255)' : regular.color);
    const pageColor = chromeColors[tone === 'inverse' ? tone : colorScheme];
    await expect(chrome).toHaveAttribute('content', pageColor);
    await expect(root).toHaveCSS('background-color', chromePaint[tone === 'inverse' ? tone : colorScheme]);
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
    await expect(root).toHaveCSS('background-color', chromePaint[colorScheme]);
    expect((await headerStyles()).top).toBeCloseTo(0, 0);

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(header).toHaveCSS('background-color', immersive.background);
    await expect(header).toHaveCSS('color', immersive.color);
    await expect(chrome).toHaveAttribute('content', pageColor);
    await noOverflow(page);
  }
});

test('phone chrome and navigation switch together at the top and while scrolled', async ({ page, colorScheme, isMobile }) => {
  test.skip(!isMobile);
  await ready(page);
  const root = page.locator('html');
  await root.evaluate(html => {
    html.style.setProperty('--safe-top', '54px');
    html.dataset.themeTransition = 'on';
    html.dataset.motion = 'on';
    html.dataset.glass = 'on';
  });
  const header = page.locator('.site-header');
  await expect(header).toHaveCSS('padding-top', '54px');
  const initialBounds = await header.boundingBox();
  expect(initialBounds.y).toBe(0);
  const main = page.locator('main');
  expect((await main.boundingBox()).y).toBeCloseTo(initialBounds.height, 1);
  await expect(main).toHaveCSS('background-image', new RegExp(`linear-gradient\\(rgb\\(${homePaint[colorScheme].slice(4, -1)}\\)`));
  const next = colorScheme === 'dark' ? 'light' : 'dark';
  const switchTheme = () => header.locator('#theme-toggle').evaluate(button => {
    button.click();
    const root = document.documentElement;
    return {
      theme: root.dataset.theme,
      tint: document.querySelector('meta[name="theme-color"]').content,
      canvas: getComputedStyle(root).backgroundColor,
      header: getComputedStyle(button.closest('.site-header')).backgroundColor,
      busy: button.hasAttribute('aria-busy')
    };
  });
  expect(await switchTheme()).toEqual({ theme: next, tint: homeColors[next], canvas: homePaint[next], header: homePaint[next], busy: false });
  await expect(main).toHaveCSS('background-image', new RegExp(`linear-gradient\\(rgb\\(${homePaint[next].slice(4, -1)}\\)`));
  expect(await header.boundingBox()).toEqual(initialBounds);

  await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }));
  const chrome = page.locator('meta[name="theme-color"]');
  await expect(chrome).toHaveAttribute('content', chromeColors[next]);
  await expect(header).toHaveCSS('background-color', chromePaint[next]);
  await expect(header).toHaveCSS('backdrop-filter', 'none');
  expect(await switchTheme()).toEqual({ theme: colorScheme, tint: chromeColors[colorScheme], canvas: chromePaint[colorScheme], header: chromePaint[colorScheme], busy: false });

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(chrome).toHaveAttribute('content', homeColors[colorScheme]);
  await expect(header).toHaveCSS('background-color', homePaint[colorScheme]);
  await expect(root).toHaveCSS('background-color', homePaint[colorScheme]);
});
