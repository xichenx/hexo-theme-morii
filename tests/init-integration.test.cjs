'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Hexo = require('hexo');
const yaml = require('js-yaml');
const { JSDOM } = require('jsdom');
const { execFileSync } = require('node:child_process');
const repository = path.resolve(__dirname, '..');
const manifest = require('../package.json');
function fixture() {
  fs.mkdirSync(path.join(repository, '.cache'), { recursive: true });
  const base = fs.mkdtempSync(path.join(repository, '.cache/init-site-'));
  const theme = path.join(base, 'themes/morii'); fs.mkdirSync(theme, { recursive: true });
  for (const name of ['layout', 'scripts', 'source', 'languages', '_config.yml', 'package.json']) fs.cpSync(path.join(repository, name), path.join(theme, name), { recursive: true });
  fs.mkdirSync(path.join(base, 'content/_posts'), { recursive: true });
  fs.writeFileSync(path.join(base, 'content/_posts/first.md'), '---\ntitle: First note\ndate: 2026-10-01\n---\nA note of my own.');
  const plugins = Object.fromEntries(Object.entries(manifest.devDependencies).filter(([name]) => name.startsWith('hexo-')));
  fs.writeFileSync(path.join(base, 'package.json'), JSON.stringify({ name: 'morii-init-fixture', private: true, hexo: { version: manifest.devDependencies.hexo }, dependencies: plugins }));
  fs.writeFileSync(path.join(base, '_config.yml'), yaml.dump({ title: 'Alice notes', subtitle: 'A notebook', description: 'My own ideas', author: 'Alice', language: 'en', timezone: 'UTC', source_dir: 'content', theme: 'morii', root: '/blog/', url: 'https://example.test/blog/' }));
  return base;
}
async function run(base, action) {
  const hexo = new Hexo(base, { silent: true }); const errors = [];
  hexo.log.error = (...args) => errors.push(args.join(' '));
  try { await hexo.init(); await action(hexo); if (errors.length) throw Error(errors.join('\n')); } finally { await hexo.exit(); }
}

test('a clean site inherits identity, has no author services and generates no links to missing optional pages', async () => {
  const base = fixture();
  try {
    await run(base, async hexo => { await hexo.call('morii:check', { strict: true }); await hexo.call('generate', { force: true }); });
    const output = path.join(base, 'public'); const dom = new JSDOM(fs.readFileSync(path.join(output, 'index.html'), 'utf8'));
    const d = dom.window.document;
    assert.equal(d.querySelector('.brand__text').textContent, 'Alice notes'); assert.match(d.querySelector('.hero h1').textContent, /Alice notes/); assert.match(d.querySelector('.hero__main > p').textContent, /My own ideas/);
    assert.equal(d.querySelector('.profile-card h2').textContent, 'Alice'); assert.equal(d.querySelector('#comment-service, [data-weather-clock], .footer-runtime'), null);
    assert.equal(JSON.parse(d.querySelector('#morii-audio-hub').dataset.musicConfig).remote, null);
    for (const node of d.querySelectorAll('script[src],img[src],link[rel="stylesheet"]')) assert.ok(!/^https?:\/\//.test(node.getAttribute('src') || node.getAttribute('href')), node.outerHTML);
    for (const link of d.querySelectorAll('a[href]')) {
      const raw = link.getAttribute('href'); if (!raw.startsWith('/blog/')) continue;
      const file = decodeURIComponent(raw.slice('/blog/'.length).split(/[?#]/)[0]);
      assert.ok(fs.existsSync(path.join(output, file.endsWith('/') || !file ? file + 'index.html' : file)), `Missing default link ${raw}`);
    }
    assert.ok(!fs.existsSync(path.join(output, 'cinema/index.html'))); dom.window.close();
  } finally { fs.rmSync(base, { recursive: true, force: true }); }
});

test('the Hexo init command supports dry-run, creates pages under custom source_dir and builds on the next run', async () => {
  const base = fixture();
  try {
    const options = { pages: 'about,categories,tags,album,music,cinema,series', comments: 'waline', 'server-url': 'https://comments.example.test' };
    const outputPlan = execFileSync(process.execPath, [path.join(repository, 'node_modules/hexo/bin/hexo'), 'morii:init', '--pages', options.pages, '--comments', 'waline', '--server-url', options['server-url'], '--dry-run'], { cwd: base, encoding: 'utf8' });
    assert.match(outputPlan, /Morii plan/);
    assert.ok(!fs.existsSync(path.join(base, '_config.morii.yml'))); assert.ok(!fs.existsSync(path.join(base, 'content/about/index.md')));
    await run(base, async hexo => {
      await hexo.call('morii:init', options);
      const before = fs.readFileSync(path.join(base, '_config.morii.yml'), 'utf8');
      await hexo.call('morii:init', options); assert.equal(fs.readFileSync(path.join(base, '_config.morii.yml'), 'utf8'), before);
    });
    assert.ok(fs.existsSync(path.join(base, 'content/_data/cinema.yml'))); assert.ok(!fs.existsSync(path.join(base, 'source')));
    await run(base, async hexo => { await hexo.call('morii:check', { strict: true }); await hexo.call('generate', { force: true }); });
    const output = path.join(base, 'public');
    for (const name of ['about', 'categories', 'tags', 'album', 'music', 'cinema', 'series', 'comments']) assert.ok(fs.existsSync(path.join(output, name, 'index.html')), name);
    const dom = new JSDOM(fs.readFileSync(path.join(output, 'comments/index.html'), 'utf8'));
    assert.equal(dom.window.document.querySelector('#comment-service').dataset.provider, 'waline');
    assert.equal(dom.window.document.querySelector('h1').textContent, 'Guestbook'); dom.window.close();
  } finally { fs.rmSync(base, { recursive: true, force: true }); }
});

test('an enabled clock without coordinates ticks without weather requests', async () => {
  const base = fixture();
  try {
    fs.writeFileSync(path.join(base, '_config.morii.yml'), 'clock:\n  enable: true\n');
    await run(base, async hexo => { await hexo.call('morii:check', { strict: true }); await hexo.call('generate', { force: true }); });
    const dom = new JSDOM(fs.readFileSync(path.join(base, 'public/index.html'), 'utf8'), { url: 'https://example.test/blog/', runScripts: 'outside-only' });
    try {
      const d = dom.window.document, card = d.querySelector('[data-weather-clock]');
      assert.ok(card); assert.equal(card.dataset.timezone, 'UTC'); assert.equal(card.dataset.weatherUrl, '');
      assert.equal(card.querySelector('[data-weather-refresh]'), null);
      let requests = 0; dom.window.fetch = () => { requests++; throw Error('Unexpected weather request'); };
      dom.window.eval(fs.readFileSync(path.join(repository, 'source/js/clock.js'), 'utf8'));
      assert.match(card.querySelector('[data-clock-date]').textContent, /\d{4}/);
      d.dispatchEvent(new dom.window.Event('visibilitychange'));
      assert.equal(requests, 0);
    } finally { dom.window.close(); }
  } finally { fs.rmSync(base, { recursive: true, force: true }); }
});
