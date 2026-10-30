'use strict';

const { forPage } = require('../scripts/lib/i18n.cjs');
const { tocObj, unescapeHTML, stripHTML } = require('hexo-util');

hexo.extend.helper.register('morii_page_title', function (page) {
  const t = (...args) => forPage(hexo, this).t(...args);
  if (page.type === 'series_index') return t('专题与系列');
  if (page.type === 'series_detail') return this.morii_series(page.series_key)?.title || t('专题与系列');
  if (this.is_home()) return page.current > 1 ? t("文章 · 第 {0} 页", page.current) : hexo.config.title;
  if (this.is_category()) return t("分类 · {0}", page.category);
  if (this.is_tag()) return t("标签 · {0}", page.tag);
  if (this.is_archive()) return page.year ? t("{0}{1}归档", page.year, page.month ? t(" 年 {0} 月", page.month) : t(" 年")) : t("文章归档");
  const labels = { tags: t("标签"), album: t("相册"), categories: t("分类"), music: t("音乐馆") };
  const paths = { game: t("游戏厅"), 'air-conditioner': t("小空调"), comments: t("留言板"), bangumis: t("追番列表") };
  return labels[page.type] || paths[String(page.path || '').split('/')[0]] || page.title || hexo.config.title;
});

hexo.extend.helper.register('morii_safe_url', value => {
  try {
    const url = new URL(String(value || ''));
    return /^https?:$/.test(url.protocol) ? url.href : '';
  } catch { return ''; }
});

hexo.extend.helper.register('morii_accent', () => {
  const { accent, accent_dark: dark } = hexo.theme.config;
  const valid = value => /^#[\da-f]{6}$/i.test(value || '');
  return `${valid(accent) ? `--brand-color:${accent};` : ''}${valid(dark) ? `--brand-color-dark:${dark};` : ''}`;
});

hexo.extend.helper.register('morii_toc', content => tocObj(content || '', { min_depth: 1, max_depth: 6 })
  .filter(item => item.id)
  .map(item => ({ ...item, text: unescapeHTML(item.text) })));

hexo.extend.helper.register('morii_reading_time', function (page) {
  const t = (...args) => forPage(hexo, this).t(...args);
  if (page.password) return '';
  const text = stripHTML(page.content || '');
  const chinese = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const words = (text.replace(/[\u3400-\u9fff]/g, '').match(/[\p{L}\p{N}]+/gu) || []).length;
  return t("约 {0} 分钟阅读", Math.max(1, Math.ceil(chinese / 350 + words / 200)));
});
