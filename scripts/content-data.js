'use strict';

const { forPage } = require('../scripts/lib/i18n.cjs');
const t = (...args) => forPage(hexo).t(...args);
const { URL } = require('node:url');
const array = value => Array.isArray(value) ? value : [];
const text = value => typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
const httpUrl = value => {
  try {
    const url = new URL(text(value));
    return /^https?:$/.test(url.protocol) ? url.href : '';
  } catch { return ''; }
};
const resource = value => {
  const source = text(value);
  if (httpUrl(source)) return httpUrl(source);
  if (!source || /^[a-z][\w+.-]*:|^\/\//i.test(source) || /[\\\u0000-\u001f]/.test(source)) return '';
  return source;
};
const albumPath = value => {
  let source = text(value);
  if (!source || /^[a-z][\w+.-]*:|^\/\//i.test(source)) return '';
  try { source = decodeURIComponent(source); } catch { return ''; }
  if (/[?#\\\u0000-\u001f]/.test(source)) return '';
  const parts = source.replace(/index\.html$/, '').split('/').filter(Boolean);
  if (!parts.length || parts.some(part => part === '.' || part === '..')) return '';
  return `/${parts.join('/')}/`;
};
const dateLabel = value => {
  let date = text(value);
  if (value && typeof value.toISOString === 'function' && !Number.isNaN(Number(value))) date = value.toISOString();
  const match = date.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  return match ? `${match[1]}.${match[2].padStart(2, '0')}.${match[3].padStart(2, '0')}` : '';
};

const albums = (data, translate = t) => array(data).filter(item => item && albumPath(item.path_name)).map(item => {
  const photos = array(item.album_list).filter(Boolean).flatMap(entry => {
    const images = typeof entry.image === 'string' ? [entry.image] : array(entry.image);
    return images.map(resource).filter(Boolean).map(src => ({
      src, caption: text(entry.content), address: text(entry.address), author: text(entry.from), date: dateLabel(entry.date)
    }));
  });
  return { path: albumPath(item.path_name), title: text(item.class_name) || translate("相册"), description: text(item.description), cover: resource(item.cover) || photos[0]?.src || '', photos };
});
hexo.extend.helper.register('morii_albums', function (data) { return albums(data, forPage(hexo, this).t); });
hexo.extend.helper.register('morii_album', (data, path) => {
  const requested = albumPath(path);
  return requested ? albums(data, forPage(hexo, this).t).find(album => album.path === requested) : undefined;
});

hexo.extend.helper.register('morii_about', data => {
  const source = (Array.isArray(data) ? data.find(item => item && typeof item === 'object') : data) || {};
  return {
    name: text(source.name), description: text(source.description), avatar: resource(source.avatarImg), subtitle: text(source.subtitle),
    motto: [text(source.maxim?.maxim_top), text(source.maxim?.maxim_bottom)].join(''),
    skills: [...array(source.avatarSkills?.left), ...array(source.avatarSkills?.right)].map(text).filter(Boolean),
    careers: array(source.careers?.list).map(item => text(item?.desc)).filter(Boolean),
    music: text(source.music?.music_title), interest: text(source.like?.like_title), interestDescription: text(source.like?.like_bottom)
  };
});

hexo.extend.helper.register('morii_friend_groups', function (data) {
  const t = (...args) => forPage(hexo, this).t(...args);
return array(data).filter(Boolean).map((group, index) => ({
  id: `friend-group-${index + 1}`, title: text(group.class_name) || t("友情链接"), description: text(group.class_desc),
  friends: array(group.link_list).filter(Boolean).map(friend => {
    const url = httpUrl(friend.link);
    return { url, name: text(friend.name) || (url ? new URL(url).hostname : ''), description: text(friend.descr), avatar: resource(friend.avatar), domain: url ? new URL(url).hostname : '', screenshot: resource(friend.siteshot), tag: text(friend.tag), recommend: friend.recommend === true };
  }).filter(friend => friend.url)
})).filter(group => group.friends.length);
});

hexo.extend.helper.register('morii_site_card', () => JSON.stringify({
  name: text(hexo.config.title), link: httpUrl(hexo.config.url), avatar: resource(hexo.theme.config.avatar), descr: text(hexo.config.description)
}, null, 2));
