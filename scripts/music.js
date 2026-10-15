'use strict';

const { URL } = require('node:url');
const text = value => typeof value === 'string' ? value.trim() : '';
const source = value => {
  const raw = text(value);
  if (raw.startsWith('/') && !raw.startsWith('//') && !/[\\\u0000-\u001f]/.test(raw)) return raw;
  try { const url = new URL(raw); return /^https?:$/.test(url.protocol) && !url.username && !url.password ? url.href : ''; } catch { return ''; }
};
hexo.extend.helper.register('morii_music', () => {
  const config = hexo.theme.config.music || {};
  const playlist = source(config.playlist_url);
  const embed = source(config.embed_url);
  const tracks = (Array.isArray(config.tracks) ? config.tracks : []).filter(Boolean).flatMap(track => {
    const url = source(track.url);
    return url ? [{ title: text(track.title) || '未命名曲目', artist: text(track.artist) || '未知音乐人', url, cover: source(track.cover), lrc: source(track.lrc), lyrics: text(track.lyrics) }] : [];
  });
  const meting = config.meting || {};
  const api = source(meting.api || 'https://api.injahow.cn/meting/?server=:server&type=:type&id=:id&r=:r');
  const id = String(meting.id || '').trim();
  const remote = meting.enable === true && api && id ? {
    api, id, server: text(meting.server) || 'tencent', type: text(meting.type) || 'playlist'
  } : null;
  return { remote, volume: Number.isFinite(Number(config.volume)) ? Math.max(0, Math.min(1, Number(config.volume))) : 0.7, title: text(config.title) || '我的音乐收藏', description: text(config.description) || '给日常留一点旋律，边听边逛。', playlist, playlistLabel: text(config.playlist_label) || '打开我的歌单', embed: embed.startsWith('https://') ? embed : '', tracks };
});
