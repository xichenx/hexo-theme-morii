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
