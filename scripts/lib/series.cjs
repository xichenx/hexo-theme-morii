'use strict';
const list = value => Array.isArray(value) ? value : value?.toArray?.() || [];
const keyFor = value => typeof value === 'string' && /^[\p{L}\p{N}][\p{L}\p{N}_-]{0,79}$/u.test(value.trim()) ? value.trim() : '';
const order = value => value !== '' && value != null && Number.isFinite(Number(value)) ? Number(value) : Infinity;
const titleCollator = new Intl.Collator(undefined, { numeric: true });
const byDate = (a, b) => (Number(a.date) || 0) - (Number(b.date) || 0);
const byTitle = (a, b) => titleCollator.compare(a.title ?? '', b.title ?? '');
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
    const compareChapters = meta.order_by === 'title' ? byTitle : byDate;
    const direction = meta.order_direction === 'desc' ? -1 : 1;
    const seen = new Set();
    const posts = entries.filter(post => { if (seen.has(post.path)) return false; seen.add(post.path); return true; }).sort((a, b) => {
      const orderA = order(a.series_order);
      const orderB = order(b.series_order);
      if (orderA !== orderB) return orderA - orderB;
      return direction * compareChapters(a, b) || String(a.path).localeCompare(String(b.path));
    });
    return { key, path: `series/${key}/`, title: meta.title || key, description: meta.description || '', cover: meta.cover || '', cover_width: meta.cover_width, cover_height: meta.cover_height, cover_srcset: meta.cover_srcset, order: order(meta.order), posts };
  }).sort((a, b) => (a.order - b.order || 0) || a.key.localeCompare(b.key));
}
module.exports = { catalog, keyFor };
