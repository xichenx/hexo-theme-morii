'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync(path.join(__dirname, '../source/js/reading-resume.js'), 'utf8');
const key = 'morii-reading-progress';
const entry = overrides => ({ path: '/blog/posts/long/', updated: 'v1', ratio: .5, at: Date.now(), anchor: 'section', offset: 550, ...overrides });
function fixture({ entries = [], hash = '', blocked = false, updated = 'v1' } = {}) {
  const dom = new JSDOM(`<link rel="canonical" href="https://example.test/blog/posts/long/"><div id="reading-resume" data-updated="${updated}" hidden><p id="reading-resume-description"></p><button id="reading-resume-continue">继续</button><button id="reading-resume-clear">清除</button></div><article class="article-body"><h2 id="section">章节一</h2></article><div id="theme-announcement"></div>`, { url: `https://example.test/blog/posts/long/${hash}`, runScripts: 'outside-only' });
  const { window } = dom;
  const { document } = window;
  window.localStorage.setItem(key, JSON.stringify(entries));
  if (blocked) Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage denied'); } });
  Object.defineProperty(window, 'innerHeight', { value: 800 });
  Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
  const article = document.querySelector('article');
  Object.defineProperty(article, 'offsetHeight', { value: 3000 });
  article.getBoundingClientRect = () => ({ top: 1000 - window.scrollY });
  document.getElementById('section').getBoundingClientRect = () => ({ top: 1500 - window.scrollY });
  const scrolls = [];
  window.scrollTo = options => { scrolls.push(options); window.scrollY = options.top; };
  window.eval(source);
  const interact = () => document.dispatchEvent(new window.Event('wheel', { bubbles: true }));
  const leave = () => window.dispatchEvent(new window.Event('pagehide'));
  return { dom, window, document, scrolls, interact, leave, banner: document.getElementById('reading-resume'), read: () => JSON.parse(window.localStorage.getItem(key)) };
}

test('resume is opt-in, follows the saved anchor, and never overwrites progress on initial load', () => {
  const f = fixture({ entries: [entry()] });
  assert.equal(f.banner.hidden, false);
  assert.equal(f.scrolls.length, 0);
  assert.ok(f.document.getElementById('reading-resume-description').textContent.includes('50% · 章节一'));
  f.leave();
  assert.equal(f.read()[0].ratio, .5);
  f.document.getElementById('reading-resume-continue').click();
  assert.equal(f.scrolls[0].top, 2050);
  assert.equal(f.banner.hidden, true);
  assert.equal(f.document.activeElement.id, 'section');
  f.dom.window.close();
});

test('records use deployment paths, keep other articles, and clear after finishing', () => {
  const f = fixture({ entries: [entry({ path: '/blog/posts/other/' })] });
  f.interact();
  f.window.scrollY = 2050;
  f.leave();
  const saved = f.read().find(item => item.path === '/blog/posts/long/');
  assert.equal(saved.ratio, .5);
  assert.equal(saved.anchor, 'section');
  assert.equal(saved.offset, 550);
  assert.equal(f.read().length, 2);
  f.window.scrollY = 4000;
  f.leave();
  assert.deepEqual(f.read().map(item => item.path), ['/blog/posts/other/']);
  f.dom.window.close();
});

test('clear removes only this article and suppresses re-saving during the same visit', () => {
  const f = fixture({ entries: [entry(), entry({ path: '/blog/posts/other/' })] });
  f.document.getElementById('reading-resume-clear').click();
  f.interact();
  f.window.scrollY = 2050;
  f.leave();
  assert.equal(f.banner.hidden, true);
  assert.deepEqual(f.read().map(item => item.path), ['/blog/posts/other/']);
  f.dom.window.close();
});

test('hash links, changed articles, expired data and denied storage do not cause navigation', () => {
  for (const options of [
    { entries: [entry()], hash: '#section' },
    { entries: [entry()], updated: 'v2' },
    { entries: [entry({ at: Date.now() - 91 * 86400000 })] },
    { entries: [entry({ ratio: 'invalid' })] },
    { blocked: true }
  ]) {
    const f = fixture(options);
    assert.equal(f.banner.hidden, true);
    assert.equal(f.scrolls.length, 0);
    f.interact();
    f.window.scrollY = 2050;
    assert.doesNotThrow(f.leave);
    f.dom.window.close();
  }
});
