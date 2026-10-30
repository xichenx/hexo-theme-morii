'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync(path.join(__dirname, '../source/js/article-enhancements.js'), 'utf8');

test('article enhancements escape source, render code filenames and honor per-page opt-outs', () => {
  const tags = {}, helpers = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../scripts/article-enhancements.js'), 'utf8'), { require, URL, hexo: { theme: { config: { article: { enhancements: { mermaid: true, math: false } } } }, render: { renderSync: ({ text }) => `<p>${text}</p>` }, extend: { tag: { register: (name, fn) => { tags[name] = fn; } }, helper: { register: (name, fn) => { helpers[name] = fn; } } } } });
  assert.equal(helpers.morii_enhancements({ mermaid: false }).mermaid, false);
  assert.equal(helpers.morii_enhancements({ math: true }).math, true);
  assert.match(tags.mermaid([], '<script>bad</script>'), /&lt;script&gt;/);
  assert.match(tags.math([], 'x < y'), /x &lt; y/);
  const code = tags.codefile(['app.js,', 'javascript,', '2'], 'const a = 1;\nconst b = 2;');
  assert.match(code, /data-filename="app.js"/); assert.match(code, /line marked/);
  assert.match(tags.note(['warning', '<script>'], 'body'), /&lt;script&gt;/);
});

test('diagram failures preserve source and math rendering uses untrusted mode', async () => {
  const dom = new JSDOM('<article class="article-body"><pre class="morii-diagram-source">graph TD; A-->B;</pre><span class="morii-math" data-display="true">x^2</span></article><script id="config" data-mermaid="/mermaid.js" data-math="/math.js" data-math-css="/math.css"></script>', { runScripts: 'outside-only' });
  const w = dom.window; const calls = [];
  Object.defineProperty(w.document, 'currentScript', { value: w.document.getElementById('config'), configurable: true });
  w.mermaid = { initialize: options => calls.push(options), render: async () => { throw new Error('Bad graph'); } };
  w.katex = { render: (source, element, options) => { assert.equal(source, 'x^2'); assert.equal(options.trust, false); element.textContent = 'rendered'; } };
  w.eval(source); await new Promise(resolve => setImmediate(resolve));
  assert.equal(calls[0].securityLevel, 'strict'); assert.match(w.document.querySelector('.morii-diagram-source').textContent, /graph TD/); assert.ok(w.document.querySelector('.enhancement-retry'));
  assert.equal(w.document.querySelector('.morii-math').dataset.rendered, 'true'); dom.window.close();
});
