'use strict';
const { forPage, catalogs } = require('../scripts/lib/i18n.cjs');
hexo.extend.helper.register('morii_t', function (key, ...values) { return forPage(hexo, this).t(key, ...values); });
hexo.extend.helper.register('morii_locale', function () { return forPage(hexo, this).locale; });
hexo.extend.helper.register('morii_localized', function (value) { return forPage(hexo, this).localized(value); });
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
// Browser packs need only messages referenced by client code. Keep server-only prose out.
const clientDirectory = path.join(hexo.theme_dir, 'source/js');
const clientSource = fs.readdirSync(clientDirectory).filter(file => file.endsWith('.js')).map(file => fs.readFileSync(path.join(clientDirectory, file), 'utf8')).join('\n');
const clientKeys = Object.keys(catalogs.en).filter(key => clientSource.includes(JSON.stringify(key)) || clientSource.includes("'" + key.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"));
const assets = Object.entries(catalogs).filter(([locale]) => locale !== 'zh-CN').map(([locale, data]) => {
  const source = 'window.MoriiLocaleMessages=' + JSON.stringify(Object.fromEntries(clientKeys.map(key => [key, data[key]]))).replace(/</g, '\\u003c') + ';';
  const hash = createHash('sha256').update(source).digest('hex').slice(0, 12);
  return { locale, path: `js/locales/${locale}.${hash}.js`, data: source };
});
hexo.extend.generator.register('morii-locales', () => assets.map(({ path, data }) => ({ path, data })));
hexo.extend.helper.register('morii_locale_asset', function () { return assets.find(asset => asset.locale === forPage(hexo, this).locale)?.path; });
const navigationLabels = new Set(['首页', '文章', '分类', '即刻', '相册', '友链', '关于', '音乐馆', '电影院', '朋友圈', '留言板', '游戏厅', '小空调', '标签', '稍后阅读']);
hexo.extend.helper.register('morii_nav_label', function (value) {
  const locale = forPage(hexo, this);
  return typeof value === 'string' && navigationLabels.has(value) ? locale.t(value) : locale.localized(value);
});
