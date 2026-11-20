'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { catalog, keyFor } = require('../scripts/lib/series.cjs');

test('series sort explicit order first, then dates and paths, while excluding drafts and invalid keys', () => {
  const posts = [
    { path: 'three/', series: 'android', date: 3 },
    { path: 'two/', series: 'android', series_order: 2, date: 1 },
    { path: 'one/', series: 'android', series_order: 1, date: 9, password: true },
    { path: 'draft/', series: 'android', published: false },
    { path: 'bad/', series: '../escape' },
    { path: 'b/', series: 'plain', date: 1 }, { path: 'a/', series: 'plain', date: 1 }
  ];
  const result = catalog(posts, { android: { title: { en: 'Android', 'zh-CN': '安卓原理' }, order: 1 } });
  assert.equal(result[0].key, 'android'); assert.deepEqual(result[0].posts.map(post => post.path), ['one/', 'two/', 'three/']);
  assert.deepEqual(result[1].posts.map(post => post.path), ['a/', 'b/']);
  assert.equal(keyFor('系统设计'), '系统设计'); assert.equal(keyFor('bad/key'), ''); assert.equal(keyFor('__proto__'), '');
  assert.equal(catalog([{ ...posts[0] }, { ...posts[0] }])[0].posts.length, 1);
});

test('series chapter sorting keeps explicit priority and supports natural title and date ordering', () => {
  const posts = [
    { path: 'ten/', title: '第 10 章', date: 1 },
    { path: 'two-a/', title: '第 2 章', date: 4 },
    { path: 'one/', title: '第 1 章', date: 3 },
    { path: 'two-b/', title: '第 2 章', date: 2 },
    { path: 'setup/', title: '安装', date: 5, series_order: 2 },
    { path: 'intro/', title: '序言', date: 6, series_order: 1 }
  ].map(post => ({ ...post, series: 'guide' }));
  const paths = options => catalog(posts, { guide: options })[0].posts.map(post => post.path);
  assert.deepEqual(paths({ order_by: 'title' }), ['intro/', 'setup/', 'one/', 'two-a/', 'two-b/', 'ten/']);
  assert.deepEqual(paths({ order_by: 'title', order_direction: 'desc' }), ['intro/', 'setup/', 'ten/', 'two-a/', 'two-b/', 'one/']);
  assert.deepEqual(paths({ order_by: 'date', order_direction: 'desc' }), ['intro/', 'setup/', 'two-a/', 'one/', 'two-b/', 'ten/']);
  assert.deepEqual(paths({ order_by: 'path', order_direction: -1 }), ['intro/', 'setup/', 'ten/', 'two-b/', 'one/', 'two-a/']);

  const sameOrder = posts.map(post => ({ ...post, series_order: 1 }));
  assert.deepEqual(catalog(sameOrder, { guide: { order_direction: 'desc' } })[0].posts.map(post => post.path), [
    'intro/', 'setup/', 'two-a/', 'one/', 'two-b/', 'ten/'
  ]);
});
