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
