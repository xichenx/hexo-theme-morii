'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
global.hexo = { extend: { helper: { register() {} }, generator: { register() {} } } };
const { normalize, mediaUrl, embedUrl } = require('../scripts/cinema.js');

test('cinema catalog keeps safe local and HTTPS video sources and episode order', () => {
  const films = normalize([
    { title: '剧集', type: 'series', episodes: [{ title: '第一集', url: '/videos/one.mp4' }, { title: '第二集', url: 'https://cdn.example.com/two.webm' }, { title: '无效', url: 'javascript:alert(1)' }] },
    { title: '电影', url: '/films/movie.mp4' }
  ]);
  assert.deepEqual(films.map(film => film.type), ['series', 'movie']);
  assert.deepEqual(films[0].episodes.map(episode => episode.title), ['第一集', '第二集']);
  assert.equal(films[1].episodes[0].url, '/films/movie.mp4');
  for (const value of ['//evil.example/movie.mp4', '/videos/../secret.mp4', 'javascript:alert(1)', 'http://example.com/movie.mp4', 'https://user:pass@example.com/movie.mp4']) assert.equal(mediaUrl(value), '');
  assert.equal(embedUrl('https://evil.example/embed/movie'), '');
});

test('cinema watchlist keys survive catalog reordering and distinguish same-title works', () => {
  const original = { title: '同名作品', type: 'series', year: 2024 };
  const remake = { ...original, year: 2026 };
  const explicit = { ...remake, id: 'remake' };
  const films = normalize([original, remake, explicit]);
  const reordered = normalize([{ ...explicit, title: '新片名' }, remake, original]);
  assert.equal(new Set(films.map(film => film.watchKey)).size, 3);
  assert.deepEqual(reordered.map(film => film.watchKey), films.map(film => film.watchKey).reverse());
  assert.deepEqual(reordered.map(film => film.path), films.map(film => film.path).reverse());
});

test('film details preserve reviews and accept only valid trailer and watch URLs', () => {
  const [film] = normalize([{
    id: 'my-film',
    title: '电影',
    review: '推荐理由',
    featured: true,
    trailer: { embed: 'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE' },
    watch: [{ label: '观看', url: 'https://example.com/movie' }, { label: '无效', url: 'javascript:alert(1)' }]
  }]);
  assert.equal(film.path, 'cinema/detail/my-film/');
  assert.equal(film.review, '推荐理由');
  assert.equal(film.featured, true);
  assert.equal(film.trailer.kind, 'embed');
  assert.deepEqual(film.watch, [{ label: '观看', url: 'https://example.com/movie' }]);
});

test('Bilibili video and episode pages resolve to the official player and keep a watch link', () => {
  const [film] = normalize([{
    title: '我的三体',
    episodes: [
      { url: 'https://www.bilibili.com/bangumi/play/ep30636?spm_id_from=demo' },
      { url: 'https://www.bilibili.com/video/BV1B7411m7LV/?p=2&spm_id_from=demo' },
      { url: 'https://m.bilibili.com/video/av1234567' },
      { url: 'https://www.bilibili.com/bangumi/play/ss1704' },
      { url: 'https://b23.tv/short' },
      { embed: 'https://player.bilibili.com/player.html?episodeId=30636&autoplay=0' }
    ],
    trailer: { url: 'https://www.bilibili.com/video/BV1B7411m7LV' }
  }]);
  assert.deepEqual(film.episodes.map(({ kind, url, watchUrl }) => [kind, url, watchUrl]), [
    ['embed', 'https://player.bilibili.com/player.html?episodeId=30636&autoplay=1', 'https://www.bilibili.com/bangumi/play/ep30636'],
    ['embed', 'https://player.bilibili.com/player.html?bvid=BV1B7411m7LV&p=2&autoplay=1', 'https://www.bilibili.com/video/BV1B7411m7LV?p=2'],
    ['embed', 'https://player.bilibili.com/player.html?aid=1234567&autoplay=1', 'https://www.bilibili.com/video/av1234567'],
    ['embed', 'https://player.bilibili.com/player.html?episodeId=30636&autoplay=0', 'https://www.bilibili.com/bangumi/play/ep30636']
  ]);
  assert.equal(film.trailer.kind, 'embed');
  const [single] = normalize([{ title: '单集', url: 'https://www.bilibili.com/bangumi/play/ep30636' }]);
  assert.equal(single.episodes[0].watchUrl, film.episodes[0].watchUrl);
});
