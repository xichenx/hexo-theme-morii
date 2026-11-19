'use strict';

const { forPage } = require('../scripts/lib/i18n.cjs');
const list = collection => Array.isArray(collection) ? [...collection] : collection?.toArray?.() || [];
const timestamp = value => Number(value) || 0;

hexo.extend.helper.register('morii_selected_posts', posts => {
  const config = hexo.theme.config.home || {};
  const limit = Math.max(1, Math.min(6, Math.floor(Number(config.selected_limit) || 3)));
  const available = list(posts).filter(post => !post.password);
  const chosen = [];
  const add = post => { if (post && !chosen.includes(post)) chosen.push(post); };
  (Array.isArray(config.selected_posts) ? config.selected_posts : []).forEach(key => {
    add(available.find(post => [post.title, post.path, post.slug].includes(key)));
  });
  available.filter(post => post.featured === true).sort((a, b) => timestamp(b.date) - timestamp(a.date)).forEach(add);
  if (!chosen.length) available.sort((a, b) => timestamp(b.date) - timestamp(a.date)).slice(0, limit).forEach(add);
  return chosen.slice(0, limit);
});

hexo.extend.helper.register('morii_categories', (categories, limit = 8) => list(categories)
  .map(category => ({ name: category.name, path: category.path, count: category.posts?.length || 0 }))
  .filter(category => category.count > 0)
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'))
  .slice(0, limit));

hexo.extend.helper.register('morii_tag_directory', function (tags) {
  const collator = new Intl.Collator(forPage(hexo, this).locale, { numeric: true });
  const entries = list(tags).map(tag => ({ name: tag.name, path: tag.path, count: tag.posts?.length || 0 }))
    .filter(tag => tag.count > 0 && tag.path);
  entries.sort((a, b) => collator.compare(a.name, b.name) || a.path.localeCompare(b.path, 'en'));
  entries.forEach((tag, index) => { tag.nameOrder = index; });
  return entries.sort((a, b) => b.count - a.count || a.nameOrder - b.nameOrder);
});

hexo.extend.helper.register('morii_archive_years', posts => {
  const years = new Map();
  list(posts).forEach(post => {
    const year = post.date?.format?.('YYYY') || String(new Date(post.date).getFullYear());
    if (!/^\d{4}$/.test(year)) return;
    years.set(year, (years.get(year) || 0) + 1);
  });
  const archiveDir = String(hexo.config.archive_dir || 'archives').replace(/^\/+|\/+$/g, '');
  return [...years].sort(([a], [b]) => Number(b) - Number(a)).map(([year, count]) => ({ year, count, path: `${archiveDir}/${year}/` }));
});

let archiveMonthIndex;
hexo.extend.filter.register('before_generate', () => { archiveMonthIndex = undefined; });
hexo.extend.helper.register('morii_archive_months', () => {
  const settings = hexo.config.archive_generator;
  if (!settings?.yearly || !settings.monthly || settings.enabled === false) return [];
  if (archiveMonthIndex) return archiveMonthIndex;

  const counts = new Map();
  for (const post of list(hexo.locals.get('posts'))) {
    const key = post.date?.format?.('YYYY-MM');
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(key)) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const archiveDir = String(hexo.config.archive_dir || 'archives').replace(/^\/+|\/+$/g, '');
  const years = new Map();
  for (const key of [...counts.keys()].sort().reverse()) {
    const [year, month] = key.split('-');
    if (!years.has(year)) years.set(year, { year, months: [] });
    years.get(year).months.push({ month: Number(month), count: counts.get(key), path: `${archiveDir}/${year}/${month}/` });
  }
  archiveMonthIndex = [...years.values()];
  return archiveMonthIndex;
});

hexo.extend.helper.register('morii_archive_groups', posts => {
  const groups = new Map();
  list(posts).sort((a, b) => timestamp(b.date) - timestamp(a.date)).forEach(post => {
    const year = post.date?.format?.('YYYY') || String(new Date(post.date).getFullYear());
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(post);
  });
  return [...groups].map(([year, entries]) => ({ year, entries }));
});

hexo.extend.helper.register('morii_pagination', function (page) {
  const t = (...args) => forPage(hexo, this).t(...args);
  const total = Math.max(1, Math.floor(Number(page.total) || 1));
  const current = Math.max(1, Math.min(total, Math.floor(Number(page.current) || 1)));
  if (total < 2) return [];
  const base = String(page.base || '').replace(/\/?$/, '/').replace(/^\/$/, '');
  const directory = String((page.__index && hexo.config.index_generator?.pagination_dir) || hexo.config.pagination_dir || 'page').replace(/^\/+|\/+$/g, '');
  const pathFor = number => number === 1 ? base : `${base}${directory}/${number}/`;
  const numbers = total <= 7 ? Array.from({ length: total }, (_, index) => index + 1) : [...new Set([1, current - 1, current, current + 1, total])].filter(number => number >= 1 && number <= total).sort((a, b) => a - b);
  const items = [];
  if (current > 1) items.push({ label: '←', path: page.prev_link ?? pathFor(current - 1), rel: 'prev', aria: t("上一页") });
  numbers.forEach((number, index) => {
    const gap = number - numbers[index - 1];
    if (index && gap === 2) items.push({ label: number - 1, path: pathFor(number - 1), aria: t("第 {0} 页", number - 1) });
    else if (index && gap > 2) items.push({ gap: true });
    items.push({ label: number, path: pathFor(number), current: number === current, aria: t("第 {0} 页", number) });
  });
  if (current < total) items.push({ label: '→', path: page.next_link || pathFor(current + 1), rel: 'next', aria: t("下一页") });
  return items;
});
