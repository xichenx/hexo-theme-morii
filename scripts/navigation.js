'use strict';

const { forPage } = require('../scripts/lib/i18n.cjs');
const { URL } = require('node:url');

const uiIcons = new Set([
  'home', 'archive', 'categories', 'tags', 'essay', 'album', 'link',
  'about', 'music', 'cinema', 'friends', 'comments', 'game', 'snowflake',
  'bookmark', 'external', 'book', 'code', 'sparkles', 'sun'
]);
hexo.extend.helper.register('morii_icon', name => typeof name === 'string' && uiIcons.has(name) ? name : '');

hexo.extend.helper.register('morii_navigation', function () {
  const t = (...args) => forPage(hexo, this).t(...args);
  const defaults = {
    '/': ['home', t("回到首页，发现新的内容")],
    archives: ['archive', t("按时间翻阅所有文章")], categories: ['categories', t("按主题寻找技术笔记")], tags: ['tags', t("从关键词出发探索")],
    essay: ['essay', t("生活片段与随手记录")], album: ['album', t("收藏值得记住的瞬间")], link: ['link', t("去朋友们的博客坐坐")],
    about: ['about', t("认识这个小站和作者")], music: ['music', t("给日常留一点旋律")], cinema: ['cinema', t("挑一部电影、剧集或动漫")], fcircle: ['friends', t("看看朋友们的新文章")],
    comments: ['comments', t("留下你的想法与问候")], game: ['game', t("玩一会儿，再继续探索")],
    'air-conditioner': ['snowflake', t("一个可以操作的网页小玩具")], 'reading-list': ['bookmark', t("接着读你收藏的文章")]
  };
  const config = hexo.theme.config;
  const items = [...(Array.isArray(config.menu) ? config.menu : []), { name: t("标签"), path: '/tags/' }, ...(Array.isArray(config.explore) ? config.explore : [])];
  if (config.reading_list?.enable !== false) items.push({ name: t("稍后阅读"), path: '/reading-list/' });
  if (this.morii_series_catalog?.().length) items.push({ name: t('专题与系列'), path: '/series/', icon: 'book', description: t('沿着一条线索，系统地读下去。') });
  const seen = new Set();
  return items.flatMap(item => {
    if (item) item = { ...item, name: this.morii_nav_label ? this.morii_nav_label(item.name) : forPage(hexo, this).localized(item.name), description: forPage(hexo, this).localized(item.description) };
    if (!item || typeof item.path !== 'string' || typeof item.name !== 'string' || !item.name.trim()) return [];
    const path = item.path.trim();
    if (!path || /[\\\u0000-\u001f]/.test(path) || path.startsWith('//')) return [];
    if (!path.startsWith('/')) {
      try { if (!/^https?:$/.test(new URL(path).protocol)) return []; } catch { return []; }
    }
    const key = path === '/' ? '/' : path.split('/').filter(Boolean)[0];
    if (key === 'reading-list' && config.reading_list?.enable === false) return [];
    const identity = path.replace(/\/$/, '');
    if (seen.has(identity)) return [];
    seen.add(identity);
    const [icon, description] = defaults[key] || ['external', t("打开这个页面")];
    return [{ path, name: item.name.trim(), icon: typeof item.icon === 'string' ? item.icon : icon, description: typeof item.description === 'string' ? item.description : description }];
  });
});
