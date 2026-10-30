'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { collect, fingerprint } = require('../scripts/lib/assets.cjs');
const { inspect } = require('../scripts/lib/config-check.cjs');

test('asset addresses change with bytes and keep CSS relative resource directories intact', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'morii-assets-'));
  try {
    fs.mkdirSync(path.join(root, 'css')); fs.mkdirSync(path.join(root, 'js'));
    fs.writeFileSync(path.join(root, 'css/style.css'), "a{mask:url('../icons/ui/home.svg')}");
    fs.writeFileSync(path.join(root, 'js/app.js'), 'one');
    const first = collect(root); const again = collect(root);
    assert.equal(first.get('js/app.js').path, again.get('js/app.js').path);
    assert.equal(path.dirname(first.get('css/style.css').path), 'css');
    fs.writeFileSync(path.join(root, 'js/app.js'), 'two');
    const changed = collect(root);
    assert.notEqual(first.get('js/app.js').path, changed.get('js/app.js').path);
    assert.equal(first.get('css/style.css').path, changed.get('css/style.css').path);
    assert.match(fingerprint('js/app.js', 'one'), /^js\/app\.[a-f0-9]{12}\.js$/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('configuration checker detects service mistakes, string booleans, typos and author examples', () => {
  const issues = inspect({ brand: '心灵涂鸦', comments: { enable: true, provider: 'waline', server_url: 'javascript:alert(1)' }, motion: { enable: 'false' }, search: { shard_size: -2 }, typo: true, menu: [{ path: 'javascript:alert(1)' }] }, { language: 'fr' }, ['brand', 'comments', 'motion', 'search', 'menu']);
  for (const field of ['comments.server_url', 'motion.enable', 'search.shard_size', 'menu[0].path']) assert.ok(issues.some(issue => issue.field === field && issue.level === 'error'), field);
  for (const field of ['brand', 'language', 'typo']) assert.ok(issues.some(issue => issue.field === field && issue.level === 'warning'), field);
  assert.deepEqual(inspect({ comments: { enable: false }, menu: [{ path: '/notes/' }], accent: '#abcdef', motion: { enable: false } }, { language: ['zh-TW', 'en'] }), []);
});
