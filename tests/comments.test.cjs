const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

for (const preloaded of [false, true]) {
  test(`comments initialize when the client is ${preloaded ? 'preloaded' : 'a named DOM element'}`, async () => {
    const dom = new JSDOM('<div id="comment-service" data-env="https://comments.example/" data-script="/twikoo.js"><p class="comment-status"></p><button id="comments-load"></button><div id="twikoo"></div></div>', { runScripts: 'outside-only', url: 'https://blog.example/' });
    const { window } = dom;
    let initialized = 0;
    let requested = 0;
    const client = { init: async () => { initialized++; } };
    if (preloaded) window.twikoo = client;
    else assert.equal(window.twikoo, window.document.getElementById('twikoo'));
    const append = window.document.head.append.bind(window.document.head);
    window.document.head.append = node => {
      requested++;
      append(node);
      window.twikoo = client;
      node.onload();
    };
    window.eval(fs.readFileSync(path.join(__dirname, '../source/js/services.js'), 'utf8'));
    window.document.getElementById('comments-load').click();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(initialized, 1);
    assert.equal(requested, preloaded ? 0 : 1);
    assert.equal(window.document.getElementById('comments-load').hidden, true);
    dom.window.close();
  });
}

test('Waline uses its own service, follows page language and initializes once', async () => {
  const dom = new JSDOM('<html lang="zh-TW"><div id="comment-service" data-provider="waline" data-server="https://comments.example/" data-style="/waline.css" data-script="/waline.js"><p class="comment-status"></p><button id="comments-load"></button><div id="waline"></div></div>', { runScripts: 'outside-only', url: 'https://blog.example/post/' });
  const { window: w } = dom; const calls = [];
  w.Waline = { init: options => { calls.push(options); return {}; } };
  w.eval(fs.readFileSync(path.join(__dirname, '../source/js/services.js'), 'utf8'));
  w.document.getElementById('comments-load').click(); w.document.getElementById('comments-load').click();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(calls.length, 1); assert.equal(calls[0].serverURL, 'https://comments.example/'); assert.equal(calls[0].lang, 'zh-TW'); assert.equal(calls[0].path, '/post/');
  assert.equal(w.document.querySelectorAll('[data-waline-style]').length, 1); dom.window.close();
});

test('recent comments use text nodes and reject off-site comment paths', async () => {
  const dom = new JSDOM('<div data-recent-comments data-env="https://comments.example/" data-limit="5"><ul data-recent-list></ul><p data-recent-status></p><button data-recent-retry></button></div>', { runScripts: 'outside-only', url: 'https://blog.example/' });
  const w = dom.window;
  w.IntersectionObserver = class { constructor(callback) { this.callback = callback; } observe() { this.callback([{ isIntersecting: true }]); } disconnect() {} };
  w.twikoo = { init() {}, getRecentComments: async () => [{ url: '/post/#comment', nick: '<img src=x>', commentText: '<script>unsafe</script>' }, { url: 'https://outside.test/', commentText: 'off site' }] };
  w.eval(fs.readFileSync(path.join(__dirname, '../source/js/services.js'), 'utf8'));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(w.document.querySelectorAll('[data-recent-list] li').length, 1); assert.equal(w.document.querySelector('[data-recent-list] img, [data-recent-list] script'), null);
  dom.window.close();
});
