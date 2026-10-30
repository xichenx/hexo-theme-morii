'use strict';
const path = require('node:path');
const { collect } = require('../scripts/lib/assets.cjs');
let assets;
const current = () => assets || (assets = collect(path.join(hexo.theme_dir, 'source')));
hexo.extend.filter.register('before_generate', () => { assets = collect(path.join(hexo.theme_dir, 'source')); });
hexo.extend.helper.register('morii_asset', function (name) {
  const key = String(name).replace(/^\//, '');
  const asset = current().get(key);
  if (!asset) throw new Error(`Unknown Morii asset: ${name}`);
  return this.url_for('/' + asset.path);
});
hexo.extend.generator.register('morii-assets', () => [...current().values()]);
