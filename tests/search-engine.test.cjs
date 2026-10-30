'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const engine = require('../source/js/search-engine.js');

test('n-gram candidates cover partial Latin, Chinese and combined queries without indexing punctuation', () => {
  const rows = ['Android 系统配置', '主题配置方法', '播放器缓存'];
  const postings = Object.create(null);
  rows.forEach((text, id) => engine.grams(text).forEach(term => (postings[term] || (postings[term] = [])).push(id)));
  for (const [query, expected] of [['andr', [0]], ['主题配置', [1]], ['配置', [0, 1]], ['缓存', [2]], ['不存在', []]]) assert.deepEqual(engine.candidates({ terms: engine.queryTerms([query]), postings }), expected);
  assert.deepEqual(engine.candidates({ terms: engine.queryTerms(['系统', '配置']), postings }), [0]);
  assert.equal(engine.bucketFor('配置'), engine.bucketFor('配置')); assert.ok(engine.bucketFor('配置') < 64);
});

test('search worker runs the shared ranking engine, rejects unsafe imports and keeps password bodies out of matches', () => {
  const replies = []; const self = { location: { href: 'https://example.test/js/search-worker.hash.js', origin: 'https://example.test' }, postMessage: value => replies.push(value) };
  const context = { self, URL, importScripts: url => { assert.match(url, /^https:\/\/example.test\//); self.MoriiSearchEngine = engine; } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../source/js/search-worker.js'), 'utf8'), context);
  self.onmessage({ data: { id: 1, method: 'init', payload: { engine: 'https://outside.test/evil.js' } } }); assert.ok(replies.at(-1).error);
  self.onmessage({ data: { id: 2, method: 'init', payload: { engine: '/js/search-engine.hash.js' } } }); assert.equal(replies.at(-1).result, true);
  self.onmessage({ data: { id: 3, method: 'rank', payload: { entries: [{ title: 'Other', content: 'needle' }, { title: 'needle', content: '' }, { title: 'Locked', protected: true, content: 'needle' }], query: 'needle', words: ['needle'], scope: 'all' } } });
  assert.deepEqual(replies.at(-1).result.map(item => item.index), [1, 0]);
});
