'use strict';

const { stripHTML, unescapeHTML } = require('hexo-util');
const list = value => Array.isArray(value) ? value : value?.toArray?.() || [];
const stamp = value => {
  if (value == null || value === '') return NaN;
  const numeric = Number(value);
  return new Date(Number.isFinite(numeric) ? numeric : value).getTime();
};
const bounded = (value, fallback, max) => Number.isFinite(Number(value)) && Number(value) > 0 ? Math.min(max, Math.floor(Number(value))) || fallback : fallback;

hexo.extend.helper.register('morii_popular_tags', tags => {
  const limit = bounded(hexo.theme.config.sidebar?.tags?.limit, 12, 40);
  return list(tags).filter(tag => tag?.path && tag.posts?.length > 0)
    .map(tag => ({ name: tag.name, path: tag.path, count: tag.posts.length }))
    .sort((a, b) => b.count - a.count || String(a.name).localeCompare(String(b.name), 'zh-CN')).slice(0, limit);
});

hexo.extend.helper.register('morii_site_stats', posts => {
  const published = list(posts).filter(post => post && post.published !== false);
  let words = 0;
  const dates = [];
  published.forEach(post => {
    const date = stamp(post.date);
    if (Number.isFinite(date)) dates.push(date);
    if (post.password) return;
    const source = String(post.content || '').replace(/<(pre|figure|script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
    const text = unescapeHTML(stripHTML(source));
    words += (text.match(/[\u3400-\u9fff]/g) || []).length;
    words += (text.replace(/[\u3400-\u9fff]/g, ' ').match(/[\p{L}\p{N}]+/gu) || []).length;
  });
  return { posts: published.length, words, firstPost: dates.length ? new Date(dates.reduce((first, value) => Math.min(first, value), Infinity)) : null };
});

hexo.extend.helper.register('morii_outdated_notice', (post, now = Date.now()) => {
  const settings = hexo.theme.config.article?.outdated || {};
  if (settings.enable !== true || !post || post.password || post.outdated === false) return null;
  let updated = stamp(post.updated);
  if (!Number.isFinite(updated)) updated = stamp(post.date);
  if (!Number.isFinite(updated)) return null;
  const limit = bounded(settings.days, 365, 36500);
  return { updated: new Date(updated).toISOString(), limit, days: Math.max(0, Math.floor((Number(now) - updated) / 86400000)) };
});
