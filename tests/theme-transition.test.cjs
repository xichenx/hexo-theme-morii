'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync(path.join(__dirname, '../source/js/theme.js'), 'utf8');
function fixture({ supported = true, reduced = false, motion = 'on', fail = false } = {}) {
  const dom = new JSDOM(`<html data-theme="light" data-motion="${motion}" data-theme-transition="on"><button id="theme-toggle">Theme</button></html>`, { url: 'https://example.test', runScripts: 'outside-only', pretendToBeVisual: true });
  const { window } = dom; const calls = []; let starts = 0, skipped = 0, finish;
  window.matchMedia = () => ({ matches: reduced, addEventListener() {} });
  window.Element.prototype.animate = (frames, options) => { calls.push({ frames, options }); return { finished: Promise.resolve() }; };
  if (supported) window.document.startViewTransition = update => {
    starts++;
    if (fail) throw Error('Unavailable');
    update();
    return { ready: Promise.resolve(), finished: new Promise(resolve => { finish = resolve; }), skipTransition() { skipped++; finish(); } };
  };
  window.eval(source);
  return { dom, window, calls, get starts() { return starts; }, get skipped() { return skipped; }, finish() { finish(); } };
}
test('theme reveal uses a viewport-covering clip, guards rapid clicks and leaves the toggle usable', async () => {
  const f = fixture(); const button = f.window.document.querySelector('button');
  button.click(); button.click(); await Promise.resolve();
  assert.equal(f.starts, 1); assert.equal(f.window.document.documentElement.dataset.theme, 'dark');
  assert.equal(button.getAttribute('aria-label'), '切换浅色模式');
  assert.equal(f.calls[0].options.pseudoElement, '::view-transition-new(root)');
  assert.equal(f.calls[0].frames.clipPath.length, 2);
  f.finish(); await new Promise(resolve => setImmediate(resolve));
  assert.equal(button.hasAttribute('aria-busy'), false);
  assert.equal(f.window.document.documentElement.hasAttribute('data-theme-reveal'), false);
  button.click(); assert.equal(f.window.document.documentElement.dataset.theme, 'light');
  assert.equal(button.getAttribute('aria-label'), '切换深色模式'); f.finish();
  await new Promise(resolve => setImmediate(resolve)); f.dom.window.close();
});
test('unsupported, reduced motion, disabled animation and API failure preserve immediate theme switching', () => {
  for (const options of [{ supported: false }, { reduced: true }, { motion: 'off' }, { fail: true }]) {
    const f = fixture(options); f.window.document.querySelector('button').click();
    assert.equal(f.window.document.documentElement.dataset.theme, 'dark');
    assert.equal(f.window.localStorage.getItem('morii-theme'), 'dark');
    assert.equal(f.window.document.querySelector('button').hasAttribute('aria-busy'), false);
    assert.equal(f.calls.length, 0); f.dom.window.close();
  }
});
test('leaving a page cancels a pending reveal without reverting the applied theme', async () => {
  const f = fixture(); f.window.document.querySelector('button').click();
  f.window.dispatchEvent(new f.window.Event('pagehide'));
  await new Promise(resolve => setImmediate(resolve));
  assert.ok(f.skipped > 0); assert.equal(f.window.document.documentElement.dataset.theme, 'dark');
  assert.equal(f.window.document.querySelector('button').hasAttribute('aria-busy'), false); f.dom.window.close();
});
test('legacy stored visual preferences do not change owner-configured effects before first paint', () => {
  const init = fs.readFileSync(path.join(__dirname, '../source/js/theme-init.js'), 'utf8');
  for (const enabled of ['on', 'off']) {
    const dom = new JSDOM(`<html data-effects="${enabled}" data-motion="on" data-glass="on"></html>`, { url: 'https://example.test', runScripts: 'outside-only' });
    dom.window.localStorage.setItem('morii-effects', '{"motion":false,"glass":false,"particles":false}');
    dom.window.eval(init);
    assert.equal(dom.window.document.documentElement.dataset.motion, 'on');
    assert.equal(dom.window.document.documentElement.dataset.glass, 'on');
    assert.equal(dom.window.document.documentElement.hasAttribute('data-effects-particles'), false);
    dom.window.close();
  }
});

test('mobile menu reports its state and returns keyboard focus when dismissed', () => {
  const dom = new JSDOM('<html><nav class="site-nav" id="site-nav"><a href="/about/">关于</a></nav><button id="menu-toggle" aria-label="打开菜单" aria-controls="site-nav" aria-expanded="false">菜单</button><main></main></html>', { url: 'https://example.test/', runScripts: 'outside-only' });
  const { window } = dom;
  const button = window.document.getElementById('menu-toggle');
  window.eval(source);
  button.focus(); button.click();
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.equal(button.getAttribute('aria-label'), '关闭菜单');
  window.document.querySelector('.site-nav a').focus();
  window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  assert.equal(window.document.activeElement, button);
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(button.getAttribute('aria-label'), '打开菜单');
  button.click();
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
  window.dispatchEvent(new window.Event('resize'));
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(window.document.querySelector('.site-nav').classList.contains('is-open'), false);
  dom.window.close();
});

test('navigation prefetches intended local pages without fetching external links', () => {
  const dom = new JSDOM('<html><head></head><body><a id="internal" href="/archives/">文章</a><a id="external" href="https://elsewhere.test/">外站</a></body></html>', { url: 'https://example.test/', runScripts: 'outside-only', pretendToBeVisual: true });
  const { window } = dom;
  window.eval(source);
  const internal = window.document.getElementById('internal');
  const external = window.document.getElementById('external');
  internal.dispatchEvent(new window.FocusEvent('focusin', { bubbles: true }));
  internal.dispatchEvent(new window.FocusEvent('focusin', { bubbles: true }));
  external.dispatchEvent(new window.FocusEvent('focusin', { bubbles: true }));
  assert.deepEqual([...window.document.querySelectorAll('link[rel="prefetch"]')].map(node => node.href), ['https://example.test/archives/']);
  dom.window.close();
});

test('deferred noncritical styles activate when theme behavior starts', () => {
  const dom = new JSDOM('<html><head><link rel="stylesheet" href="/css/style.css"><link rel="stylesheet" href="/css/search.css" media="print" data-deferred-style></head><body></body></html>', { url: 'https://example.test/', runScripts: 'outside-only' });
  dom.window.eval(source);
  assert.equal(dom.window.document.querySelector('[data-deferred-style]').media, 'all');
  assert.equal(dom.window.document.querySelector('link[href="/css/style.css"]').media, '');
  dom.window.close();
});
