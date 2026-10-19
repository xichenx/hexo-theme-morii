const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const script = name => fs.readFileSync(path.join(root, 'source/js', name), 'utf8');
const tick = () => new Promise(resolve => setImmediate(resolve));
const musicMarkup = music => {
  const locals = { morii_music: () => music, theme: {}, config: { author: '作者' }, url_for: value => value };
  const pug = require('pug');
  return pug.renderFile(path.join(root, 'layout/includes/page/music-room.pug'), locals) + pug.renderFile(path.join(root, 'layout/includes/music-hub.pug'), locals);
};


test('music configuration supports local audio and rejects unsafe URLs', () => {
  const helpers = loadHelpers('music.js', { music: { embed_url: 'http://example.test/embed', tracks: [
    { title: '本地曲目', url: '/audio/local.mp3', cover: 'javascript:alert(1)' },
    { title: '危险', url: 'javascript:alert(1)' },
    { title: '凭据', url: 'https://user:password@example.test/audio' }
  ] } });
  const music = helpers.morii_music();
  assert.equal(music.tracks.length, 1);
  assert.equal(music.tracks[0].url, '/audio/local.mp3');
  assert.equal(music.tracks[0].cover, '');
  assert.equal(music.embed, '');
});

test('music queue switches tracks, filters searches and handles playback failure', async () => {
  const music = { title: '收藏', description: '旋律', playlist: '', embed: '', tracks: [
    { title: '第一首', artist: '甲', url: '/one.mp3', cover: '' },
    { title: '第二首', artist: '乙', url: '/two.mp3', cover: '' },
    { title: '第三首', artist: '乙', url: '/three.mp3', cover: '' }
  ] };
  const html = musicMarkup(music);
  const dom = browser(html);
  const { window } = dom;
  const document = window.document;
  const player = document.querySelector('#music-player');
  let paused = true;
  let rejected = false;
  Object.defineProperty(player, 'paused', { get: () => paused });
  player.pause = () => { paused = true; player.dispatchEvent(new window.Event('pause')); };
  player.play = async () => {
    if (rejected) throw new Error('unavailable');
    paused = false;
    player.dispatchEvent(new window.Event('play'));
    player.dispatchEvent(new window.Event('playing'));
  };
  window.eval(script('music.js'));
  assert.equal(paused, true);
  const rows = [...document.querySelectorAll('.music-track-row')];
  rows[0].click();
  await tick();
  assert.equal(paused, false);
  rows[0].click();
  assert.equal(paused, true);
  document.querySelector('#music-next').click();
  await tick();
  assert.equal(document.querySelector('#music-current-title').textContent, '第二首');
  assert.ok(player.src.endsWith('/two.mp3'));
  player.dispatchEvent(new window.Event('ended'));
  await tick();
  assert.equal(document.querySelector('#music-current-title').textContent, '第三首');
  assert.equal(document.querySelector('#music-next').disabled, true);
  const search = document.querySelector('#music-search');
  search.value = '乙';
  search.dispatchEvent(new window.Event('input'));
  assert.equal(rows.filter(row => !row.hidden).length, 2);
  search.value = '未找到';
  search.dispatchEvent(new window.Event('input'));
  assert.equal(document.querySelector('#music-search-empty').hidden, false);
  rejected = true;
  document.querySelector('#music-previous').click();
  await tick();
  assert.ok(document.querySelector('#music-play-status').textContent.includes('暂时无法播放'));
  assert.ok(document.querySelector('#music-source').href.endsWith('/two.mp3'));
  window.close();
});

test('remote music retries failure, normalizes Meting fields and rejects unsafe tracks', async () => {
  const music = loadHelpers('music.js', { music: { meting: { enable: true, server: 'tencent', type: 'playlist', id: '123&456' } } }).morii_music();
  const html = musicMarkup(music);
  const dom = browser(html);
  const { window } = dom;
  const document = window.document;
  let fail = true;
  let endpoint;
  window.fetch = async url => {
    endpoint = url;
    if (fail) throw new Error('offline');
    return { ok: true, json: async () => [
      { title: '<安全标题>', author: '艺术家', url: 'https://audio.example.test/one.mp3', pic: 'https://cover.example.test/one.jpg' },
      { name: '旧版字段', artist: '乙', url: '/two.mp3', cover: 'javascript:bad' },
      { name: '危险', url: 'javascript:bad' },
      { name: '凭据', url: 'https://secret:password@example.test/audio.mp3' }
    ] };
  };
  window.eval(script('music.js'));
  await tick();
  assert.equal(document.querySelector('#music-retry').hidden, false);
  assert.ok(document.querySelector('#music-fetch-status').textContent.includes('获取失败'));
  fail = false;
  document.querySelector('#music-retry').click();
  await tick();
  assert.ok(endpoint.includes('id=123%26456'));
  assert.equal(document.querySelectorAll('.music-track-row').length, 2);
  assert.equal(document.querySelector('.music-track-copy strong').textContent, '<安全标题>');
  assert.equal(document.querySelector('.music-track-copy strong').children.length, 0);
  assert.equal(document.querySelector('[data-music-cover]').hidden, false);
  assert.equal(window.MoriiMusic.state.tracks[1].cover, '');
  assert.equal(document.querySelector('#music-player').paused, true);
  assert.equal(document.querySelector('#music-retry').hidden, true);
  assert.ok(document.querySelector('#music-fetch-status').textContent.includes('2 首'));
  const cacheKey = 'morii-music:tencent:playlist:123&456';
  const cached = window.sessionStorage.getItem(cacheKey);
  assert.equal(JSON.parse(cached).tracks.length, 2);
  window.close();
  const repeat = browser(html);
  repeat.window.sessionStorage.setItem(cacheKey, cached);
  let repeatedFetches = 0;
  repeat.window.fetch = () => { repeatedFetches++; throw Error('cache should avoid the request'); };
  repeat.window.eval(script('music.js'));
  assert.equal(repeat.window.document.querySelectorAll('.music-track-row').length, 2);
  assert.equal(repeatedFetches, 0);
  repeat.window.close();
});

test('unplayed music does not take over normal page navigation', () => {
  const dom = browser(musicMarkup({ title: '音乐', tracks: [{ title: '第一首', url: '/one.mp3' }] }) + '<a href="/archives/"><span>文章</span></a>');
  const { window } = dom;
  const audio = window.document.querySelector('#music-player');
  audio.play = async () => {};
  window.eval(script('music.js'));
  const link = window.document.querySelector('a[href="/archives/"] span');
  const click = () => {
    let intercepted;
    const inspect = event => { intercepted = event.defaultPrevented; event.preventDefault(); };
    window.document.addEventListener('click', inspect);
    link.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
    window.document.removeEventListener('click', inspect);
    return intercepted;
  };
  assert.equal(click(), false);
  dom.window.close();
});

test('music lyrics reject stale responses, follow time and support seeking', async () => {
  const music = { volume: .5, title: '歌词测试', description: '', tracks: [
    { title: '第一首', artist: '甲', url: '/one.mp3', lrc: '/one.lrc' },
    { title: '第二首', artist: '乙', url: '/two.mp3', lrc: '/two.lrc' }
  ] };
  const dom = browser(musicMarkup(music));
  const { window } = dom;
  const document = window.document;
  let oldResponse;
  window.fetch = async url => ({ ok: true, text: () => url.endsWith('one.lrc') ? new Promise(resolve => { oldResponse = resolve; }) : Promise.resolve('[offset:100]\n[00:01.00][00:03.50]第二首歌词\n[00:06.000]下一行') });
  const audio = document.querySelector('#music-player');
  audio.play = async () => { audio.dispatchEvent(new window.Event('playing')); };
  Object.defineProperty(audio, 'duration', { get: () => 10 });
  window.eval(script('music.js'));
  await tick();
  document.querySelector('#music-next').click();
  await tick();
  oldResponse('[00:00.00]过期歌词');
  await tick();
  assert.equal(window.MoriiMusic.state.lyrics.length, 3);
  assert.equal(window.MoriiMusic.state.lyrics[0].time, 1.1);
  assert.equal(document.querySelector('.music-lyric-line').textContent, '第二首歌词');
  audio.currentTime = 3.8;
  audio.dispatchEvent(new window.Event('timeupdate'));
  assert.equal(document.querySelector('[data-lyric-index="1"]').getAttribute('aria-current'), 'true');
  document.querySelector('[data-lyric-index="2"]').click();
  assert.equal(audio.currentTime, 6.1);
  assert.equal(document.querySelector('[data-lyric-index="2"]').getAttribute('aria-current'), 'true');
  document.querySelector('#music-mode').click();
  assert.equal(window.MoriiMusic.state.mode, 1);
  document.querySelector('.music-volume').value = '.3';
  document.querySelector('.music-volume').dispatchEvent(new window.Event('input'));
  assert.equal(audio.volume, .3);
  window.close();
});

test('floating music capsule expands lyrics, keeps playback when collapsed and follows pause state', async () => {
  const dom = browser(musicMarkup({ title: '音乐', tracks: [{ title: '测试曲目', artist: '甲', url: '/one.mp3', lyrics: '[00:01.00]开场歌词' }] }));
  const { window } = dom;
  const document = window.document;
  const audio = document.querySelector('#music-player');
  let paused = true;
  Object.defineProperty(audio, 'paused', { get: () => paused });
  Object.defineProperty(audio, 'duration', { get: () => 120 });
  audio.play = async () => { paused = false; audio.dispatchEvent(new window.Event('playing')); };
  audio.pause = () => { paused = true; audio.dispatchEvent(new window.Event('pause')); };
  window.eval(script('music.js'));
  await tick();
  const float = document.querySelector('.music-float');
  const ball = document.querySelector('.music-ball');
  const title = document.querySelector('.music-float-track');
  ball.click();
  await tick();
  assert.equal(paused, false);
  assert.equal(float.classList.contains('is-expanded'), true);
  assert.equal(ball.getAttribute('aria-label'), '暂停音乐');
  title.click();
  assert.equal(float.classList.contains('is-expanded'), false);
  assert.equal(paused, false);
  assert.equal(document.querySelector('#music-capsule-lyrics').getAttribute('aria-hidden'), 'true');
  title.click();
  title.focus();
  title.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(title.getAttribute('aria-expanded'), 'false');
  audio.currentTime = 60;
  audio.dispatchEvent(new window.Event('timeupdate'));
  assert.equal(document.querySelector('.music-capsule-progress').style.transform, 'scaleX(0.5)');
  assert.equal(document.querySelector('[data-music-mini-lyric]').textContent, '开场歌词');
  ball.click();
  assert.equal(paused, true);
  assert.equal(float.classList.contains('is-playing'), false);
  assert.equal(title.getAttribute('aria-expanded'), 'false');
  assert.equal(ball.getAttribute('aria-label'), '播放音乐');
  window.close();
});

function browser(html) {
  const dom = new JSDOM(html, { url: 'https://blog.example.test/', runScripts: 'outside-only', pretendToBeVisual: true });
  const { window } = dom;
  window.matchMedia = () => ({ matches: false, addEventListener() {} });
  window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  window.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new window.Event('close')); };
  return dom;
}
function loadHelpers(file, theme = {}, config = {}) {
  const helpers = {};
  vm.runInNewContext(fs.readFileSync(path.join(root, 'scripts', file), 'utf8'), {
    hexo: { theme: { config: theme }, config, extend: { helper: { register(name, fn) { helpers[name] = fn; } } } }, require
  });
  return helpers;
}

