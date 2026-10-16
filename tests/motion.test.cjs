'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync(path.join(__dirname, '../source/js/motion.js'), 'utf8');
function fixture({ reduced = false, support = true, enabled = true } = {}) {
  const dom = new JSDOM(`<html data-motion="${enabled ? 'on' : 'off'}"><body><main id="main"><section class="hero__main"></section><article class="post-card"><a href="#">阅读</a></article></main></body></html>`, { runScripts: 'outside-only', pretendToBeVisual: true });
  const { window } = dom;
  const observers = []; const mutations = []; const animations = [];
  const preference = { matches: reduced, addEventListener(type, listener) { this.changed = listener; } };
  window.matchMedia = () => preference;
  window.Element.prototype.getClientRects = function () { return this.hidden ? [] : [{}]; };
  if (support) {
    window.IntersectionObserver = class {
      constructor(callback) { this.callback = callback; this.elements = new Set(); observers.push(this); }
      observe(element) { this.elements.add(element); }
      unobserve(element) { this.elements.delete(element); }
      disconnect() { this.elements.clear(); }
      enter(elements) { this.callback(elements.map(target => ({ target, isIntersecting: true }))); }
    };
    window.MutationObserver = class {
      constructor(callback) { this.callback = callback; mutations.push(this); }
      observe() {} disconnect() {}
    };
    window.Element.prototype.animate = function (frames, options) {
      const animation = { element: this, frames, options, cancelled: false, finished: new Promise(() => {}), cancel() { this.cancelled = true; } };
      animations.push(animation); return animation;
    };
  }
  window.eval(source);
  return { dom, window, observers, mutations, animations, preference };
}

test('cards reveal once, newly inserted cards join, and keyboard focus cancels the reveal', () => {
  const f = fixture(); const { document } = f.window;
  const card = document.querySelector('.post-card');
  f.observers[0].enter([card]);
  assert.equal(f.animations.length, 1);
  assert.equal(f.observers[0].elements.has(card), false);
  f.observers[0].enter([card]);
  assert.equal(f.animations.length, 1);
  card.querySelector('a').focus();
  assert.equal(f.animations[0].cancelled, true);
  const added = document.createElement('article'); added.className = 'friend-card';
  document.querySelector('main').append(added);
  f.mutations[0].callback([{ addedNodes: [added] }]);
  assert.equal(f.observers[0].elements.has(added), true);
  f.observers[0].enter([added]);
  assert.equal(f.animations.length, 2);
  f.window.dispatchEvent(new f.window.Event('pagehide'));
  assert.equal(f.animations[1].cancelled, true);
  f.dom.window.close();
});

test('reduced motion, hidden pages and print cancel effects without hiding content', () => {
  const f = fixture(); const { document } = f.window;
  const hero = document.querySelector('.hero__main');
  f.observers[0].enter([hero]); f.observers[1].enter([hero]);
  assert.equal(hero.style.getPropertyValue('--morii-ambient-state'), 'running');
  f.preference.matches = true; f.preference.changed();
  assert.equal(f.animations[0].cancelled, true);
  f.observers[0].enter([document.querySelector('.post-card')]);
  f.mutations[0].callback([{ addedNodes: [document.createElement('article')] }]);
  assert.equal(f.animations.length, 1);
  assert.equal(hero.style.getPropertyValue('--morii-ambient-state'), 'paused');
  f.preference.matches = false; f.preference.changed();
  const latest = f.observers.at(-2);
  const card = document.querySelector('.post-card'); latest.enter([card]);
  Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  document.dispatchEvent(new f.window.Event('visibilitychange'));
  assert.equal(document.documentElement.hasAttribute('data-motion-paused'), true);
  assert.equal(f.animations.at(-1).cancelled, true);
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  document.dispatchEvent(new f.window.Event('visibilitychange'));
  f.window.dispatchEvent(new f.window.Event('beforeprint'));
  assert.equal(latest.elements.size, 0);
  assert.equal(card.style.opacity, '');
  assert.equal(card.hidden, false);
  f.dom.window.close();
});

test('disabled motion, unsupported browsers and initial reduced motion keep all content visible', () => {
  for (const options of [{ enabled: false }, { support: false }, { reduced: true }]) {
    const f = fixture(options);
    assert.equal(f.observers.length, 0);
    assert.equal(f.animations.length, 0);
    assert.equal(f.window.document.querySelector('.post-card').hidden, false);
    assert.equal(f.window.document.querySelector('.post-card').style.opacity, '');
    f.dom.window.close();
  }
});
