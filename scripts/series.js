'use strict';
const { catalog, keyFor } = require('../scripts/lib/series.cjs');
const { forPage } = require('../scripts/lib/i18n.cjs');
let cache;
const enabled = () => hexo.theme.config.series?.enable !== false;
const current = site => cache || (cache = catalog(site.posts, site.data?.series));
const localized = (item, context) => item && ({ ...item, title: forPage(hexo, context).localized(item.title) || item.key, description: forPage(hexo, context).localized(item.description) });
hexo.extend.filter.register('before_generate', () => { cache = null; });
hexo.extend.generator.register('morii-series', locals => {
  if (!enabled()) return [];
  for (const post of locals.posts?.toArray?.() || []) if (post.series && !keyFor(post.series)) hexo.log.warn(`[Morii] Invalid series key on ${post.title}. Use letters, numbers, hyphens or underscores.`);
  cache = catalog(locals.posts, locals.data?.series);
  const existing = new Set((locals.pages?.toArray?.() || []).map(page => page.path));
  const routes = [{ path: 'series/index.html', layout: 'series', data: { type: 'series_index', comments: false } }, ...cache.map(item => ({ path: `${item.path}index.html`, layout: 'series', data: { type: 'series_detail', series_key: item.key, comments: false } }))];
  return routes.filter(route => !existing.has(route.path));
});
hexo.extend.helper.register('morii_series_catalog', function () { return enabled() ? current(this.site).map(item => localized(item, this)) : []; });
hexo.extend.helper.register('morii_series', function (postOrKey) {
  if (!enabled()) return null;
  const key = keyFor(typeof postOrKey === 'string' ? postOrKey : postOrKey?.series);
  const group = current(this.site).find(item => item.key === key);
  if (!group) return null;
  const index = typeof postOrKey === 'object' ? group.posts.findIndex(post => post.path === postOrKey.path) : -1;
  return { ...localized(group, this), index, previous: index > 0 ? group.posts[index - 1] : null, next: index >= 0 ? group.posts[index + 1] || null : null };
});
