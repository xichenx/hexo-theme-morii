'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { buildDemo } = require('../tools/demo.cjs');
const pages = ['index.html', 'page/2/index.html', 'posts/welcome/index.html', 'archives/index.html', 'categories/index.html', 'tags/index.html', 'about/index.html', 'link/index.html', 'album/index.html', 'album/morii/index.html', 'music/index.html', 'reading-list/index.html', '404.html'];

test('theme builds independently at both domain root and a Pages subdirectory', async t => {
  for (const prefix of ['/', '/hexo-theme-morii/']) await t.test(prefix, async () => {
    const output = await buildDemo({ root: prefix, url: 'https://example.test' });
    for (const file of pages) {
      assert.ok(fs.existsSync(path.join(output, file)), `Generated ${file}`);
      const dom = new JSDOM(fs.readFileSync(path.join(output, file), 'utf8'), { url: `https://example.test${prefix}${file}` });
      const document = dom.window.document;
      assert.equal(document.querySelectorAll('main h1').length, 1, `${file}: one page heading`);
      assert.ok(document.querySelector('#morii-audio-hub'), `${file}: shared music player`);
      assert.equal(document.querySelectorAll('#comment-service').length, 0, 'Demo must not use a personal comment service');
      for (const node of document.querySelectorAll('script[src],link[rel="stylesheet"],img[src]')) {
        const raw = node.getAttribute('src') || node.getAttribute('href');
        const url = new URL(raw, dom.window.location.href);
        if (url.origin !== 'https://example.test') continue;
        assert.ok(url.pathname.startsWith(prefix), `${file}: ${raw} must stay within deployment root`);
        const local = decodeURIComponent(url.pathname.slice(prefix.length));
        assert.ok(fs.existsSync(path.join(output, local)), `${file}: missing asset ${local}`);
      }
      for (const link of document.querySelectorAll('.site-nav a, .footer-explore a')) {
        const url = new URL(link.href);
        assert.ok(url.pathname.startsWith(prefix), `${file}: navigation root`);
        const local = decodeURIComponent(url.pathname.slice(prefix.length));
        assert.ok(fs.existsSync(path.join(output, local, 'index.html')), `${file}: navigation ${local}`);
      }
      const music = JSON.parse(document.querySelector('#morii-audio-hub').dataset.musicConfig);
      assert.ok(music.remote && music.remote.api.startsWith('https://'));
      dom.window.close();
    }
    const index = JSON.parse(fs.readFileSync(path.join(output, 'morii-search.json'), 'utf8'));
    assert.ok(JSON.stringify(index).includes('欢迎使用 Morii'));
    const article = fs.readFileSync(path.join(output, 'posts/welcome/index.html'), 'utf8');
    assert.ok(article.includes('folding-tag'), 'Compatibility tags render without the old theme');
    assert.ok(fs.existsSync(path.join(output, '.nojekyll')));
  });
});
