'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);

const contributions = Array.from({ length: 365 }, (_, index) => ({
  date: new Date(Date.UTC(2025, 10, 21 + index)).toISOString().slice(0, 10),
  count: (index * 11 + Math.floor(index / 7)) % 8,
  level: (index * 11 + Math.floor(index / 7)) % 5
}));

test('contribution heatmap starts at recent dates and supports scrolling and date details', async ({ page, viewport }, info) => {
  await page.route('https://contributions.example.test/calendar', route => route.fulfill({
    json: { contributions },
    headers: { 'access-control-allow-origin': '*' }
  }));
  await ready(page);
  const card = page.locator('[data-github-calendar]');
  const scroller = card.locator('.github-calendar-scroll');
  const days = card.locator('.github-calendar-day');
  const hint = card.locator('.github-calendar-pan-hint');
  const detail = card.locator('.github-calendar-detail');
  await card.scrollIntoViewIfNeeded();
  await expect(days).toHaveCount(365);
  await expect(card.locator('.github-calendar-status')).toContainText('2026-11-20');

  if (viewport.width <= 580) {
    await expect(card).toHaveAttribute('data-calendar-scroll-left', '');
    await expect(card).not.toHaveAttribute('data-calendar-scroll-right', '');
    await expect(scroller).toHaveCSS('overscroll-behavior-x', 'contain');
    for (const width of [viewport.width, 320]) {
      await page.setViewportSize({ width, height: viewport.height });
      await noOverflow(page);
      await expect(hint).toBeVisible();
      expect((await card.boundingBox()).height).toBeLessThan(275);
      await scroller.evaluate(element => { element.scrollLeft = 0; });
      await expect(card).not.toHaveAttribute('data-calendar-scroll-left', '');
      await expect(card).toHaveAttribute('data-calendar-scroll-right', '');
      await scroller.evaluate(element => { element.scrollLeft = element.scrollWidth; });
      await expect(card).toHaveAttribute('data-calendar-scroll-left', '');
      await expect(card).not.toHaveAttribute('data-calendar-scroll-right', '');
    }
    await page.setViewportSize(viewport);
  } else {
    await expect(hint).toBeHidden();
    await noOverflow(page);
  }

  const preview = info.outputPath('github-calendar.png');
  await card.screenshot({ path: preview, animations: 'disabled' });
  await info.attach('contribution heatmap', { path: preview, contentType: 'image/png' });
  await days.last().click();
  await expect(detail).toContainText('2026-11-20');
  await expect(hint).toBeHidden();
  await days.last().press('Home');
  await expect(days.first()).toBeFocused();
  await expect(detail).toContainText('2025-11-21');
  await days.first().press('ArrowRight');
  await expect(days.nth(7)).toBeFocused();
  await expect(detail).toContainText('2025-11-28');
});
