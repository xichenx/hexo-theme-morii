'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../scripts/layouts.js'), 'utf8');

test('layout defaults remain stable and invalid choices fall back with one warning per page type', () => {
  let helper;
  const warnings = [];
  const config = {};
  vm.runInNewContext(source, { hexo: { theme: { config }, log: { warn: message => warnings.push(message) }, extend: { helper: { register(name, callback) { helper = callback; } } } } });
  assert.equal(helper('home'), 'featured');
  assert.equal(helper('categories'), 'atlas');
  assert.equal(helper('category'), 'list');
  assert.equal(helper('archives'), 'timeline');
  assert.equal(warnings.length, 0);
  config.appearance = { layouts: { categories: '../external-template', category: { invalid: true }, home: 'grid', archives: 'grouped' } };
  assert.equal(helper('categories'), 'atlas');
  assert.equal(helper('categories'), 'atlas');
  assert.equal(helper('category'), 'list');
  assert.equal(helper('home'), 'grid');
  assert.equal(helper('archives'), 'grouped');
  assert.equal(helper('__proto__'), '');
  assert.equal(warnings.length, 2);
});
