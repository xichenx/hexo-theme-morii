'use strict';
const path = require('node:path');
const { safeURL, localFile, prepare } = require('../scripts/lib/images.cjs');
let sharp;
try { sharp = require('sharp'); } catch { /* Optional native dependency. */ }
const prepared = new Map();
hexo.extend.filter.register('before_generate', () => prepared.clear());
hexo.extend.generator.register('morii-images', async locals => {
  const settings = hexo.theme.config.images || {};
  if (settings.responsive === false) return [];
  if (!sharp) { hexo.log.warn('[Morii] Optional sharp dependency is unavailable. Keeping original covers and explicit srcset.'); return []; }
  const list = value => Array.isArray(value) ? value : value?.toArray?.() || [];
  const resources = [...list(locals.posts), ...list(locals.pages), ...Object.values(locals.data?.series || {})].filter(Boolean).flatMap(item => [item.cover, item.top_img]).filter(value => typeof value === 'string');
  const sources = [...new Set(resources)]; const processed = new Map(); let cursor = 0;
  const worker = async () => {
    while (cursor < sources.length) {
      const src = sources[cursor++], file = localFile(src, hexo);
      if (!file) continue;
      try {
        if (!processed.has(file)) processed.set(file, prepare(file, settings, sharp, path.join(hexo.base_dir, '.cache/morii-images')));
        const result = await processed.get(file); if (result) prepared.set(src, result);
      } catch { hexo.log.warn(`[Morii] Cannot optimize cover: ${src}. Keeping the original.`); }
    }
  };
  await Promise.all([worker(), worker()]);
  const variants = new Map();
  for (const item of prepared.values()) for (const variant of item.variants) variants.set(variant.src.slice(1), { path: variant.src.slice(1), data: variant.data });
  return [...variants.values()];
});
hexo.extend.helper.register('morii_cover', function (src, owner = {}, role = 'card') {
  const generated = prepared.get(src);
  const field = src === owner.top_img && owner.top_img !== owner.cover ? 'top_img' : 'cover';
  const width = Number(owner[`${field}_width`]), height = Number(owner[`${field}_height`]);
  const explicit = Array.isArray(owner[`${field}_srcset`]) ? owner[`${field}_srcset`].filter(item => item && safeURL(item.src) && Number.isInteger(item.width) && item.width > 0) : [];
  const hasDimensions = Number.isInteger(width) && Number.isInteger(height) && width > 0 && height > 0 && width <= 100000 && height <= 100000;
  const variants = explicit.length ? explicit : generated?.variants || [];
  return {
    src: safeURL(src) ? this.url_for(src) : undefined,
    width: hasDimensions ? width : generated?.width || 1200,
    height: hasDimensions ? height : generated?.height || 675,
    srcset: variants.length ? variants.map(item => `${this.url_for(item.src).replace(/,/g, '%2C')} ${item.width}w`).join(', ') : undefined,
    sizes: variants.length ? role === 'hero' ? '(min-width: 1440px) 1440px, 100vw' : '(max-width: 760px) calc(100vw - 32px), (max-width: 1100px) calc((100vw - 64px) / 2), 560px' : undefined,
    color: /^#[\da-f]{6}$/i.test(owner.cover_color || '') ? owner.cover_color : generated?.color
  };
});
