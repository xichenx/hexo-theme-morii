'use strict';

const { tocObj, unescapeHTML, stripHTML } = require('hexo-util');

hexo.extend.helper.register('morii_page_title', function (page) {
  if (this.is_home()) return page.current > 1 ? `文章 · 第 ${page.current} 页` : hexo.config.title;
  if (this.is_category()) return `分类 · ${page.category}`;
  if (this.is_tag()) return `标签 · ${page.tag}`;
  if (this.is_archive()) return page.year ? `${page.year}${page.month ? ` 年 ${page.month} 月` : ' 年'}归档` : '文章归档';
  const labels = { tags: '标签', album: '相册', categories: '分类', music: '音乐馆' };
  const paths = { game: '游戏厅', 'air-conditioner': '小空调', comments: '留言板', bangumis: '追番列表' };
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

hexo.extend.helper.register('morii_reading_time', page => {
  if (page.password) return '';
  const text = stripHTML(page.content || '');
  const chinese = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const words = (text.replace(/[\u3400-\u9fff]/g, '').match(/[\p{L}\p{N}]+/gu) || []).length;
  return `约 ${Math.max(1, Math.ceil(chinese / 350 + words / 200))} 分钟阅读`;
});
