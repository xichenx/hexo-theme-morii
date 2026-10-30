'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const yaml = require('js-yaml');
const { plan, write } = require('../scripts/lib/init.cjs');
const { identity } = require('../scripts/lib/identity.cjs');
const { inspect } = require('../scripts/lib/config-check.cjs');
const temporary = () => fs.mkdtempSync(path.join(os.tmpdir(), 'morii-init-'));

test('minimal navigation and clock-only settings validate, incomplete or invalid weather settings are reported', () => {
  assert.deepEqual(inspect({ menu: false, explore: false, clock: { enable: true } }), []);
  assert.ok(inspect({ clock: { enable: true, latitude: 0 } }).some(item => item.level === 'warning'));
  assert.ok(inspect({ clock: { enable: true, latitude: true, longitude: 181, timezone: 'not/a-zone' } }).filter(item => item.level === 'error').length === 3);
});

test('identity inherits blog fields and preserves explicit and legacy theme overrides', () => {
  const site = { title: 'My notes', subtitle: 'Notebook', description: 'Ideas', author: 'Alice' };
  const minimal = identity(site, {});
  assert.equal(minimal.brand, 'My notes'); assert.equal(minimal.tagline, 'Notebook'); assert.equal(minimal.intro, 'Ideas'); assert.deepEqual(minimal.title, ['My notes', 'Notebook']); assert.ok(minimal.avatar.startsWith('/'));
  const custom = identity(site, { brand: 'Custom', tagline: false, intro: 'Hello', avatar: '/me.png', hero: { title: { 0: 'First', 1: 'Second' } } });
  assert.equal(custom.brand, 'Custom'); assert.equal(custom.tagline, ''); assert.equal(custom.intro, 'Hello'); assert.deepEqual(custom.title, ['First', 'Second']);
});

test('planning has no side effects and initialization can run twice without new files', () => {
  const root = temporary();
  try {
    const first = plan(root, { pages: 'about,categories,tags,album,music,cinema,series' });
    assert.deepEqual(fs.readdirSync(root), []); assert.equal(first.config.cinema.enable, true); assert.equal(first.config.music, undefined);
    write(first);
    assert.ok(fs.existsSync(path.join(root, 'source/about/index.md'))); assert.ok(!fs.existsSync(path.join(root, 'source/cinema/index.md')));
    assert.ok(fs.existsSync(path.join(root, 'source/_data/cinema.yml'))); assert.ok(fs.existsSync(path.join(root, 'source/_data/series.yml')));
    const config = fs.readFileSync(path.join(root, '_config.morii.yml'), 'utf8');
    assert.ok(!config.includes('brand:')); assert.ok(!config.includes('zh-CN:'));
    const second = plan(root, { pages: 'about,categories,tags,album,music,cinema,series' });
    assert.ok(second.files.every(file => file.state === 'unchanged')); write(second);
    assert.equal(fs.readFileSync(path.join(root, '_config.morii.yml'), 'utf8'), config); assert.ok(!fs.existsSync(path.join(root, '_config.morii.generated.yml')));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('existing configs, custom pages and alternate data formats are preserved byte for byte', () => {
  const root = temporary();
  try {
    const config = '# Keep my comments\nbrand: Custom\ncomments:\n  enable: true\n  env_id: my-existing-service\n';
    fs.writeFileSync(path.join(root, '_config.morii.yml'), config); fs.mkdirSync(path.join(root, 'source/_data'), { recursive: true });
    fs.writeFileSync(path.join(root, 'source/about.md'), '---\ntitle: About me\npermalink: /profile/\n---\nMy words');
    fs.writeFileSync(path.join(root, 'source/_data/album.json'), '[{"class_name":"Private edit"}]');
    const result = plan(root, { pages: 'about,album', comments: 'waline', serverURL: 'https://comments.example.test' });
    assert.equal(result.output, '_config.morii.generated.yml'); assert.equal(result.preservesConfig, true); assert.equal(result.config.menu.find(item => item.name === '关于').path, '/profile/');
    write(result);
    assert.equal(fs.readFileSync(path.join(root, '_config.morii.yml'), 'utf8'), config); assert.equal(fs.readFileSync(path.join(root, 'source/_data/album.json'), 'utf8'), '[{"class_name":"Private edit"}]');
    assert.ok(!fs.existsSync(path.join(root, 'source/about/index.md'))); assert.ok(!fs.existsSync(path.join(root, 'source/_data/album.yml')));
    assert.throws(() => plan(root, { pages: 'cinema' }), /already exists/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('invalid selections and linked source directories cannot create files outside the blog', () => {
  const root = temporary(), outside = temporary();
  try {
    for (const options of [{ pages: 'typo' }, { pages: true }, { output: '../config.yml' }, { comments: 'waline', serverURL: 'javascript:bad' }, { github: true }, { musicId: true }, { sourceDir: outside }]) assert.throws(() => plan(root, options));
    fs.symlinkSync(outside, path.join(root, 'source')); assert.throws(() => plan(root, { pages: 'about' }), /linked/);
    assert.deepEqual(fs.readdirSync(outside), []);
  } finally { fs.rmSync(root, { recursive: true, force: true }); fs.rmSync(outside, { recursive: true, force: true }); }
});

test('exclusive writes roll back new files if another process creates a destination after planning', () => {
  const root = temporary();
  try {
    const result = plan(root, { pages: 'about,album' }); fs.writeFileSync(path.join(root, '_config.morii.yml'), '# Someone else\n');
    assert.throws(() => write(result), /EEXIST/); assert.equal(fs.readFileSync(path.join(root, '_config.morii.yml'), 'utf8'), '# Someone else\n');
    assert.ok(!fs.existsSync(path.join(root, 'source/about/index.md'))); assert.ok(!fs.existsSync(path.join(root, 'source/_data/album.yml')));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
