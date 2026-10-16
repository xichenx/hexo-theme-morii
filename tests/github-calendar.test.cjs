'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync(path.join(__dirname, '../source/js/github-calendar.js'), 'utf8');
const helperSource = fs.readFileSync(path.join(__dirname, '../scripts/github-calendar.js'), 'utf8');
const data = { contributions: [
  { date: '2026-10-15', count: 4, level: 2 },
  { date: '2026-10-14', count: 0, level: 0 },
  { date: '2026-10-16', count: 9, level: 4 },
  { date: '2026-99-99', count: 10, level: 1 },
  { date: '2026-10-17', count: -1, level: 4 }
] };
const tick = () => new Promise(resolve => setImmediate(resolve));
async function fixture({ fail = false, cache = null } = {}) {
  const dom = new JSDOM('<section data-github-calendar data-user="xichenx" data-api="https://example.test/api"><div class="github-calendar-scroll"><div class="github-calendar-months"></div><div class="github-calendar-days"></div></div><p class="github-calendar-status"></p><p class="github-calendar-detail"></p><button class="github-calendar-retry" hidden></button></section>', { url: 'https://example.test/', runScripts: 'outside-only' });
  const { window } = dom;
  let failed = fail; let requests = 0;
  window.fetch = async () => { requests++; if (failed) throw new Error('Offline'); return { ok: true, json: async () => data }; };
  if (cache) window.sessionStorage.setItem('morii-github-calendar:xichenx:https://example.test/api', JSON.stringify(cache));
  window.eval(source);
  await tick();
  return { dom, window, document: window.document, requests: () => requests, recover: () => { failed = false; }, card: window.document.querySelector('section') };
}

test('calendar helper supports legacy accounts, explicit disable and rejects unsafe service URLs', () => {
  for (const [options, expected] of [
    [{}, true], [{ enable: false }, false], [{ enable: true, user: 'invalid/user' }, false],
    [{ enable: true, api: 'javascript:alert(1)' }, false], [{ enable: true, api: 'https://user:secret@example.test/' }, false]
  ]) {
    let helper;
    vm.runInNewContext(helperSource, { URL, encodeURIComponent, hexo: { config: { githubcalendar: { enable: true, user: 'xichenx' } }, theme: { config: { github_calendar: options } }, extend: { helper: { register(name, callback) { helper = callback; } } } } });
    assert.equal(Boolean(helper()), expected);
    if (expected) assert.equal(helper().profile, 'https://github.com/xichenx');
  }
});

test('calendar sorts and validates days, shows totals and supports keyboard and focus detail', async () => {
  const f = await fixture();
  const cells = [...f.document.querySelectorAll('.github-calendar-day')];
  assert.equal(cells.length, 3);
  assert.equal(cells[0].title, '2026-10-14 · 0 次贡献');
  assert.match(f.document.querySelector('.github-calendar-status').textContent, /13 次贡献/);
  cells[2].focus();
  cells[2].dispatchEvent(new f.window.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }));
  assert.equal(f.document.activeElement, cells[1]);
  assert.match(f.document.querySelector('.github-calendar-detail').textContent, /2026-10-15 · 4/);
  assert.equal(f.document.querySelectorAll('.github-calendar-day[tabindex="0"]').length, 1);
  f.dom.window.close();
});

test('failed calendar requests can retry, and fresh cached data avoids another request', async () => {
  const f = await fixture({ fail: true });
  assert.equal(f.document.querySelector('.github-calendar-retry').hidden, false);
  assert.equal(f.document.querySelectorAll('.github-calendar-day').length, 0);
  f.recover(); f.document.querySelector('.github-calendar-retry').click(); await tick();
  assert.equal(f.document.querySelectorAll('.github-calendar-day').length, 3);
  assert.equal(f.card.getAttribute('aria-busy'), 'false');
  const cached = await fixture({ cache: { at: Date.now(), ...data } });
  assert.equal(cached.requests(), 0);
  assert.equal(cached.document.querySelectorAll('.github-calendar-day').length, 3);
  assert.match(cached.document.querySelector('.github-calendar-status').textContent, /缓存/);
  f.dom.window.close(); cached.dom.window.close();
});
