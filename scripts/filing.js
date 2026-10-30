'use strict';

const { forPage } = require('../scripts/lib/i18n.cjs');
const t = (...args) => forPage(hexo).t(...args);
const { URL } = require('node:url');
const text = value => typeof value === 'string' ? value.trim() : '';
const link = value => {
  try {
    const url = new URL(text(value));
    return /^https?:$/.test(url.protocol) && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
};

hexo.extend.helper.register('morii_filings', function () {
  const t = (...args) => forPage(hexo, this).t(...args);
  const filing = hexo.theme.config.footer?.filing;
  if (!filing || filing.enable === false) return [];
  return [
    { type: 'icp', label: t("ICP 备案"), entry: filing.icp, fallback: 'https://beian.miit.gov.cn/' },
    { type: 'police', label: t("公安备案"), entry: filing.police, fallback: '' }
  ].flatMap(({ type, label, entry, fallback }) => {
    const number = text(entry?.number);
    return number && entry.enable !== false ? [{ type, label, number, url: link(entry.url || fallback) }] : [];
  });
});
