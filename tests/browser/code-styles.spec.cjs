'use strict';
const { test, expect } = require('@playwright/test');
const { sampleCode } = require('../../tools/lib/browser-fixture.cjs');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);
const shell = (page, style, theme) => page.locator(`.code-shell[data-code-style=${style}][data-code-theme=${theme}]`);
const backgrounds = { dark: 'rgb(27, 36, 53)', light: 'rgb(246, 248, 252)' };

test('all code styles keep their palette, highlighted lines and long filenames in bounds', async ({ page, colorScheme }) => {
  await ready(page, 'posts/code-styles/');
  await expect(page.locator('.code-shell')).toHaveCount(10);
  for (const style of ['classic', 'mac', 'minimal']) for (const theme of ['auto', 'light', 'dark']) {
    const block = shell(page, style, theme).filter({ has: page.locator('.code-filename') });
    await expect(block).toHaveCSS('background-color', backgrounds[theme === 'auto' ? colorScheme : theme]);
    await expect(block.locator('.keyword').first()).toHaveCSS('color', (theme === 'auto' ? colorScheme : theme) === 'dark' ? 'rgb(201, 166, 255)' : 'rgb(131, 86, 181)');
    await expect(block.locator('.line.marked')).toHaveCount(2);
    const overflow = await block.locator('.code-filename').evaluate(e => e.scrollWidth - e.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    const dots = await block.locator('.code-tools').evaluate(e => getComputedStyle(e, '::before').content);
    expect(dots === 'none').toBe(style !== 'mac');
  }
  await noOverflow(page);
});

test('copy and folding preserve the complete source in styled blocks', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__moriiCopiedCode = text; } } }));
  await ready(page, 'posts/code-styles/');
  const block = shell(page, 'mac', 'auto'), toggle = block.locator('.code-toggle');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await block.locator('.code-tools button').click();
  await expect.poll(() => page.evaluate(() => window.__moriiCopiedCode)).toBe(sampleCode + '\n');
  await toggle.click(); await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await toggle.click(); await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('auto palettes follow theme changes without rebuilding or expanding code blocks', async ({ page, colorScheme }) => {
  await ready(page, 'posts/code-styles/');
  const block = shell(page, 'mac', 'auto');
  const original = await block.locator('.code pre').textContent();
  await page.locator('#theme-toggle').click();
  await expect(block).toHaveCSS('background-color', backgrounds[colorScheme === 'dark' ? 'light' : 'dark']);
  await expect(shell(page, 'classic', 'dark')).toHaveCSS('background-color', backgrounds.dark);
  await expect(shell(page, 'minimal', 'light')).toHaveCSS('background-color', backgrounds.light);
  await expect(block.locator('.code-toggle')).toHaveAttribute('aria-expanded', 'false');
  expect(await block.locator('.code pre').textContent()).toBe(original);
  await expect(page.locator('.code-shell .code-shell')).toHaveCount(0);
});

test('print expands styled code and hides interactive decorations', async ({ page }) => {
  await ready(page, 'posts/code-styles/');
  await page.emulateMedia({ media: 'print' });
  const block = shell(page, 'mac', 'auto');
  await expect(block.locator('.code-tools')).toBeHidden();
  await expect(block.locator('.code-toggle')).toBeHidden();
  await expect(block.locator('figure')).toHaveCSS('max-height', 'none');
  await expect(block).toHaveCSS('background-color', 'rgb(245, 245, 245)');
  await expect(block).toHaveCSS('box-shadow', 'none');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('code and selected palettes remain readable', async ({ page }) => {
    await ready(page, 'posts/code-styles/');
    await expect(page.locator('.code-shell')).toHaveCount(0);
    await expect(page.locator('.code-file')).toHaveCount(9);
    const first = page.locator('.code-file[data-code-theme=light]').first();
    await expect(first.locator('figure')).toHaveCSS('background-color', backgrounds.light);
    expect((await first.locator('.code pre').innerText()).trimEnd()).toBe(sampleCode);
    await noOverflow(page);
  });
});
