'use strict';

const { forPage } = require('../scripts/lib/i18n.cjs');
const list = value => Array.isArray(value) ? value : value?.toArray?.() || [];
const names = value => new Set(list(value).map(item => typeof item === 'string' ? item : item?.name).filter(Boolean));

hexo.extend.helper.register('morii_related_posts', function (current, posts) {
  const t = (...args) => forPage(hexo, this).t(...args);
  const settings = hexo.theme.config.article?.related || {};
  if (settings.enable === false || !current || current.password) return [];
  const limit = Math.max(1, Math.min(6, Math.floor(Number(settings.limit) || 3)));
  const tags = names(current.tags);
  const categories = names(current.categories);
  const seen = new Set([current.path]);
  return list(posts).filter(post => {
    if (!post?.path || post.password || post.published === false || seen.has(post.path)) return false;
    seen.add(post.path);
    return true;
  }).map(post => {
    const sharedTags = [...names(post.tags)].filter(name => tags.has(name));
    const sharedCategories = [...names(post.categories)].filter(name => categories.has(name));
    return { post, score: sharedTags.length * 3 + sharedCategories.length, reason: sharedTags.length ? t("共同标签 · {0}", sharedTags[0]) : t("同一分类 · {0}", sharedCategories[0]) };
  }).filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || (Number(b.post.date) || 0) - (Number(a.post.date) || 0) || String(a.post.path).localeCompare(String(b.post.path)))
    .slice(0, limit);
});
