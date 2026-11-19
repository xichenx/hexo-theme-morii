'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('about milestones preserve authored order, legacy entries and safe destinations', () => {
  const helpers = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../scripts/content-data.js'), 'utf8'), {
    require, Date,
    hexo: { extend: { helper: { register: (name, helper) => { helpers[name] = helper; } } } }
  });
  const { careers } = helpers.morii_about({ careers: { list: [
    { desc: 'Legacy milestone' },
    { title: 'Local milestone', date: '2024-02', url: '/posts/milestone/' },
    { title: 'External milestone', date: new Date('2024-02-29T00:00:00Z'), url: 'https://example.test/' },
    { desc: 'Display only', date: '2026-02-31', url: '//external.test/' },
    { date: '2024–至今', title: 'Ongoing', url: 'javascript:alert(1)' },
    { date: '2026-10' }
  ] } });
  assert.deepEqual(Array.from(careers, entry => [
    entry.title, entry.description, entry.date, entry.datetime, entry.link?.path, entry.link?.local
  ]), [
    ['', 'Legacy milestone', '', '', undefined, undefined],
    ['Local milestone', '', '2024-02', '2024-02', '/posts/milestone/', true],
    ['External milestone', '', '2024-02-29', '2024-02-29', 'https://example.test/', false],
    ['', 'Display only', '2026-02-31', '', undefined, undefined],
    ['Ongoing', '', '2024–至今', '', undefined, undefined]
  ]);
});
