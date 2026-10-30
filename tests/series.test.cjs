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
