'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { highlight } = require('hexo-util');
const { resolveCode } = require('../scripts/lib/code-style.cjs');
const { inspect } = require('../scripts/lib/config-check.cjs');

test('code styles preserve defaults, support article overrides and reject arbitrary style values', () => {
  assert.deepEqual(resolveCode(), { style: 'classic', theme: 'dark', heightLimit: false });
  assert.deepEqual(resolveCode(null, null), { style: 'classic', theme: 'dark', heightLimit: false });
  assert.deepEqual(resolveCode({ style: 'mac', theme: 'auto' }), { style: 'mac', theme: 'auto', heightLimit: false });
  assert.deepEqual(resolveCode({ style: 'mac', theme: 'auto' }, { code_style: 'minimal', code_theme: 'light' }), { style: 'minimal', theme: 'light', heightLimit: false });
  const warnings = [];
  assert.deepEqual(resolveCode({ style: 'mac', theme: 'auto' }, { code_style: '<style>', code_theme: {} }, field => warnings.push(field)), { style: 'mac', theme: 'auto', heightLimit: false });
  assert.deepEqual(warnings, ['code_style', 'code_theme']);
  assert.deepEqual(resolveCode({ style: 'wrong', theme: false }), { style: 'classic', theme: 'dark', heightLimit: false });
  assert.equal(inspect({ article: { code: { style: 'wrong', theme: 'wrong' } } }).filter(issue => issue.level === 'error').length, 2);
});

test('code height limit inherits, supports per-page overrides and rejects non-integer values', () => {
  const config = { height_limit: 280 };
  assert.equal(resolveCode(config).heightLimit, 280);
  assert.equal(resolveCode(config, { code_height_limit: 160 }).heightLimit, 160);
  assert.equal(resolveCode(config, { code_height_limit: false }).heightLimit, false);
  for (const height_limit of [0, -1, 1.2, '280', true]) {
    assert.equal(resolveCode({ height_limit }).heightLimit, false);
    assert.equal(resolveCode(config, { code_height_limit: height_limit }).heightLimit, 280);
    assert.equal(inspect({ article: { code: { height_limit } } })[0].field, 'article.code.height_limit');
  }
});

test('style metadata does not change copied code, line marks, collapse behavior or decrypt initialization', async () => {
  const code = Array.from({ length: 12 }, (_, index) => `const value${index} = ${index};`).join('\n');
  const html = `<article class="article-body" data-code-style="minimal" data-code-theme="auto" data-code-lines="5"><div class="code-file" data-filename="app.js" data-code-style="mac" data-code-theme="light">${highlight(code, { lang: 'javascript', gutter: true, mark: [2] })}</div><pre><code class="language-text">hello</code></pre></article>`;
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://example.test/post/' });
  try {
    const w = dom.window, copied = [];
    Object.defineProperty(w.navigator, 'clipboard', { value: { writeText: async text => copied.push(text) } });
    w.eval(fs.readFileSync(path.join(__dirname, '../source/js/reading.js'), 'utf8'));
    const shells = w.document.querySelectorAll('.code-shell');
    assert.equal(shells.length, 2); assert.equal(shells[0].dataset.codeStyle, 'mac'); assert.equal(shells[0].dataset.codeTheme, 'light');
    assert.equal(shells[1].dataset.codeStyle, 'minimal'); assert.equal(shells[1].dataset.codeTheme, 'auto');
    assert.equal(shells[0].querySelector('.code-filename').textContent, 'app.js'); assert.ok(shells[0].querySelector('.line.marked'));
    const toggle = shells[0].querySelector('.code-toggle'); assert.equal(toggle.getAttribute('aria-expanded'), 'false');
    const wrap = shells[0].querySelector('.code-wrap');
    assert.equal(wrap.getAttribute('aria-pressed'), 'false');
    wrap.click(); assert.equal(wrap.getAttribute('aria-pressed'), 'true');
    assert.ok(shells[0].classList.contains('is-wrapped'));
    assert.equal(shells[1].querySelector('.code-wrap').getAttribute('aria-pressed'), 'false');
    shells[0].querySelector('.code-copy').click(); await new Promise(resolve => setImmediate(resolve));
    assert.equal(copied.at(-1), code + '\n');
    wrap.click(); assert.equal(wrap.getAttribute('aria-pressed'), 'false');
    toggle.click(); assert.equal(toggle.getAttribute('aria-expanded'), 'true'); assert.ok(!shells[0].classList.contains('is-collapsed'));
    w.document.querySelector('.article-body').dataset.codeWordWrap = 'true';
    const extra = w.document.createElement('pre'); extra.textContent = 'new code'; w.document.querySelector('.article-body').append(extra);
    w.dispatchEvent(new w.Event('hexo-blog-decrypt'));
    assert.equal(w.document.querySelectorAll('.code-shell').length, 3); assert.equal(extra.parentElement.dataset.codeStyle, 'minimal');
    assert.equal(extra.parentElement.querySelector('.code-wrap').getAttribute('aria-pressed'), 'true');
    assert.equal(w.document.querySelector('.code-shell .code-shell'), null);
  } finally { dom.window.close(); }
});
