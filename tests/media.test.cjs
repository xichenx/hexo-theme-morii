'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync(path.join(__dirname, '../source/js/media.js'), 'utf8');
function fixture() {
  const dom = new JSDOM(`<body><article class="article-body"><img id="one" src="/one.png" alt="第一张"><img id="two" src="/two.png" alt="第二张"><a href="https://example.org/"><img id="linked" src="/linked.png"></a></article><dialog id="image-dialog"><div id="image-stage"><img id="image-preview"></div><p id="image-caption"></p><p id="image-status"></p><button id="image-close"></button><button id="image-previous"></button><button id="image-next"></button><span id="image-counter"></span><button id="image-retry"></button><a id="image-original"></a><button id="image-zoom-out"></button><output id="image-scale"></output><button id="image-zoom-in"></button><button id="image-reset"></button></dialog></body>`, { url: 'https://example.test/', runScripts: 'outside-only' });
  const { window } = dom;
  const document = window.document;
  const dialog = document.querySelector('dialog');
  dialog.showModal = () => { dialog.open = true; };
  dialog.close = () => { dialog.open = false; dialog.dispatchEvent(new window.Event('close')); };
  const stage = document.getElementById('image-stage');
  const preview = document.getElementById('image-preview');
  for (const [element, width, height] of [[stage, 400, 400], [preview, 200, 400]]) {
    Object.defineProperty(element, 'clientWidth', { value: width });
    Object.defineProperty(element, 'clientHeight', { value: height });
  }
  const loads = [];
  window.Image = class { constructor() { loads.push(this); } };
  const load = () => loads.at(-1).onload?.();
  const fail = () => loads.at(-1).onerror?.();
  window.eval(source);
  const click = id => {
    document.getElementById(id).click();
    if (['one', 'two', 'image-retry'].includes(id)) load();
  };
  const key = value => document.dispatchEvent(new window.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }));
  const pointer = (type, id, x, y) => {
    const event = new window.Event(type, { bubbles: true, cancelable: true });
    Object.assign(event, { pointerId: id, pointerType: 'touch', button: 0, clientX: x, clientY: y });
    stage.dispatchEvent(event);
  };
  return { dom, window, document, dialog, stage, preview, click, key, pointer, load, fail, loads, scale: () => document.getElementById('image-scale').value };
}

test('image zoom clamps bounds, pans within the picture and resets on navigation and close', () => {
  const f = fixture();
  f.click('one');
  assert.ok(f.dialog.open);
  assert.equal(f.document.getElementById('image-counter').textContent, '1 / 2');
  assert.ok(f.document.getElementById('image-zoom-out').disabled);
  f.stage.dispatchEvent(new f.window.MouseEvent('dblclick', { bubbles: true }));
  assert.equal(f.scale(), '2.0×');
  f.pointer('pointerdown', 1, 100, 100);
  f.pointer('pointermove', 1, 900, 900);
  assert.equal(f.preview.style.transform, 'translate(0px, 200px) scale(2)');
  f.pointer('pointerup', 1, 900, 900);
  assert.equal(f.document.getElementById('image-counter').textContent, '1 / 2', 'Panning must not change image');
  f.key('ArrowRight');
  f.load();
  assert.equal(f.scale(), '1.0×');
  assert.equal(f.preview.alt, '第二张');
  assert.ok(f.document.getElementById('image-next').disabled);
  for (let i = 0; i < 30; i++) f.key('+');
  assert.equal(f.scale(), '8.0×');
  assert.ok(f.document.getElementById('image-zoom-in').disabled);
  f.key('0');
  assert.equal(f.scale(), '1.0×');
  f.click('image-zoom-in');
  f.click('image-close');
  assert.equal(f.preview.getAttribute('src'), null);
  f.click('one');
  assert.equal(f.scale(), '1.0×');
  f.dom.window.close();
});

test('touch swipe changes images only when fitted; pinch and cancelled gestures never navigate', () => {
  const f = fixture();
  f.click('one');
  f.pointer('pointerdown', 1, 200, 100);
  f.pointer('pointerup', 1, 100, 110);
  f.load();
  assert.equal(f.preview.alt, '第二张');
  f.pointer('pointerdown', 1, 100, 100);
  f.pointer('pointerdown', 2, 200, 100);
  f.pointer('pointermove', 2, 300, 100);
  assert.equal(f.scale(), '2.0×');
  f.pointer('pointerup', 2, 300, 100);
  f.pointer('pointerup', 1, 300, 100);
  assert.equal(f.preview.alt, '第二张');
  f.click('image-reset');
  f.pointer('pointerdown', 1, 100, 100);
  f.pointer('pointercancel', 1, 300, 100);
  assert.equal(f.preview.alt, '第二张');
  f.pointer('pointerdown', 1, 100, 100);
  f.pointer('pointerup', 1, 200, 110);
  f.load();
  assert.equal(f.preview.alt, '第一张');
  f.dom.window.close();
});

test('wheel zoom is local to the open viewer and keyboard image activation remains supported', () => {
  const f = fixture();
  const wheel = () => {
    const event = new f.window.WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true });
    f.stage.dispatchEvent(event);
    return event.defaultPrevented;
  };
  assert.equal(wheel(), false);
  f.document.getElementById('one').dispatchEvent(new f.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  f.load();
  assert.ok(f.dialog.open);
  assert.equal(wheel(), true);
  assert.equal(f.scale(), '1.1×');
  f.key('-');
  assert.equal(f.scale(), '1.0×');
  f.dom.window.close();
});

test('failed images preserve the viewer state, disable zoom, and recover after retry or switching', () => {
  const f = fixture();
  f.document.getElementById('one').click();
  assert.equal(f.dialog.dataset.imageState, 'loading');
  assert.ok(f.preview.hidden);
  assert.ok(f.document.getElementById('image-zoom-in').disabled);
  f.fail();
  assert.equal(f.dialog.dataset.imageState, 'error');
  assert.ok(f.preview.hidden);
  assert.equal(f.document.getElementById('image-retry').hidden, false);
  f.key('+');
  assert.equal(f.scale(), '1.0×');
  f.click('image-retry');
  assert.equal(f.dialog.dataset.imageState, 'ready');
  assert.equal(f.preview.hidden, false);
  assert.ok(f.document.getElementById('image-retry').hidden);
  f.click('image-zoom-in');
  assert.equal(f.scale(), '1.5×');
  f.fail();
  f.click('image-next');
  assert.equal(f.dialog.dataset.imageState, 'loading');
  f.load();
  assert.equal(f.preview.alt, '第二张');
  assert.equal(f.dialog.dataset.imageState, 'ready');
  assert.equal(f.scale(), '1.0×');
  f.dom.window.close();
});

test('switching keeps the displayed image until decoded and ignores stale requests and close', async () => {
  const f = fixture();
  f.click('one');
  const original = f.preview.src;
  f.key('ArrowRight');
  assert.equal(f.preview.src, original, 'Keep the last rendered image while the next one loads');
  assert.equal(f.preview.hidden, false);
  let decode;
  f.loads.at(-1).decode = () => new Promise(resolve => { decode = resolve; });
  f.load();
  assert.equal(f.preview.src, original, 'Do not swap before decoding finishes');
  f.key('ArrowLeft');
  const staleError = f.loads.at(-1).onerror;
  decode();
  await Promise.resolve();
  assert.equal(f.dialog.dataset.imageState, 'loading', 'Old decode must not mark a new request ready');
  f.load();
  assert.equal(f.preview.alt, '第一张');
  f.click('image-close');
  staleError();
  assert.equal(f.preview.getAttribute('src'), null, 'Late callbacks cannot reopen or populate a closed viewer');
  assert.equal(f.dialog.open, false);
  f.dom.window.close();
});
