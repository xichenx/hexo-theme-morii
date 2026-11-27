'use strict';

const { forPage } = require('../scripts/lib/i18n.cjs');
const t = (...args) => forPage(hexo).t(...args);
const { URL } = require('node:url');
const { createHash } = require('node:crypto');

const types = { movie: t("电影"), series: t("电视剧"), anime: t("动漫") };
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

const bilibiliHosts = new Set(['www.bilibili.com', 'bilibili.com', 'm.bilibili.com']);

function bilibiliSource(url) {
  if (url.port) return null;
  const player = url.hostname === 'player.bilibili.com' && url.pathname === '/player.html';
  if (!player && !bilibiliHosts.has(url.hostname)) return null;
  const video = /^\/video\/(BV[\da-zA-Z]{10}|av[1-9]\d*)\/?$/.exec(url.pathname)?.[1];
  const episode = /^\/bangumi\/play\/ep([1-9]\d*)\/?$/.exec(url.pathname)?.[1];
  const params = url.searchParams;
  const ids = player ? [
    ['episodeId', params.get('episodeId'), /^[1-9]\d*$/, 'bangumi/play/ep'],
    ['bvid', params.get('bvid'), /^BV[\da-zA-Z]{10}$/, 'video/'],
    ['aid', params.get('aid'), /^[1-9]\d*$/, 'video/av']
  ] : [
    ['episodeId', episode, /^[1-9]\d*$/, 'bangumi/play/ep'],
    ['bvid', video, /^BV[\da-zA-Z]{10}$/, 'video/'],
    ['aid', video?.slice(2), /^[1-9]\d*$/, 'video/av']
  ];
  const match = ids.find(([, id, valid]) => id && valid.test(id));
  if (!match) return null;
  const [key, id, , path] = match;
  const watchUrl = new URL(path + id, 'https://www.bilibili.com/');
  const embed = new URL('https://player.bilibili.com/player.html');
  embed.searchParams.set(key, id);
  const part = params.get('p');
  if (key !== 'episodeId' && /^[1-9]\d*$/.test(part || '')) {
    embed.searchParams.set('p', part);
    watchUrl.searchParams.set('p', part);
  }
  embed.searchParams.set('autoplay', '1');
  return { url: player ? url.href : embed.href, kind: 'embed', watchUrl: watchUrl.href };
}

function playback(item) {
  const embed = embedUrl(item.embed);
  if (embed) return bilibiliSource(new URL(embed)) || { url: embed, kind: 'embed' };
  const source = mediaUrl(item.url);
  if (!source) return null;
  if (source.startsWith('https://')) {
    const url = new URL(source);
    const bili = bilibiliSource(url);
    if (bili || bilibiliHosts.has(url.hostname) || url.hostname === 'player.bilibili.com' || url.hostname === 'b23.tv') return bili;
  }
  return { url: source, kind: 'video' };
}

function normalize(items, translate = t) {
  if (!Array.isArray(items)) return [];
  return items.flatMap(item => {
    const title = clean(item?.title);
    if (!title) return [];
    const type = Object.hasOwn(types, item.type) ? item.type : 'movie';
    const year = clean(String(item.year || ''));
    const id = clean(item.id);
    const rawEpisodes = Array.isArray(item.episodes) ? item.episodes : [{ title: translate("播放"), url: item.url, embed: item.embed }];
    const episodes = rawEpisodes.flatMap((episode, episodeIndex) => {
      if (!episode || typeof episode !== 'object') return [];
      const source = playback(episode);
      return source ? [{ title: clean(episode.title) || translate("第 {0} 集", episodeIndex + 1), ...source }] : [];
    });
    const watchKey = id ? `id:${id}` : JSON.stringify([type, year, title]);
    const slug = /^[a-z0-9][a-z0-9-]{0,63}$/.test(id) ? id : '_' + createHash('sha256').update(watchKey).digest('hex').slice(0, 16);
    const trailer = playback(item.trailer || {});
    const watch = (Array.isArray(item.watch) ? item.watch : []).flatMap(link => {
      const url = mediaUrl(link?.url);
      const label = clean(link?.label);
      return url && label ? [{ url, label }] : [];
    });
    const rating = (typeof item.rating === 'number' || clean(item.rating)) ? Number(item.rating) : NaN;
    return [{
      watchKey, path: `cinema/detail/${slug}/`, title, type, year, description: clean(item.description),
      review: clean(item.review), cover: mediaUrl(item.cover), featured: item.featured === true,
      rating: Number.isFinite(rating) && rating >= 0 && rating <= 10 ? rating.toFixed(1) : '',
      episodes, watch, trailer: trailer ? { title: translate("预告片"), ...trailer } : null
    }];
  });
}

function catalog(data) {
  return normalize(Array.isArray(data) ? data : hexo.theme.config.cinema?.items, t);
}

hexo.extend.helper.register('morii_cinema_catalog', function () {
  return catalog(this.site?.data?.cinema);
});

hexo.extend.helper.register('morii_cinema_episode_key', episode =>
  createHash('sha256').update(JSON.stringify([episode.title, episode.watchUrl || episode.url])).digest('hex').slice(0, 20)
);

hexo.extend.generator.register('morii-cinema', locals => {
  if (hexo.theme.config.cinema?.enable === false) return [];
  const label = (value, fallback) => {
    const resolved = forPage(hexo).localized(value);
    return !resolved || resolved === fallback ? t(fallback) : resolved;
  };
  const page = { type: 'cinema', comments: false };
  const films = new Map(catalog(locals?.data?.cinema).map(item => [item.path, item]));
  return [
    { path: 'cinema/index.html', layout: 'page', data: { ...page, title: label(hexo.theme.config.cinema?.title, '电影院'), description: label(hexo.theme.config.cinema?.description, '挑一部喜欢的作品，慢慢看。') } },
    ...Array.from(films.values(), item => ({
      path: item.path + 'index.html', layout: 'page',
      data: { ...page, title: item.title, description: item.review || item.description, cinemaItem: item }
    }))
  ];
});

module.exports = { mediaUrl, embedUrl, normalize };
