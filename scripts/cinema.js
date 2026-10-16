'use strict';

const { URL } = require('node:url');

const types = { movie: '电影', series: '电视剧', anime: '动漫' };
const clean = value => typeof value === 'string' ? value.trim() : '';

function mediaUrl(value) {
  const source = clean(value);
  if (!source || /[\\\u0000-\u001f]/.test(source)) return '';
  if (source.startsWith('/') && !source.startsWith('//') && !source.split('/').includes('..')) return source;
  try {
    const url = new URL(source);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}

function embedUrl(value) {
  const source = mediaUrl(value);
  if (!source.startsWith('https://')) return '';
  const url = new URL(source);
  const allowed = (url.hostname === 'www.youtube-nocookie.com' || url.hostname === 'www.youtube.com') && /^\/embed\/[\w-]+$/.test(url.pathname)
    || url.hostname === 'player.bilibili.com' && url.pathname === '/player.html'
    || url.hostname === 'player.vimeo.com' && /^\/video\/\d+$/.test(url.pathname);
  return allowed ? url.href : '';
}

function normalize(items) {
  if (!Array.isArray(items)) return [];
  return items.flatMap((item, index) => {
    if (!item || !clean(item.title)) return [];
    const rawEpisodes = Array.isArray(item.episodes) ? item.episodes : [{ title: '播放', url: item.url, embed: item.embed }];
    const episodes = rawEpisodes.flatMap((episode, episodeIndex) => {
      if (!episode || typeof episode !== 'object') return [];
      const embed = embedUrl(episode.embed);
      const url = mediaUrl(episode.url);
      if (!embed && !url) return [];
      return [{ title: clean(episode.title) || `第 ${episodeIndex + 1} 集`, url: embed || url, kind: embed ? 'embed' : 'video' }];
    });
    return [{ id: `cinema-${index}`, title: clean(item.title), type: types[item.type] ? item.type : 'movie', year: clean(String(item.year || '')), description: clean(item.description), cover: mediaUrl(item.cover), episodes }];
  });
}

hexo.extend.helper.register('morii_cinema_catalog', function () {
  const data = this.site?.data?.cinema;
  return normalize(Array.isArray(data) ? data : hexo.theme.config.cinema?.items);
});

hexo.extend.generator.register('morii-cinema', () => {
  if (hexo.theme.config.cinema?.enable === false) return [];
  return { path: 'cinema/index.html', layout: 'page', data: { title: hexo.theme.config.cinema?.title || '电影院', description: hexo.theme.config.cinema?.description || '挑一部喜欢的作品，慢慢看。', type: 'cinema', comments: false } };
});

module.exports = { mediaUrl, embedUrl, normalize };
