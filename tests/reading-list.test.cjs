'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync(path.join(__dirname, '../source/js/reading-list.js'), 'utf8');
const key = 'morii-reading-list';
const tick = () => new Promise(resolve => setImmediate(resolve));
const backup = (items, root = '/old/') => ({ format: 'morii-reading-list', version: 1, root, items });
async function fixture(saved = ['/blog/posts/android/', '/blog/posts/music/']) {
  const dom = new JSDOM(`<section data-reading-list data-index="/blog/morii-search.json" data-root="/blog/"><input id="reading-list-search"><div id="reading-list-no-match" hidden></div><button id="reading-list-reset-filter"></button><button id="reading-list-export"></button><button id="reading-list-import"></button><input id="reading-list-import-file" type="file"><p id="reading-list-transfer-status"></p><p id="reading-list-status"></p><button id="reading-list-retry" hidden></button><div id="reading-list-items"></div><div id="reading-list-empty" hidden></div></section>`, { url: 'https://example.test/blog/reading-list/', runScripts: 'outside-only' });
  const { window } = dom;
  const { document } = window;
  window.localStorage.setItem(key, JSON.stringify(saved));
  window.fetch = async () => ({ ok: true, json: async () => [
    { title: 'Android 实践', url: '/blog/posts/android/', topics: 'Android 开发', date: '2026.10.16', content: 'Private body must never be exported' },
    { title: '音乐播放器', url: '/blog/posts/music/', topics: '前端 音乐', date: '2026.10.15' }
  ] });
  const blobs = []; const downloads = [];
  window.Blob = class { constructor(parts) { this.parts = parts; blobs.push(this); } };
  window.URL.createObjectURL = () => 'blob:test';
  window.URL.revokeObjectURL = () => {};
  window.HTMLAnchorElement.prototype.click = function () { downloads.push({ href: this.href, download: this.download }); };
  window.eval(source);
  await tick();
  const click = id => document.getElementById(id).click();
  const search = value => { document.getElementById('reading-list-search').value = value; document.getElementById('reading-list-search').dispatchEvent(new window.Event('input')); };
  const upload = async (data, size = 100) => {
    const input = document.getElementById('reading-list-import-file');
    Object.defineProperty(input, 'files', { configurable: true, value: [{ size, text: async () => typeof data === 'string' ? data : JSON.stringify(data) }] });
    input.dispatchEvent(new window.Event('change'));
    await tick();
  };
  return { dom, window, document, blobs, downloads, click, search, upload, read: () => JSON.parse(window.localStorage.getItem(key)), cards: () => document.querySelectorAll('.saved-card') };
}

test('saved posts filter across title and topics, and empty matches do not imply an empty collection', async () => {
  const f = await fixture();
  assert.equal(f.cards().length, 2);
  f.search('android 开发');
  assert.equal(f.cards().length, 1);
  assert.ok(f.cards()[0].textContent.includes('Android 实践'));
  f.search('不存在');
  assert.equal(f.cards().length, 0);
  assert.equal(f.document.getElementById('reading-list-no-match').hidden, false);
  assert.equal(f.document.getElementById('reading-list-empty').hidden, true);
  f.click('reading-list-reset-filter');
  assert.equal(f.cards().length, 2);
  assert.equal(f.document.activeElement.id, 'reading-list-search');
  f.dom.window.close();
});

test('export includes only paths and a versioned deployment root', async () => {
  const f = await fixture();
  f.click('reading-list-export');
  const data = JSON.parse(f.blobs[0].parts[0]);
  assert.equal(data.format, 'morii-reading-list');
  assert.equal(data.version, 1);
  assert.equal(data.root, '/blog/');
  assert.deepEqual(data.items, f.read());
  assert.ok(!f.blobs[0].parts[0].includes('Private body'));
  assert.match(f.downloads[0].download, /^morii-reading-list-\d{4}-\d{2}-\d{2}\.json$/);
  f.dom.window.close();
});

test('imports merge, remap deployment roots and skip duplicates and unsafe paths', async () => {
  const f = await fixture();
  await f.upload(backup(['/old/posts/android/', '/old/posts/new/', '/old/posts/new/', 'https://evil.test/a', '//evil.test/a', 'javascript:alert(1)', '/outside/']));
  assert.deepEqual(f.read(), ['/blog/posts/android/', '/blog/posts/music/', '/blog/posts/new/']);
  const status = f.document.getElementById('reading-list-transfer-status').textContent;
  assert.match(status, /新增 1/);
  assert.match(status, /2 个重复/);
  assert.match(status, /4 个无效/);
  assert.equal(f.document.getElementById('reading-list-import').disabled, false);
  f.dom.window.close();
});

test('invalid backups and oversized files leave existing records intact', async () => {
  const f = await fixture();
  const original = f.read();
  for (const data of ['invalid json', { ...backup([]), version: 99 }, backup([], '//evil.test/'), backup([], '/old/../'), backup(Array(1001).fill('/old/a/'))]) {
    await f.upload(data);
    assert.deepEqual(f.read(), original);
  }
  await f.upload(backup(['/old/new/']), 256 * 1024 + 1);
  assert.deepEqual(f.read(), original);
  assert.match(f.document.getElementById('reading-list-transfer-status').textContent, /文件过大/);
  f.dom.window.close();
});

test('import respects the 100-post limit and reports storage write failures honestly', async () => {
  const saved = Array.from({ length: 99 }, (_, index) => `/blog/posts/${index}/`);
  const f = await fixture(saved);
  await f.upload(backup(['/old/one/', '/old/two/']));
  assert.equal(f.read().length, 100);
  assert.equal(f.read().at(-1), '/blog/one/');
  assert.match(f.document.getElementById('reading-list-transfer-status').textContent, /1 篇因达到 100 篇上限/);
  const stored = f.read();
  f.window.Storage.prototype.setItem = () => { throw new Error('Quota exceeded'); };
  await f.upload(backup(['/old/three/']));
  assert.deepEqual(f.read(), stored);
  assert.match(f.document.getElementById('reading-list-transfer-status').textContent, /无法保存/);
  f.dom.window.close();
});
