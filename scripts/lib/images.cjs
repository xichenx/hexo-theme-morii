'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { createHash, randomUUID } = require('node:crypto');
const safeURL = value => {
  if (typeof value !== 'string' || !value.trim() || /[\\\u0000-\u0020]/.test(value) || value.startsWith('//')) return '';
  if (/^[a-z][\w+.-]*:/i.test(value)) { try { if (!/^https?:$/.test(new URL(value).protocol)) return ''; } catch { return ''; } }
  return value;
};
function localFile(value, hexo) {
  let name = safeURL(value);
  if (!name) return null;
  if (/^https?:/i.test(name)) { try { const url = new URL(name); if (url.origin !== new URL(hexo.config.url).origin) return null; name = url.pathname; } catch { return null; } }
  try { name = decodeURIComponent(name.split(/[?#]/)[0]); } catch { return null; }
  const root = String(hexo.config.root || '/');
  if (root !== '/' && name.startsWith(root)) name = name.slice(root.length);
  name = name.replace(/^\//, '');
  if (name.split('/').some(part => part === '..') || !/\.(?:jpe?g|png|webp|avif)$/i.test(name)) return null;
  for (const directory of [hexo.source_dir, path.join(hexo.theme_dir, 'source')]) {
    try {
      const base = fs.realpathSync(directory);
      const file = fs.realpathSync(path.join(base, name));
      if (file.startsWith(base + path.sep) && fs.statSync(file).isFile()) return file;
    } catch { /* Resource may belong to the other source directory. */ }
  }
  return null;
}
async function prepare(file, settings, sharp, cacheDirectory) {
  const data = fs.readFileSync(file);
  fs.mkdirSync(cacheDirectory, { recursive: true });
  const sourceHash = createHash('sha256').update(data).update(sharp.versions.sharp).digest('hex').slice(0, 16);
  const infoPath = path.join(cacheDirectory, `${sourceHash}-info.json`);
  let info;
  try { info = JSON.parse(fs.readFileSync(infoPath, 'utf8')); } catch { /* First build or stale cache. */ }
  if (!info || !Number.isInteger(info.width) || !Number.isInteger(info.height) || info.width <= 0 || info.height <= 0 || !/^#[a-f0-9]{6}$/i.test(info.color || '')) {
    const meta = await sharp(data, { limitInputPixels: 40000000 }).metadata();
    if (!meta.width || !meta.height || meta.pages > 1) return null;
    const rotated = [5, 6, 7, 8].includes(meta.orientation);
    const stats = await sharp(data, { limitInputPixels: 40000000 }).stats();
    info = { width: rotated ? meta.height : meta.width, height: rotated ? meta.width : meta.height, color: '#' + ['r', 'g', 'b'].map(key => stats.dominant[key].toString(16).padStart(2, '0')).join('') };
    fs.writeFileSync(infoPath, JSON.stringify(info));
  }
  const { width, height, color } = info;
  const widths = [...new Set((Array.isArray(settings.widths) ? settings.widths : [480, 800, 1200]).filter(value => Number.isInteger(value) && value >= 160 && value <= 2400).map(value => Math.min(value, width)))].sort((a, b) => a - b);
  const quality = Math.max(40, Math.min(95, Number(settings.quality) || 78));
  const variants = [];
  const hash = createHash('sha256').update(data).update(`webp:${quality}:${sharp.versions.sharp}`).digest('hex').slice(0, 16);
  fs.mkdirSync(cacheDirectory, { recursive: true });
  for (const size of widths) {
    const name = `${hash}-${size}.webp`, cached = path.join(cacheDirectory, name);
    if (!fs.existsSync(cached)) {
      const temporary = `${cached}.${randomUUID()}.tmp`;
      try { await sharp(data, { limitInputPixels: 40000000 }).rotate().resize({ width: size, withoutEnlargement: true }).webp({ quality }).toFile(temporary); fs.renameSync(temporary, cached); }
      finally { fs.rmSync(temporary, { force: true }); }
    }
    variants.push({ src: `/images/morii/${name}`, width: size, data: () => fs.createReadStream(cached) });
  }
  return { width, height, color, variants };
}
module.exports = { safeURL, localFile, prepare };
