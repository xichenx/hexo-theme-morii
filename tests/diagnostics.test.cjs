'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

test('diagnostics stays local, distinguishes resources and removes queries and fragments from reports', () => {
  const dom = new JSDOM('<img id="failed" src="https://cdn.example/img.png?token=private">', { url: 'https://example.test/post/?secret=private#anchor', runScripts: 'outside-only' });
  const w = dom.window;
  w.performance.getEntriesByType = type => type === 'navigation' ? [{ startTime: 0, responseStart: 300, domContentLoadedEventEnd: 500 }] : [{ name: 'https://api.example/feed?token=private', initiatorType: 'fetch', duration: 1200, transferSize: 0, responseStart: 0 }];
  w.performance.getEntriesByName = () => [{ startTime: 400 }];
  w.console.info = () => {};
  w.eval(fs.readFileSync(path.join(__dirname, '../source/js/diagnostics.js'), 'utf8'));
  w.document.getElementById('failed').dispatchEvent(new w.Event('error'));
  w.dispatchEvent(new w.CustomEvent('morii:navigation', { detail: { url: '/next/?token=private', status: 'ready', duration: 250, secret: 'private' } }));
  const data = w.MoriiDiagnostics.report();
  assert.equal(data.metrics.ttfb, 300); assert.equal(data.resources[0].type, 'api'); assert.equal(data.resources[0].timingRestricted, true);
  assert.equal(data.failures.length, 1); assert.ok(!JSON.stringify(data).includes('private'));
  dom.window.close();
});
