'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { localFile, prepare, safeURL } = require('../scripts/lib/images.cjs');
let sharp; try { sharp = require('sharp'); } catch {}

test('local image lookup stays in the configured sources and never downloads remote resources', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'morii-images-'));
  try {
    const source = path.join(root, 'source'); fs.mkdirSync(source); fs.writeFileSync(path.join(source, 'cover.jpg'), 'image');
    const site = { source_dir: source, theme_dir: root, config: { root: '/blog/', url: 'https://example.test/blog/' } };
    assert.equal(localFile('/blog/cover.jpg', site), fs.realpathSync(path.join(source, 'cover.jpg')));
    assert.equal(localFile('https://example.test/blog/cover.jpg', site), fs.realpathSync(path.join(source, 'cover.jpg')));
    assert.equal(localFile('https://outside.test/cover.jpg', site), null); assert.equal(localFile('/%2e%2e/private.jpg', site), null);
    fs.symlinkSync(path.join(root, 'outside.jpg'), path.join(source, 'escape.jpg')); fs.writeFileSync(path.join(root, 'outside.jpg'), 'outside');
    assert.equal(localFile('/escape.jpg', site), null); assert.equal(safeURL('javascript:alert(1)'), ''); assert.equal(safeURL('//outside.test/x'), '');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('responsive covers are real WebP files, preserve aspect ratios, reuse cache and avoid upscaling', { skip: !sharp }, async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'morii-variants-'));
  try {
    const file = path.join(root, 'cover.png');
    await sharp({ create: { width: 960, height: 540, channels: 3, background: '#347a60' } }).png().toFile(file);
    const output = await prepare(file, { widths: [480, 800, 1200], quality: 78 }, sharp, path.join(root, 'cache'));
    assert.equal(output.width, 960); assert.equal(output.height, 540); assert.match(output.color, /^#[a-f0-9]{6}$/i);
    assert.deepEqual(output.variants.map(item => item.width), [480, 800, 960]);
    const first = path.join(root, 'cache', path.basename(output.variants[0].src)); const stamp = fs.statSync(first).mtimeMs;
    const meta = await sharp(first).metadata(); assert.equal(meta.format, 'webp'); assert.equal(meta.width, 480); assert.equal(meta.height, 270);
    await prepare(file, { widths: [480, 800, 1200], quality: 78 }, sharp, path.join(root, 'cache')); assert.equal(fs.statSync(first).mtimeMs, stamp);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('explicit remote candidates and reserved dimensions work without the optional image library', () => {
  const vm = require('node:vm'); let cover;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../scripts/images.js'), 'utf8'), { require: name => { if (name === 'sharp') throw Error('optional'); return require(name); }, hexo: { extend: { filter: { register() {} }, generator: { register() {} }, helper: { register(name, fn) { cover = fn; } } } } });
  const context = { url_for: src => src.startsWith('/') ? '/blog' + src : src };
  const result = cover.call(context, 'https://cdn.test/cover.webp', { cover_width: 1600, cover_height: 900, cover_srcset: [{ src: 'https://cdn.test/480.webp', width: 480 }, { src: '/covers/800.webp', width: 800 }, { src: 'javascript:bad', width: 900 }] });
  assert.equal(result.width, 1600); assert.equal(result.height, 900); assert.match(result.srcset, /\/blog\/covers\/800.webp 800w/); assert.ok(!result.srcset.includes('javascript'));
  assert.equal(cover.call(context, 'javascript:bad').src, undefined);
});
