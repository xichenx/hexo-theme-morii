'use strict';

const { stripHTML, unescapeHTML } = require('hexo-util');
const list = value => Array.isArray(value) ? value : value?.toArray?.() || [];
const plain = value => typeof value === 'string' ? unescapeHTML(stripHTML(value.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' '))).replace(/\s+/g, ' ').trim() : '';

hexo.extend.helper.register('morii_home_moments', data => {
  const configured = Number(hexo.theme.config.home?.moments?.limit);
  const limit = Number.isFinite(configured) && configured > 0 ? Math.max(1, Math.min(10, Math.floor(configured))) : 5;
  return list(data).flatMap((group, groupIndex) => {
    if (!group || group.home_essay !== true) return [];
    const groupLimit = Number(group.limit) > 0 ? Math.floor(Number(group.limit)) : 100;
    return list(group.essay_list).slice(0, groupLimit).flatMap((note, noteIndex) => {
      const content = plain(note?.content);
      if (!content) return [];
      const stamp = Date.parse(String(note.date || '').replace(/\//g, '-'));
      return [{ content, path: `/essay/#moment-${groupIndex + 1}-${noteIndex + 1}`, date: Number.isFinite(stamp) ? new Date(stamp) : null, stamp: Number.isFinite(stamp) ? stamp : 0 }];
    });
  }).sort((a, b) => b.stamp - a.stamp).slice(0, limit);
});

hexo.extend.helper.register('morii_discovery_posts', posts => {
  const seen = new Set();
  return list(posts).filter(post => {
    if (!post?.path || post.password || post.published === false || seen.has(post.path)) return false;
    seen.add(post.path);
    return true;
  }).sort((a, b) => (Number(b.date) || 0) - (Number(a.date) || 0));
});
