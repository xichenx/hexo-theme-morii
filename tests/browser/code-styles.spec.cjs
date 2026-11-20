'use strict';
const { test, expect } = require('@playwright/test');
const { sampleCode } = require('../../tools/lib/browser-fixture.cjs');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);
const shell = (page, style, theme) => page.locator(`.code-shell[data-code-style=${style}][data-code-theme=${theme}]`);
const backgrounds = { dark: 'rgb(27, 36, 53)', light: 'rgb(246, 248, 252)' };

test('code toolbar can hide copy and language labels without losing the viewer or wrapping', async ({ page }) => {
  await ready(page, 'posts/welcome/');
  const block = page.locator('.code-shell').first();
  const toolbar = block.locator('.code-tools');
  await expect(toolbar.locator('span, .code-copy')).toHaveCount(0);
  await toolbar.locator('.code-view').click();
  const dialog = page.locator('.code-dialog');
  await expect(dialog.locator('.code-tools span, .code-copy')).toHaveCount(0);
  await dialog.locator('.code-wrap').click();
  await expect(dialog.locator('.code pre')).toHaveCSS('white-space', 'pre-wrap');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await noOverflow(page);
});

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
  await expect(block.locator('.code-tools span')).toHaveText(/javascript/);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await block.locator('.code-copy').click();
  await expect.poll(() => page.evaluate(() => window.__moriiCopiedCode)).toBe(sampleCode + '\n');
  await toggle.click(); await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await toggle.click(); await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('long code starts expanded and can still fold when the viewer is disabled', async ({ page }) => {
  await ready(page, 'posts/code-controls/');
  const block = page.locator('.code-shell');
  const toggle = block.locator('.code-toggle');
  const code = block.locator(':scope > figure');
  await expect(block.locator('.code-view')).toHaveCount(0);
  await expect(block.locator('.code-copy')).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(code).toHaveCSS('max-height', 'none');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(code).toHaveCSS('overflow-y', 'hidden');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(code).toHaveCSS('max-height', 'none');
  await noOverflow(page);
});

test('code viewer opens the complete block and restores position and focus', async ({ page, viewport }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__moriiCopiedCode = text; } } }));
  await ready(page, 'posts/code-styles/');
  const block = shell(page, 'mac', 'auto');
  const trigger = block.locator('.code-view');
  const dialog = page.locator('.code-dialog');
  await trigger.click();
  await expect(dialog).toBeVisible();
  expect((await dialog.boundingBox()).width).toBeLessThan(viewport.width);
  await expect(dialog.locator('figure')).toHaveCSS('max-height', 'none');
  await expect(dialog.locator('.line.marked')).toHaveCount(2);
  await dialog.locator('.code-wrap').click();
  await expect(dialog.locator('.code pre')).toHaveCSS('white-space', 'pre-wrap');
  await dialog.locator('.code-copy').click();
  await expect.poll(() => page.evaluate(() => window.__moriiCopiedCode)).toBe(sampleCode + '\n');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(block.locator('.code-toggle')).toHaveAttribute('aria-expanded', 'false');
  await expect(block.locator('.code-wrap')).toHaveAttribute('aria-pressed', 'true');
  await expect(block.locator(':scope > figure')).toHaveCount(1);
  await trigger.click();
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  await expect(dialog).toHaveCount(0);
  await expect(block.locator(':scope > figure')).toHaveCount(1);
});

test('pixel-based folding follows rendered height when wrapping changes', async ({ page }) => {
  await ready(page, 'posts/code-height/');
  const block = page.locator('.code-shell');
  const code = block.locator(':scope > figure');
  const toggle = block.locator('.code-toggle');
  const wrap = block.locator('.code-wrap');
  await expect(toggle).toBeHidden();
  await wrap.click();
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(code).toHaveCSS('max-height', '130px');
  await toggle.click();
  await expect(code).toHaveCSS('max-height', 'none');
  expect(await code.evaluate(element => element.scrollHeight)).toBeGreaterThan(130);
  await toggle.click();
  await expect(code).toHaveCSS('max-height', '130px');
  await wrap.click();
  await expect(toggle).toBeHidden();
  await expect(code).toHaveCSS('max-height', 'none');
  await noOverflow(page);
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

test('wrapping contains long lines, preserves source and toggles independently', async ({ page }) => {
  await ready(page, 'posts/layout-stress/');
  const block = page.locator('.code-shell').first();
  const code = block.locator('.code pre');
  const original = await code.textContent();
  const wrap = block.locator('.code-wrap');
  await expect(wrap).toHaveAttribute('aria-pressed', 'false');
  await wrap.click();
  await expect(wrap).toHaveAttribute('aria-pressed', 'true');
  await expect(code).toHaveCSS('white-space', 'pre-wrap');
  await expect(block.locator('.gutter')).toBeHidden();
  expect(await code.evaluate(e => e.scrollWidth - e.clientWidth)).toBeLessThanOrEqual(1);
  expect(await code.textContent()).toBe(original);
  await noOverflow(page);
  await wrap.click();
  await expect(wrap).toHaveAttribute('aria-pressed', 'false');
  await expect(block.locator('.gutter')).toBeVisible();
});

test('attribution stays in bounds with canonical and source edit links', async ({ page }) => {
  await ready(page, 'posts/code-styles/');
  await expect(page.locator('.article-copyright')).toBeVisible();
  await expect(page.locator('.article-copyright a').first()).toHaveAttribute('href', 'https://example.test/layout/posts/code-styles/');
  await expect(page.locator('.article-edit')).toHaveAttribute('href', 'https://github.com/example/blog/edit/main/source/_posts/code-styles.md');
  expect(await page.locator('.article-copyright').evaluate(e => e.scrollWidth - e.clientWidth)).toBeLessThanOrEqual(1);
  await noOverflow(page);
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
