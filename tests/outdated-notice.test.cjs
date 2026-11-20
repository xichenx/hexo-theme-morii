'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('outdated notices use valid overrides and preserve the default and disabled cases', () => {
  const helpers = {};
  const outdated = { enable: true, days: 90, position: 'bottom' };
  vm.runInNewContext(fs.readFileSync(require.resolve('../scripts/widgets.js'), 'utf8'), {
    require, hexo: { theme: { config: { article: { outdated } } }, extend: { helper: { register(name, fn) { helpers[name] = fn; } } } }
  });
  const post = { date: '2020-01-01T00:00:00Z', updated: '2020-02-01T00:00:00Z' };
  const now = Date.parse('2020-03-02T00:00:00Z');
  const notice = extra => helpers.morii_outdated_notice({ ...post, ...extra }, now);
  const custom = notice({ outdated_days: 30, outdated_position: 'top' });
  assert.deepEqual([custom.limit, custom.position, custom.days], [30, 'top', 30]);
  const invalid = notice({ outdated_days: '1', outdated_position: 'footer' });
  assert.deepEqual([invalid.limit, invalid.position], [90, 'bottom']);
  assert.equal(notice({ outdated: false }), null);
  assert.equal(notice({ password: true }), null);
  delete outdated.position;
  delete outdated.days;
  const defaults = notice();
  assert.deepEqual([defaults.limit, defaults.position], [365, 'top']);
});
