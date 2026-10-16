'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const manifest = require('../package.json');
const required = ['README.md', 'LICENSE', '_config.yml', 'package.json', 'layout', 'scripts', 'source'];
const optional = ['CHANGELOG.md'];
function metadata(tag = `v${manifest.version}`, version = manifest.version) {
  const match = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/.exec(tag);
  if (!match || match[4]?.split('.').some(part => /^0\d+$/.test(part))) throw new Error('Use a SemVer tag such as v0.1.0-alpha.1.');
  if (tag.slice(1) !== version) throw new Error(`Tag ${tag} does not match package.json version ${version}.`);
  return { tag, prerelease: Boolean(match[4]), archive: `hexo-theme-morii-${tag}.zip` };
}
function copyTree(source, destination) {
  const stat = fs.lstatSync(source);
  if (stat.isSymbolicLink()) throw new Error(`Release files must not contain symlinks: ${source}`);
  if (stat.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const entry of fs.readdirSync(source)) if (!['.DS_Store', 'Thumbs.db'].includes(entry)) copyTree(path.join(source, entry), path.join(destination, entry));
  } else if (stat.isFile()) fs.copyFileSync(source, destination);
  else throw new Error(`Unsupported release entry: ${source}`);
}
function pack(tag) {
  const info = metadata(tag);
  for (const name of required) if (!fs.existsSync(path.join(root, name))) throw new Error(`Missing theme file: ${name}`);
  const dist = path.join(root, 'dist');
  const cache = path.join(root, '.cache');
  fs.mkdirSync(dist, { recursive: true }); fs.mkdirSync(cache, { recursive: true });
  const stage = fs.mkdtempSync(path.join(cache, 'release-'));
  const folder = path.join(stage, 'morii'); fs.mkdirSync(folder);
  const archive = path.join(dist, info.archive);
  try {
    for (const name of [...required, ...optional.filter(name => fs.existsSync(path.join(root, name)))]) copyTree(path.join(root, name), path.join(folder, name));
    fs.rmSync(archive, { force: true });
    execFileSync('zip', ['-q', '-r', archive, 'morii'], { cwd: stage, stdio: 'inherit' });
    const hash = crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex');
    fs.writeFileSync(path.join(dist, 'SHA256SUMS.txt'), `${hash}  ${info.archive}\n`);
    const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
    const heading = `## [${manifest.version}]`;
    const start = changelog.indexOf(heading);
    if (start < 0) throw new Error(`Add ${heading} to CHANGELOG.md before packaging.`);
    const section = changelog.slice(start).split(/\n## /)[0];
    fs.writeFileSync(path.join(dist, 'RELEASE_NOTES.md'), `${section}\n\n安装：解压 ZIP，将 morii 目录放入 Hexo 的 themes/，安装 hexo-renderer-pug 并设置 theme: morii。许可证：MIT。\n`);
  } finally { fs.rmSync(stage, { recursive: true, force: true }); }
  return info;
}
module.exports = { metadata, pack };
if (require.main === module) {
  try {
    const [command, tag] = process.argv.slice(2);
    if (!['check', 'pack'].includes(command)) throw new Error('Usage: node tools/release.cjs check|pack [vVERSION]');
    const info = command === 'pack' ? pack(tag) : metadata(tag);
    for (const [key, value] of Object.entries(info)) console.log(`${key}=${value}`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
