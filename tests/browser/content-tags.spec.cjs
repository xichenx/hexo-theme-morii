'use strict';
const { test, expect } = require('@playwright/test');
const { installHooks, ready, noOverflow } = require('./helpers.cjs');
installHooks(test);
test.use({ javaScriptEnabled: false });

test('article timeline and button work on a subdirectory without JavaScript', async ({ page }) => {
  await ready(page, 'posts/reading/');
  const inline = page.locator('img.content-inline-image');
  await expect(inline).toHaveAttribute('alt', 'Morii 图标');
  await expect(inline).toHaveCSS('display', 'inline-block');
  const timeline = page.locator('.content-timeline');
  await expect(timeline).toHaveAttribute('data-tone', 'purple');
  await expect(timeline.getByRole('listitem')).toHaveCount(2);
  await expect(timeline.locator('time')).toHaveAttribute('datetime', '2026-10');
  await expect(timeline.locator('li strong').first()).toHaveText('阅读工具');
  const link = page.getByRole('link', { name: '浏览文章归档' });
  await expect(link).toHaveAttribute('href', '/layout/archives/');
  await link.scrollIntoViewIfNeeded();
  await noOverflow(page);
  await link.press('Enter');
  await expect(page).toHaveURL(/\/layout\/archives\/$/);
});

test('inline friend cards show in a generated post without JavaScript', async ({ page }) => {
  await ready(page, 'posts/reading/');
  const group = page.getByRole('region', { name: '推荐阅读' });
  const hexo = group.getByRole('link', { name: /Hexo 文档/ });
  const morii = group.getByRole('link', { name: /Morii 源码/ });
  await expect(hexo).toHaveAttribute('href', 'https://hexo.io/docs/');
  await expect(morii.locator('img')).toHaveAttribute('src', '/layout/icons/brand/morii-logo.png');
  await expect(hexo.locator('.friend-avatar')).toHaveText('H');
  await hexo.scrollIntoViewIfNeeded();
  await hexo.focus();
  await expect(hexo).toBeFocused();
  await noOverflow(page);
});

test('an inline answer can be revealed and hidden by keyboard without JavaScript', async ({ page }) => {
  await ready(page, 'posts/reading/');
  const toggle = page.getByRole('checkbox', { name: '查看答案' });
  const answer = page.locator('.inline-answer');
  await expect(answer).toBeHidden();
  await expect(toggle.locator('xpath=ancestor::p')).toContainText('哪条命令');

  await toggle.press('Space');
  await expect(toggle).toBeChecked();
  await expect(answer).toBeVisible();
  await expect(answer).toHaveText('hexo generate');
  await noOverflow(page);

  await toggle.press('Space');
  await expect(toggle).not.toBeChecked();
  await expect(answer).toBeHidden();
});
