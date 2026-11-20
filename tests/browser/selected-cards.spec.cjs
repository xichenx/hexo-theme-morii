'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);

test('selected cards preserve covers, placeholders and links in the responsive layout', async ({ page, viewport }, info) => {
  await ready(page);
  const section = page.getByRole('region', { name: '值得一读' });
  const grid = section.locator('.selected-grid');
  const cards = grid.locator('.selected-card');
  await expect(cards).toHaveCount(3);
  await expect(cards.first()).toHaveAttribute('href', '/layout/posts/welcome/');
  await expect(cards.last().locator('.selected-card__media > span')).toHaveText('✦');
  await section.scrollIntoViewIfNeeded();
  const cover = cards.first().locator('img');
  await expect.poll(() => cover.evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
  if (await cover.getAttribute('srcset')) await expect(cover).toHaveAttribute('sizes', '90px');

  if (viewport.width <= 580) {
    await expect(grid).toHaveCSS('row-gap', '10px');
    for (const width of [viewport.width, 320]) {
      await page.setViewportSize({ width, height: viewport.height });
      for (const card of await cards.all()) {
        const media = card.locator('.selected-card__media');
        const thumb = await media.boundingBox();
        expect(thumb.width / thumb.height).toBeCloseTo(4 / 3, 1);
        const bounds = await card.boundingBox();
        expect(bounds.height).toBeGreaterThanOrEqual(84);
        expect(bounds.height).toBeLessThan(100);
      }
      await noOverflow(page);
    }
    const result = await cards.first().evaluate(card => {
      const title = card.querySelector('strong');
      const thumbnail = card.querySelector('.selected-card__media');
      const original = title.textContent;
      const baseHeight = card.offsetHeight;
      const thumbHeight = thumbnail.offsetHeight;
      title.textContent = 'A long title in a narrow mobile layout that needs several lines to remain readable. '.repeat(3);
      const fits = card.offsetHeight > baseHeight &&
        title.scrollWidth <= title.clientWidth + 1 &&
        thumbnail.offsetHeight === thumbHeight &&
        card.querySelector('small').getBoundingClientRect().bottom <= card.getBoundingClientRect().bottom;
      title.textContent = original;
      return fits;
    });
    expect(result).toBe(true);
    await page.setViewportSize(viewport);
  } else {
    await expect(cards.first()).toHaveCSS('min-height', viewport.width <= 1000 ? '105px' : '125px');
    await noOverflow(page);
  }

  const preview = info.outputPath('selected-cards.png');
  await section.screenshot({ path: preview, animations: 'disabled' });
  await info.attach('selected cards', { path: preview, contentType: 'image/png' });
});
