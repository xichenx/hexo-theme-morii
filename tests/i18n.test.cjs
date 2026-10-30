'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const { create, locale } = require('../source/js/i18n.js');
const { catalogs, forPage } = require('../scripts/lib/i18n.cjs');

test('three catalogs have matching keys and preserve interpolation arguments', () => {
  const keys = Object.keys(catalogs['zh-CN']).sort();
  const slots = value => [...value.matchAll(/\{(\d+)\}/g)].map(match => match[1]).sort();
  for (const language of ['en', 'zh-CN', 'zh-TW']) {
    assert.deepEqual(Object.keys(catalogs[language]).sort(), keys);
    for (const key of keys) assert.deepEqual(slots(catalogs[language][key]), slots(key), `${language}: ${key}`);
  }
  assert.equal(create('en', catalogs.en).t('第 {0} 页', 2), 'Page 2');
  assert.equal(create('zh-TW', catalogs['zh-TW']).t('搜索文章'), '搜尋文章');
  assert.equal(create('en', catalogs.en).t('custom {0}', '$&'), 'custom $&');
});

test('locale fallback, arrays and page overrides are deterministic and do not mutate content', () => {
  assert.equal(locale(['en', 'zh-CN']), 'en');
  assert.equal(locale('en-US'), 'en');
  assert.equal(locale('zh_TW'), 'zh-TW');
  assert.equal(locale('zh-Hant'), 'zh-TW');
  assert.equal(locale('fr'), 'zh-CN');
  const hexo = { config: { language: 'en' } };
  const translator = forPage(hexo, { page: { lang: 'zh-TW' } });
  assert.equal(translator.locale, 'zh-TW');
  assert.equal(translator.localized({ en: 'Custom', 'zh-CN': '自定义', 'zh-TW': '自訂' }), '自訂');
  assert.equal(translator.localized('原文保持不变'), '原文保持不变');
  assert.equal(translator.localized({ en: 'Only English' }), 'Only English');
});

test('browser translates live menu and theme announcements in each locale', () => {
  for (const language of ['en', 'zh-CN', 'zh-TW']) {
    const dom = new JSDOM(`<html lang="${language}"><body><button id="theme-toggle"></button><div id="theme-announcement"></div><nav class="site-nav" id="site-nav"></nav><button id="menu-toggle"></button></body></html>`, { url: 'https://example.test', runScripts: 'outside-only' });
    const { window } = dom;
    window.MoriiLocaleMessages = catalogs[language];
    window.matchMedia = () => ({ matches: false, addEventListener() {} });
    window.eval(fs.readFileSync(path.join(__dirname, '../source/js/i18n.js'), 'utf8'));
    window.eval(fs.readFileSync(path.join(__dirname, '../source/js/theme.js'), 'utf8'));
    window.document.getElementById('menu-toggle').click();
    assert.equal(window.document.getElementById('menu-toggle').getAttribute('aria-label'), window.MoriiI18n.t('关闭菜单'));
    window.document.getElementById('theme-toggle').click();
    assert.equal(window.document.getElementById('theme-toggle').getAttribute('aria-label'), window.MoriiI18n.t('切换浅色模式'));
    dom.window.close();
  }
});

test('server helper respects per-page language without translating article text', () => {
  const helpers = {};
  const hexo = { config: { language: 'en' }, extend: { helper: { register: (key, fn) => { helpers[key] = fn; } } } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../scripts/plain-text.js'), 'utf8'), { hexo, require });
  const page = { page: { lang: 'zh-TW' } };
  assert.equal(helpers.morii_excerpt.call(page, { content: '<p>我的文章正文</p>' }), '我的文章正文');
  assert.equal(helpers.morii_excerpt.call(page, { password: true }), catalogs['zh-TW']['这是一篇加密文章，输入密码后可以继续阅读。']);
});
