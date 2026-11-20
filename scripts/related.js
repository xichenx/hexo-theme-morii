'use strict';

const { forPage } = require('../scripts/lib/i18n.cjs');
const list = value => Array.isArray(value) ? value : value?.toArray?.() || [];
const names = value => new Set(list(value).map(item => typeof item === 'string' ? item : item?.name).filter(Boolean));
const stamp = value => value == null || value === '' ? NaN : new Date(typeof value === 'string' ? value : Number(value)).getTime();

hexo.extend.helper.register('morii_related_posts', function (current, posts) {
  const t = (...args) => forPage(hexo, this).t(...args);
  const settings = hexo.theme.config.article?.related || {};
  if (settings.enable === false || !current || current.password) return [];
  const limit = Math.max(1, Math.min(6, Math.floor(Number(settings.limit) || 3)));
  const dateType = [current.related_date_type, settings.date_type].find(value => value === 'created' || value === 'updated');
  const tags = names(current.tags);
  const categories = names(current.categories);
  const seen = new Set([current.path]);
  return list(posts).filter(post => {
    if (!post?.path || post.password || post.published === false || seen.has(post.path)) return false;
    seen.add(post.path);
    return true;
  }).flatMap(post => {
    const sharedTags = [...names(post.tags)].filter(name => tags.has(name));
    const sharedCategories = [...names(post.categories)].filter(name => categories.has(name));
    const score = sharedTags.length * 3 + sharedCategories.length;
    if (!score) return [];
    const updated = dateType === 'updated' ? stamp(post.updated) : NaN;
    const usesUpdated = Number.isFinite(updated);
    const time = usesUpdated ? updated : stamp(post.date);
    const date = Number.isFinite(time) ? new Date(time) : null;
    return [{ post, date, usesUpdated, score, reason: sharedTags.length ? t("共同标签 · {0}", sharedTags[0]) : t("同一分类 · {0}", sharedCategories[0]) }];
  })
    .sort((a, b) => b.score - a.score || (b.date?.getTime() ?? -Infinity) - (a.date?.getTime() ?? -Infinity) || String(a.post.path).localeCompare(String(b.post.path)))
    .slice(0, limit);
});
