'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync(path.join(__dirname, '../source/js/effects.js'), 'utf8');
function fixture({ reduced = false, saveData = false, motion = 'on', width = 1280, support = true, preference, tilt = true, ripple = true } = {}) {
  const dom = new JSDOM(`<html data-motion="${motion}"><body><div class="morii-atmosphere"><canvas id="morii-particles" data-density="48"></canvas></div><main id="main"><a class="feature-card" href="#">Read</a></main><script data-spotlight="on" data-tilt="${tilt ? 'on' : 'off'}" data-ripple="${ripple ? 'on' : 'off'}"></script></body></html>`, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://example.test/' });
  const { window } = dom;
  Object.defineProperty(window.document, 'currentScript', { value: window.document.querySelector('script') });
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
  Object.defineProperty(window, 'devicePixelRatio', { value: 3 });
  const media = [];
  window.matchMedia = query => { const result = { matches: query.includes('reduced') ? reduced : query.includes('pointer'), addEventListener(type, fn) { this.change = fn; } }; media.push(result); return result; };
  const connection = { saveData, addEventListener(type, fn) { this.change = fn; } };
  Object.defineProperty(window.navigator, 'connection', { value: connection });
  const pending = new Map(); let id = 0, painted = 0, cleared = 0, requested = 0;
  window.requestAnimationFrame = callback => { pending.set(++id, callback); return id; };
  window.cancelAnimationFrame = key => pending.delete(key);
  const context = { clearRect() { cleared++; }, setTransform() {}, beginPath() {}, arc() { painted++; }, fill() {}, moveTo() {}, lineTo() {}, stroke() {} };
  window.HTMLCanvasElement.prototype.getContext = () => { requested++; return support ? context : null; };
  if (preference) window.localStorage.setItem('morii-effects', JSON.stringify(preference));
  window.eval(source);
  return { dom, window, media, connection, pending, get painted() { return painted; }, get cleared() { return cleared; }, get requested() { return requested; }, tick(time = 100) { const jobs = [...pending.values()]; pending.clear(); jobs.forEach(fn => fn(time)); } };
}
test('particle loop obeys mobile density and pixel ratio budget; theme lifecycle pauses and resumes', () => {
  const f = fixture({ width: 390 }); const { window } = f;
  f.tick(); assert.equal(f.painted, 18);
  assert.equal(window.document.querySelector('canvas').width, 585);
  assert.equal(f.pending.size, 1);
  Object.defineProperty(window.document, 'hidden', { value: true, configurable: true });
  window.document.dispatchEvent(new window.Event('visibilitychange'));
  assert.equal(f.pending.size, 0); assert.ok(window.document.documentElement.hasAttribute('data-effects-paused'));
  Object.defineProperty(window.document, 'hidden', { value: false, configurable: true });
  window.document.dispatchEvent(new window.Event('visibilitychange')); assert.equal(f.pending.size, 1);
  window.dispatchEvent(new window.Event('beforeprint')); assert.equal(f.pending.size, 0);
  window.dispatchEvent(new window.Event('afterprint')); assert.equal(f.pending.size, 1);
  window.dispatchEvent(new window.Event('pagehide')); assert.equal(f.pending.size, 0);
  window.dispatchEvent(new window.Event('pageshow')); assert.equal(f.pending.size, 1);
  f.dom.window.close();
});
test('reduced motion, disabled motion and data saver do not allocate a canvas; preference changes cancel running work', () => {
  for (const options of [{ reduced: true }, { saveData: true }, { motion: 'off' }]) {
    const f = fixture(options); assert.equal(f.requested, 0); assert.equal(f.pending.size, 0); f.dom.window.close();
  }
  const f = fixture(); f.tick();
  f.media[0].matches = true; f.media[0].change(); assert.equal(f.pending.size, 0);
  f.media[0].matches = false; f.media[0].change(); assert.equal(f.pending.size, 1);
  f.connection.saveData = true; f.connection.change(); assert.equal(f.pending.size, 0);
  assert.ok(f.cleared > 0); f.dom.window.close();
});
test('spotlight remains usable without canvas support and clears on scroll and coarse pointer changes', () => {
  const f = fixture({ support: false }); const { window } = f;
  const card = window.document.querySelector('.feature-card');
  card.dispatchEvent(new window.MouseEvent('pointermove', { bubbles: true, clientX: 80, clientY: 90 }));
  f.tick(); assert.equal(card.style.getPropertyValue('--light-x'), '80px'); assert.ok(card.hasAttribute('data-light-active'));
  window.dispatchEvent(new window.Event('scroll')); assert.equal(card.hasAttribute('data-light-active'), false);
  assert.equal(card.querySelector('.morii-card-light').getAttribute('aria-hidden'), 'true');
  assert.equal(f.pending.size, 0);
  f.media[2].matches = false; f.media[2].change();
  card.dispatchEvent(new window.MouseEvent('pointermove', { bubbles: true })); assert.equal(f.pending.size, 0);
  f.dom.window.close();
});
test('effect configuration clamps invalid density and supports independent switches', () => {
  let helper; const config = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../scripts/effects.js'), 'utf8'), { hexo: { theme: { config }, extend: { helper: { register(name, fn) { helper = fn; } } } } });
  assert.equal(helper().density, 48);
  config.appearance = { effects: { density: 'broken', particles: false, glass: true } };
  assert.equal(helper().density, 48); assert.equal(helper().particles, false); assert.equal(helper().glass, true);
  config.appearance.effects.density = 999; assert.equal(helper().density, 80);
  config.appearance.effects.density = -5; assert.equal(helper().density, 12);
  config.appearance.effects.enable = false;
  for (const key of ['enabled', 'particles', 'aurora', 'glass', 'spotlight', 'tilt', 'ripple', 'transition']) assert.equal(helper()[key], false);
});

test('tilt is bounded and reset on scroll', () => {
  const f = fixture(); const { window } = f;
  const card = window.document.querySelector('.feature-card');
  card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 });
  card.dispatchEvent(new window.MouseEvent('pointermove', { bubbles: true, clientX: 500, clientY: 500 }));
  f.tick(); assert.equal(card.style.getPropertyValue('--tilt-x'), '-3deg'); assert.equal(card.style.getPropertyValue('--tilt-y'), '3deg');
  window.dispatchEvent(new window.Event('scroll')); assert.equal(card.style.getPropertyValue('--tilt-x'), '');
  f.dom.window.close();
});

test('legacy visitor preferences and storage events cannot override configured effects', () => {
  const f = fixture({ preference: { motion: false, particles: false, glass: false } }); const { window } = f;
  assert.equal(f.requested, 1); assert.equal(f.pending.size, 1);
  assert.equal(window.document.documentElement.dataset.motion, 'on');
  window.dispatchEvent(new window.StorageEvent('storage', { key: 'morii-effects', newValue: '{"motion":false,"particles":false}' }));
  f.tick(); assert.equal(f.painted, 48); assert.equal(f.pending.size, 1);
  assert.equal(window.document.documentElement.dataset.motion, 'on');
  f.dom.window.close();
});

test('ripple does not intercept clicks and cancels on lifecycle pause', async () => {
  let cancelled = false;
  const dom = new JSDOM('<html data-motion="on"><div class="morii-atmosphere"></div><button>Action</button><script data-ripple="on"></script></html>', { url: 'https://example.test', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  Object.defineProperty(w.document, 'currentScript', { value: w.document.querySelector('script') });
  w.matchMedia = () => ({ matches: false, addEventListener() {} });
  w.Element.prototype.animate = () => ({ finished: new Promise(() => {}), cancel() { cancelled = true; } });
  const button = w.document.querySelector('button'); button.getBoundingClientRect = () => ({ width: 80, height: 40, top: 0, left: 0 });
  w.eval(source); let clicks = 0; button.addEventListener('click', () => clicks++);
  button.click(); assert.equal(clicks, 1); assert.ok(button.querySelector('.morii-ripple'));
  w.dispatchEvent(new w.Event('pagehide')); assert.equal(cancelled, true); assert.equal(button.querySelector('.morii-ripple'), null);
  dom.window.close();
});
