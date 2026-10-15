'use strict';

const { stripHTML, unescapeHTML } = require('hexo-util');
const list = value => Array.isArray(value) ? value : value?.toArray?.() || [];
const plain = value => unescapeHTML(stripHTML(String(value || '')
  .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<td\b[^>]*class=["'][^"']*\bgutter\b[^"']*["'][^>]*>[\s\S]*?<\/td>/gi, ' ')
  .replace(/<\/(?:p|div|li|h[1-6]|pre|section)>|<br\s*\/?>/gi, ' '))).replace(/\s+/g, ' ').trim();

hexo.extend.generator.register('morii-search-index', locals => {
  const root = '/' + String(hexo.config.root || '/').split('/').filter(Boolean).join('/');
  const prefix = root === '/' ? '/' : root + '/';
  const entries = list(locals.posts).filter(post => post?.path && post.published !== false).sort((a, b) => (Number(b.date) || 0) - (Number(a.date) || 0)).map(post => ({
    title: plain(post.title),
    url: prefix + String(post.path).replace(/^\/+/, ''),
    date: post.date?.format?.('YYYY.MM.DD') || '',
    protected: Boolean(post.password),
    content: post.password ? '' : plain(`${post.description || ''} ${post.excerpt || ''} ${hexo.theme.config.search?.content === false ? '' : post.content || ''}`),
    topics: post.password ? '' : [...list(post.categories), ...list(post.tags)].map(item => plain(item?.name)).filter(Boolean).join(' ')
  }));
  return { path: 'morii-search.json', data: JSON.stringify(entries) };
});
