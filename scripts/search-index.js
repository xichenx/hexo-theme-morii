'use strict';

const { createHash } = require('node:crypto');
let indexPath = '/morii-search.json';
hexo.extend.helper.register('morii_search_index', () => indexPath);
const { stripHTML, unescapeHTML } = require('hexo-util');
const list = value => Array.isArray(value) ? value : value?.toArray?.() || [];
const plain = value => unescapeHTML(stripHTML(String(value || '')
  .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<td\b[^>]*class=["'][^"']*\bgutter\b[^"']*["'][^>]*>[\s\S]*?<\/td>/gi, ' ')
  .replace(/<\/(?:p|div|li|h[1-6]|pre|section)>|<br\s*\/?>/gi, ' ')))
  .replace(/&#(?:x([\da-f]+)|(\d+));/gi, (entity, hex, decimal) => {
    const point = Number.parseInt(hex || decimal, hex ? 16 : 10);
    return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff) ? String.fromCodePoint(point) : entity;
  }).replace(/\s+/g, ' ').trim();

hexo.extend.generator.register('morii-search-index', locals => {
  const root = '/' + String(hexo.config.root || '/').split('/').filter(Boolean).join('/');
  const prefix = root === '/' ? '/' : root + '/';
  const entries = list(locals.posts).filter(post => post?.path && post.published !== false).sort((a, b) => (Number(b.date) || 0) - (Number(a.date) || 0)).map(post => ({
    title: plain(post.title),
    url: prefix + String(post.path).replace(/^\/+/, ''),
    date: post.date?.format?.('YYYY.MM.DD') || '',
    protected: Boolean(post.password),
    content: post.password ? '' : plain(`${post.description || ''} ${post.excerpt || ''} ${hexo.theme.config.search?.content === false ? '' : post.content || ''}`),
    categories: post.password ? [] : list(post.categories).map(item => plain(item?.name)).filter(Boolean),
    topics: post.password ? '' : [...new Set([...list(post.categories), ...list(post.tags)].map(item => plain(item?.name)).filter(Boolean))].join(' ')
  }));
  const size = Math.max(20, Math.min(500, Math.floor(Number(hexo.theme.config.search?.shard_size) || 100)));
  const routes = [];
  let index = entries;
  const hash = value => createHash('sha256').update(value).digest('hex').slice(0, 12);
  if (entries.length > size) {
    const shards = [];
    for (let start = 0; start < entries.length; start += size) {
      const data = JSON.stringify(entries.slice(start, start + size));
      const path = `search/part-${start / size}.${hash(data)}.json`;
      routes.push({ path, data }); shards.push(prefix + path);
    }
    index = { version: 2, entries: entries.map(({ content, ...entry }) => entry), shards };
  }
  const data = JSON.stringify(index);
  indexPath = `/morii-search.${hash(data)}.json`;
  return [...routes, { path: 'morii-search.json', data }, { path: indexPath.slice(1), data }];
});
