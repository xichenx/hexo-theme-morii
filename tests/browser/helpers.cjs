'use strict';
const { expect } = require('@playwright/test');
const { prefix } = require('../../tools/lib/browser-fixture.cjs');
const weather = { current: { time: 1793314800, temperature_2m: 23, relative_humidity_2m: 67, weather_code: 3, wind_direction_10m: 45 } };
function installHooks(test) {
  test.beforeEach(async ({ context, page, baseURL }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.__layoutErrors = errors;
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === new URL(baseURL).origin) return route.continue();
      if (url.hostname === 'api.open-meteo.com') return route.fulfill({ json: weather });
      return route.abort('blockedbyclient');
    });
  });
  test.afterEach(async ({ page }, info) => {
    if (info.status === 'passed') {
      expect(page.__layoutErrors, 'Theme scripts should not throw').toEqual([]);
      await info.attach('layout', { body: await page.screenshot({ animations: 'disabled' }), contentType: 'image/png' });
    }
  });
}
async function ready(page, route = '') {
  await page.goto(prefix + route, { waitUntil: 'load' });
  await expect(page.locator(route === 'music/' ? '.music-room' : 'main h1')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}
async function noOverflow(page) {
  const overflow = await page.evaluate(() => ({ document: document.documentElement.scrollWidth - document.documentElement.clientWidth, body: document.body.scrollWidth - document.body.clientWidth, outside: [...document.querySelectorAll('main *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).slice(0, 12).map(e => ({ tag: e.tagName, class: e.className, right: Math.round(e.getBoundingClientRect().right) })) }));
  expect(overflow.document, JSON.stringify(overflow)).toBeLessThanOrEqual(1);
  expect(overflow.body, JSON.stringify(overflow)).toBeLessThanOrEqual(1);
  const titles = await page.locator('main h1, .post-card h3, .recent-list a').evaluateAll(nodes => nodes.filter(e => { const box = e.getBoundingClientRect(); return box.width > 1 && box.height > 1; }).map(e => ({ text: e.textContent.slice(0, 70), excess: e.scrollWidth - e.clientWidth })));
  expect(titles.filter(item => item.excess > 1), 'Titles must wrap within their boxes').toEqual([]);
}
module.exports = { installHooks, ready, noOverflow };
