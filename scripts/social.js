'use strict';

const { URL } = require('node:url');
const text = value => typeof value === 'string' ? value.trim() : '';
const webUrl = value => {
  try { const url = new URL(text(value)); return /^https?:$/.test(url.protocol) && !url.username && !url.password ? url.href : ''; } catch { return ''; }
};
const qrSource = value => {
  const source = text(value);
  if (webUrl(source)) return webUrl(source);
  return source.startsWith('/') && !source.startsWith('//') && !/[\\\u0000-\u001f]/.test(source) ? source : '';
};
const badges = { github: 'GH', csdn: 'C', bilibili: 'B站', wechat: '微', weibo: 'W', zhihu: '知', douyin: '抖', xiaohongshu: '红', telegram: 'TG' };
hexo.extend.helper.register('morii_social_links', () => {
  const items = hexo.theme.config.social;
  if (!Array.isArray(items)) return [];
  const seen = new Set();
  return items.flatMap(item => {
    if (!item || item.enable === false) return [];
    const name = text(item.name);
    const url = webUrl(item.url);
    const qrcode = qrSource(item.qrcode);
    if (!name || (!url && !qrcode)) return [];
    const identity = `${name}:${url}:${qrcode}`;
    if (seen.has(identity)) return [];
    seen.add(identity);
    const icon = Object.hasOwn(badges, item.icon) ? item.icon : 'custom';
    return [{ name, url, qrcode, icon, badge: badges[icon] || name.slice(0, 2), account: text(item.account), description: text(item.description) || `在${name}关注我` }];
  });
});
