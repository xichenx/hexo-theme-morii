'use strict';

const { forPage } = require('../scripts/lib/i18n.cjs');
const t = (...args) => forPage(hexo).t(...args);
hexo.extend.generator.register('morii-reading-list', () => {
  if (hexo.theme.config.reading_list?.enable === false) return [];
  return { path: 'reading-list/index.html', layout: 'reading-list', data: { title: t("稍后阅读"), type: 'reading_list', comments: false } };
});
