'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('related posts preserve relevance and use the configured date for ties and display', () => {
  let recommend;
  const related = { date_type: 'updated', limit: 6 };
  vm.runInNewContext(fs.readFileSync(require.resolve('../scripts/related.js'), 'utf8'), {
    require,
    hexo: { theme: { config: { article: { related } } }, extend: { helper: { register(name, fn) { recommend = fn; } } } }
  });
  const current = { path: 'current/', tags: ['Hexo'], categories: ['Tools'] };
  const posts = [
    { path: 'maintained/', tags: ['Hexo'], date: new Date('2020-01-01'), updated: '2025-02-03' },
    { path: 'legacy/', tags: ['Hexo'], date: '2024-01-01', updated: 'invalid' },
    { path: 'relevant/', tags: ['Hexo'], categories: ['Tools'], date: '2018-01-01' },
    { path: 'locked/', tags: ['Hexo'], date: '2026-01-01', password: true }
  ];
  const rows = post => Array.from(recommend(post, posts), item => [item.post.path, item.date.toISOString().slice(0, 10), item.usesUpdated]);
  assert.deepEqual(rows(current), [
    ['relevant/', '2018-01-01', false], ['maintained/', '2025-02-03', true], ['legacy/', '2024-01-01', false]
  ]);
  const created = [
    ['relevant/', '2018-01-01', false], ['legacy/', '2024-01-01', false], ['maintained/', '2020-01-01', false]
  ];
  assert.deepEqual(rows({ ...current, related_date_type: 'created' }), created);
  delete related.date_type;
  assert.deepEqual(rows(current), created);
});
