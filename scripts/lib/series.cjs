'use strict';
const list = value => Array.isArray(value) ? value : value?.toArray?.() || [];
const keyFor = value => typeof value === 'string' && /^[\p{L}\p{N}][\p{L}\p{N}_-]{0,79}$/u.test(value.trim()) ? value.trim() : '';
const order = value => value !== '' && value != null && Number.isFinite(Number(value)) ? Number(value) : Infinity;
function catalog(posts, metadata = {}) {
  const groups = new Map();
  for (const post of list(posts)) {
    const key = keyFor(post?.series);
    if (!key || !post.path || post.published === false) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(post);
  }
  return [...groups].map(([key, entries]) => {
    const meta = metadata && typeof metadata === 'object' && !Array.isArray(metadata) && Object.hasOwn(metadata, key) ? metadata[key] || {} : {};
    const seen = new Set();
    const posts = entries.filter(post => { if (seen.has(post.path)) return false; seen.add(post.path); return true; }).sort((a, b) => {
      const explicit = order(a.series_order) - order(b.series_order);
      return (Number.isNaN(explicit) ? 0 : explicit) || (Number(a.date) || 0) - (Number(b.date) || 0) || String(a.path).localeCompare(String(b.path));
    });
    return { key, path: `series/${key}/`, title: meta.title || key, description: meta.description || '', cover: meta.cover || '', cover_width: meta.cover_width, cover_height: meta.cover_height, cover_srcset: meta.cover_srcset, order: order(meta.order), posts };
  }).sort((a, b) => (a.order - b.order || 0) || a.key.localeCompare(b.key));
}
module.exports = { catalog, keyFor };
