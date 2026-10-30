'use strict';

const { forPage } = require('../scripts/lib/i18n.cjs');
const t = (...args) => forPage(hexo).t(...args);
hexo.extend.generator.register('morii-404', () => ({
  path: '404.html',
  layout: '404',
  data: { title: t("页面未找到"), type: '404' }
}))
