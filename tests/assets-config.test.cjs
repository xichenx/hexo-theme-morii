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
    fs.writeFileSync(path.join(root, 'css/style.css'), [
      '@charset "utf-8";',
      '/* Keep comments. */',
      '@media print {',
      '  article a {',
      '    --gap: ;',
      '    width: calc(100% - 2rem);',
      '    mask: url(\'../icons/ui/home.svg\');',
      '  }',
      '}',
      ''
    ].join('\n'));
    fs.writeFileSync(path.join(root, 'js/app.js'), 'one');
    const first = collect(root); const again = collect(root);
    assert.equal(first.get('js/app.js').path, again.get('js/app.js').path);
    assert.equal(path.dirname(first.get('css/style.css').path), 'css');
    const css = first.get('css/style.css');
    assert.equal(css.data.toString(), '@charset "utf-8";/* Keep comments. */@media print {article a {--gap: ;width: calc(100% - 2rem);mask: url(\'../icons/ui/home.svg\');}}');
    assert.equal(css.path, fingerprint('css/style.css', css.data));
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

test('footer navigation skips malformed links and reports their configuration fields', () => {
  const { footerNav } = require('../scripts/lib/footer-nav.cjs');
  const nav = [
    { title: { en: ' Reading ', 'zh-CN': '阅读' }, links: [
      { name: 'Archives', path: '/archives/' },
      { name: 'External', path: 'https://example.test/docs' },
      { name: 'Protocol-relative', path: '//example.test/docs' },
      { name: 'Outside deployment', path: '/%2e%2e/archives/' },
      { name: 'Unsupported scheme', path: 'javascript:alert(1)' },
      { name: 'With credentials', path: 'https://user@example.test/docs' }
    ] },
    { title: 'Empty group', links: [] },
    null
  ];
  assert.deepEqual(footerNav(nav), [{
    title: { 'zh-CN': '阅读', en: 'Reading' },
    links: [
      { name: 'Archives', path: '/archives/', local: true },
      { name: 'External', path: 'https://example.test/docs', local: false }
    ]
  }]);
  assert.deepEqual(inspect({ footer: { nav } }).map(item => item.field), [
    'footer.nav[0].links[2].path', 'footer.nav[0].links[3].path',
    'footer.nav[0].links[4].path', 'footer.nav[0].links[5].path',
    'footer.nav[2].title', 'footer.nav[2].links'
  ]);
  assert.deepEqual(inspect({ footer: { nav: false } }), []);
});
