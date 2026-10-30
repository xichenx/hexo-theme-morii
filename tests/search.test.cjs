'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync(path.join(__dirname, '../source/js/search.js'), 'utf8');
const settle = () => new Promise(resolve => setImmediate(resolve));
function fixture(fetcher) {
  const items = Array.from({ length: 7 }, (_, i) => `<li data-topics="Hexo"><a href="/post/${i}"><strong>笔记 ${i}</strong><p class="search-result-summary">主题配置方法 ${i}</p><small>2026.10.16</small></a></li>`).join('');
  const dom = new JSDOM(`<dialog id="search-dialog" open data-search-index="/morii-search.json" data-page-size="5"><input id="search-input"><button id="search-clear" hidden>清空</button><div class="search-scope"><button data-search-scope="all" aria-pressed="true">全部</button><button data-search-scope="title" aria-pressed="false">标题</button><button data-search-scope="topics" aria-pressed="false">分类</button></div><button data-search-term="Hexo">Hexo</button><div class="search-scroll"><strong id="search-results-heading"></strong><p id="search-status"></p><div class="search-empty" hidden></div><ul id="search-results">${items}</ul><button id="search-more" hidden>更多</button></div><p id="search-service-status"></p><button id="search-retry" hidden>重试</button></dialog>`, { url: 'https://example.test/', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window; let fetches = 0;
  w.fetch = async () => { fetches++; return fetcher ? fetcher(fetches) : { ok: true, json: async () => [] }; };
  w.eval(source);
  const d = w.document;
  return { dom, w, d, get fetches() { return fetches; }, links: () => [...d.querySelectorAll('#search-results a')], query(value) { d.querySelector('input').value = value; d.querySelector('input').dispatchEvent(new w.Event('input')); }, async open() { d.querySelector('dialog').dispatchEvent(new w.Event('morii:search-open')); await settle(); } };
}
test('initial results paginate and fallback search remains available before the index loads', () => {
  const f = fixture(); assert.equal(f.links().length, 5); assert.equal(f.d.querySelector('#search-more').hidden, false);
  f.d.querySelector('#search-more').click(); assert.equal(f.links().length, 7);
  f.query('配置 3'); assert.equal(f.links().length, 1); assert.equal(f.d.querySelector('#search-clear').hidden, false);
  f.d.querySelector('#search-clear').click(); assert.equal(f.links().length, 5); assert.equal(f.d.activeElement.id, 'search-input');
  assert.equal(f.d.querySelector('#search-clear').hidden, true); f.dom.window.close();
});
test('full-text search ranks title matches, filters by scope and resets scope for suggested tags', async () => {
  const entries = [
    { title: '普通笔记', url: '/a', content: '理解 Hexo 布局', topics: '开发', date: '2026.10.16' },
    { title: 'Hexo 入门', url: '/b', content: '安装步骤', topics: '教程', date: '2026.10.15' },
    { title: '主题配置', url: '/c', content: '更多选项', topics: 'Hexo' }
  ];
  const f = fixture(() => ({ ok: true, json: async () => entries })); await f.open();
  f.query('Hexo'); assert.equal(f.links().length, 3); assert.equal(new URL(f.links()[0].href).pathname, '/b');
  f.d.querySelector('[data-search-scope="title"]').click(); assert.equal(f.links().length, 1);
  f.d.querySelector('[data-search-scope="topics"]').click(); assert.equal(new URL(f.links()[0].href).pathname, '/c');
  f.d.querySelector('[data-search-term]').click(); assert.equal(f.links().length, 3);
  assert.equal(f.d.querySelector('[data-search-scope="all"]').getAttribute('aria-pressed'), 'true');
  f.query('Hexo 不存在'); assert.equal(f.links().length, 0); assert.equal(f.d.querySelector('.search-empty').hidden, false);
  assert.equal(f.d.querySelector('#search-more').hidden, true); f.dom.window.close();
});
test('keyboard arrows move through real links; composition and unrelated controls are preserved', () => {
  const f = fixture(); const input = f.d.querySelector('input'); input.focus();
  const key = (target, value, extra = {}) => target.dispatchEvent(new f.w.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true, ...extra }));
  key(input, 'ArrowDown', { isComposing: true }); assert.equal(f.d.activeElement, input);
  key(input, 'ArrowDown'); assert.equal(f.d.activeElement, f.links()[0]);
  key(f.links()[0], 'ArrowDown'); assert.equal(f.d.activeElement, f.links()[1]);
  key(f.links()[1], 'ArrowUp'); key(f.links()[0], 'ArrowUp'); assert.equal(f.d.activeElement, input);
  let clicked = false; f.query('配置 0'); f.links()[0].addEventListener('click', event => { event.preventDefault(); clicked = true; });
  key(input, 'Enter'); assert.equal(clicked, true); f.dom.window.close();
});
test('unavailable index keeps fallback search and allows a successful retry', async () => {
  const f = fixture(count => count === 1 ? Promise.reject(Error('Offline')) : { ok: true, json: async () => [{ title: '全文新内容', url: '/new', content: 'unique' }] });
  await f.open(); assert.equal(f.d.querySelector('#search-retry').hidden, false);
  f.query('配置 2'); assert.equal(f.links().length, 1);
  f.d.querySelector('#search-retry').click(); await settle();
  f.query('unique'); assert.equal(f.links().length, 1); assert.equal(f.d.querySelector('#search-retry').hidden, true);
  assert.equal(f.d.querySelector('#search-results').getAttribute('aria-busy'), 'false');
  await f.open(); assert.equal(f.fetches, 2); f.dom.window.close();
});
test('search index cannot inject markup, expose protected text or navigate off-site', async () => {
  const f = fixture(() => ({ ok: true, json: async () => [
    { title: '<img src=x onerror=alert(1)>', url: '/safe', content: '<script>bad</script>' },
    { title: 'Locked', url: '/locked', content: 'secret', topics: 'private', protected: true },
    { title: 'Outside', url: 'https://outside.test/' }, { title: 'Bad URL', url: 'javascript:alert(1)' },
    { title: 'Duplicate', url: '/safe' }
  ] }));
  await f.open(); assert.equal(f.links().length, 2); assert.equal(f.d.querySelector('#search-results img, #search-results script'), null);
  f.query('secret'); assert.equal(f.links().length, 0);
  f.query('private'); assert.equal(f.links().length, 0);
  f.query('Locked'); assert.match(f.d.querySelector('.search-result-summary').textContent, /加密文章/);
  f.dom.window.close();
});

test('index snippets decode numeric entities without exposing protected content', () => {
  const vm = require('node:vm'); let generate;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../scripts/search-index.js'), 'utf8'), { require, hexo: { config: { root: '/blog/' }, theme: { config: {} }, extend: { helper: { register() {} }, generator: { register(name, fn) { generate = fn; } } } } });
  const data = JSON.parse(generate({ posts: [{ title: 'Code', path: 'code/', categories: [{ name: 'Hexo' }], tags: [{ name: 'Hexo' }], content: '<p>const theme = &#x27;Morii&#x27;; &#123; &#x110000;</p>' }, { title: 'Locked', path: 'locked/', password: true, content: '&#x73;ecret' }] }).find(route => route.path === 'morii-search.json').data);
  assert.match(data[0].content, /'Morii'; \{/); assert.ok(data[0].content.includes('&#x110000;'));
  assert.equal(data[0].topics, 'Hexo'); assert.equal(data[0].url, '/blog/code/'); assert.equal(data[1].content, '');
});

test('large search indexes load bodies only for full-text queries and retry incomplete shards', async () => {
  const entries = [{ title: '主题配置', url: '/config/', topics: 'Hexo', categories: ['技术'] }, { title: '生活笔记', url: '/life/', topics: '', categories: ['生活'] }];
  const requested = []; let fail = true;
  const f = fixture();
  f.w.fetch = async url => {
    requested.push(String(url));
    if (String(url).endsWith('morii-search.json')) return { ok: true, json: async () => ({ version: 2, entries, shards: ['/search/a.json', '/search/b.json'] }) };
    if (String(url).endsWith('a.json')) return { ok: true, json: async () => [{ ...entries[0], content: 'bodyneedle' }] };
    if (fail) throw new Error('offline');
    return { ok: true, json: async () => [{ ...entries[1], content: 'bodyneedle' }] };
  };
  await f.open(); assert.equal(requested.length, 1);
  f.d.querySelector('[data-search-scope="title"]').click(); f.query('主题配置');
  await settle(); assert.equal(requested.length, 1); assert.match(f.links()[0].textContent, /主题配置/);
  f.d.querySelector('[data-search-scope="all"]').click(); f.query('bodyneedle');
  await settle(); await settle();
  assert.equal(f.links().length, 1); assert.equal(f.d.querySelector('#search-retry').hidden, false);
  fail = false; f.d.querySelector('#search-retry').click(); await settle(); await settle();
  assert.equal(f.links().length, 2); assert.equal(requested.filter(url => url.endsWith('a.json')).length, 1);
  f.dom.window.close();
});

test('generated search manifests use hashed shards and omit protected bodies and category names', () => {
  const vm = require('node:vm'); let generate;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../scripts/search-index.js'), 'utf8'), { require, hexo: { config: { root: '/blog/' }, theme: { config: { search: { shard_size: 20 } } }, extend: { helper: { register() {} }, generator: { register(name, fn) { generate = fn; } } } } });
  const posts = Array.from({ length: 21 }, (_, index) => ({ title: `Post ${index}`, path: `post-${index}/`, content: 'needle', categories: [{ name: '技术' }] }));
  posts[0].password = true; posts[0].content = 'secret';
  const routes = generate({ posts }); const index = JSON.parse(routes.find(route => route.path === 'morii-search.json').data);
  assert.equal(index.version, 2); assert.equal(index.shards.length, 2); assert.equal(index.entries[0].categories.length, 0);
  assert.ok(index.entries.every(entry => !Object.hasOwn(entry, 'content')));
  assert.ok(!JSON.stringify(routes).includes('secret'));
  assert.match(index.shards[0], /^\/blog\/search\/part-0\.[a-f0-9]{12}\.json$/);
});
