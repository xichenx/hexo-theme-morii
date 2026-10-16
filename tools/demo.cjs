'use strict';
const fs = require('node:fs');
const path = require('node:path');
const Hexo = require('hexo');
const yaml = require('js-yaml');
const repository = path.resolve(__dirname, '..');
const manifest = require('../package.json');

async function buildDemo({ root = process.env.MORII_DEMO_ROOT || '/', url = process.env.MORII_DEMO_URL || 'https://example.test', themeOverrides = {} } = {}) {
  if (!root.startsWith('/') || root.startsWith('//') || !root.endsWith('/') || /[?#\\]|\.\./.test(root)) throw new Error('Demo root must be an absolute directory path ending in /.');
  const base = new URL(url);
  if (!/^https?:$/.test(base.protocol) || base.username || base.password) throw new Error('Demo URL must use HTTP(S) without credentials.');
  const site = path.join(repository, '.cache', 'demo');
  fs.rmSync(site, { recursive: true, force: true });
  fs.mkdirSync(path.join(site, 'themes'), { recursive: true });
  fs.cpSync(path.join(repository, 'demo/source'), path.join(site, 'source'), { recursive: true });
  // The fixture resolves only the dependencies declared by the standalone theme repo.
  const plugins = Object.fromEntries(Object.entries(manifest.devDependencies).filter(([name]) => name.startsWith('hexo-')));
  fs.writeFileSync(path.join(site, 'package.json'), JSON.stringify({ name: 'morii-demo', private: true, hexo: { version: manifest.devDependencies.hexo }, dependencies: plugins }));
  const theme = path.join(site, 'themes', 'morii');
  fs.mkdirSync(theme);
  for (const name of ['layout', 'scripts', 'source', '_config.yml', 'package.json']) fs.cpSync(path.join(repository, name), path.join(theme, name), { recursive: true });
  const config = yaml.load(fs.readFileSync(path.join(repository, 'demo/site.yml'), 'utf8'));
  fs.writeFileSync(path.join(site, '_config.yml'), yaml.dump({ ...config, root, url: new URL(root, base).href.replace(/\/$/, '') }));
  const demoTheme = yaml.load(fs.readFileSync(path.join(repository, 'demo/theme.yml'), 'utf8'));
  fs.writeFileSync(path.join(site, '_config.morii.yml'), yaml.dump({ ...demoTheme, ...themeOverrides }));
  const hexo = new Hexo(site, { silent: true });
  const errors = [];
  hexo.log.error = (...args) => errors.push(args.map(arg => arg?.stack || String(arg)).join(' '));
  try {
    await hexo.init();
    await hexo.call('generate', { force: true });
    if (errors.length) throw new Error(`Hexo reported build errors:\n${errors.join('\n')}`);
  } finally { await hexo.exit(); }
  fs.writeFileSync(path.join(site, 'public', '.nojekyll'), '');
  return path.join(site, 'public');
}
module.exports = { buildDemo };
if (require.main === module) buildDemo().then(output => console.log(`Demo built: ${output}`)).catch(error => { console.error(error); process.exitCode = 1; });
