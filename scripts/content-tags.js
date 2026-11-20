'use strict';

const { escapeHTML, url_for } = require('hexo-util');
const { load, JSON_SCHEMA } = require('js-yaml');
const { navigationTarget } = require('../scripts/lib/navigation-url.cjs');
const { timelineDate } = require('../scripts/lib/timeline-date.cjs');
const { forPage } = require('../scripts/lib/i18n.cjs');
const markdown = text => hexo.render.renderSync({ text, engine: 'markdown' });
const siteURL = path => url_for.call({ config: hexo.config }, path);
const unquote = value => value.replace(/^(["'])(.*)\1$/, '$2');
const timelineColors = { blue: '#5288e9', pink: '#d967a0', red: '#de6868', purple: '#9a74df', orange: '#c87d35', green: '#3c9b72' };

hexo.extend.tag.register('btn', args => {
  const [value = '', label = '', style, options] = args.join(' ').split(',').map(part => part.trim());
  const destination = unquote(value);
  const target = navigationTarget(destination);
  const fragment = /^#[^\s\\\u0000-\u001f\u007f]+$/.test(destination) ? destination : '';
  const href = target?.local ? siteURL(target.path) : target?.path || fragment;
  if (!href || !label) return escapeHTML(label);
  const outline = `${style || ''} ${options || ''}`.split(/\s+/).includes('outline') ? ' content-button--outline' : '';
  return `<a class="button content-button${outline}" href="${escapeHTML(href)}">${escapeHTML(label)}</a>`;
});

hexo.extend.tag.register('inlineImg', ([source = '', size = '', ...description]) => {
  const alt = escapeHTML(unquote(description.join(' ')));
  const target = navigationTarget(unquote(source));
  if (!target) return alt;
  const src = escapeHTML(target.local ? siteURL(target.path) : target.path);
  const length = /^(\d*\.\d+|\d+)(px|em|rem)?$/.exec(size);
  const amount = Number(length?.[1]);
  const height = Number.isFinite(amount) && amount > 0 ? ` style="--inline-image-height:${length[1]}${length[2] || 'px'}"` : '';
  return `<img class="content-inline-image" src="${src}" alt="${alt}"${height} decoding="async">`;
});

hexo.extend.tag.register('hideInline', function (args) {
  const [answer = '', label = ''] = args.join(' ').split(',').map(part => unquote(part.trim()));
  if (!answer) return '';
  const caption = label || forPage(hexo, { page: this }).t('显示隐藏文字');
  return `<label class="inline-reveal inline-label"><input type="checkbox" autocomplete="off"> ${escapeHTML(caption)}</label><span class="inline-answer" data-nosnippet> ${escapeHTML(answer)}</span>`;
});

hexo.extend.tag.register('timeline', (args, content) => {
  const [title, color] = args.join(' ').split(',').map(part => part.trim());
  const tone = Object.hasOwn(timelineColors, color) ? ` data-tone="${color}" style="--timeline-dot:${timelineColors[color]}"` : '';
  const pattern = /^[\t ]*<!--[\t ]*timeline[\t ]+(.+?)[\t ]*-->[\t ]*\r?\n([\s\S]*?)^[\t ]*<!--[\t ]*endtimeline[\t ]*-->[\t ]*(?:\r?\n|$)/gm;
  const entries = [];
  let offset = 0;
  for (const match of content.matchAll(pattern)) {
    if (content.slice(offset, match.index).trim() || /^[\t ]*<!--[\t ]*timeline[\t ]+/m.test(match[2])) return markdown(content);
    offset = match.index + match[0].length;
    const { date, datetime } = timelineDate(match[1]);
    const label = datetime ? `<time datetime="${datetime}">${escapeHTML(date)}</time>` : `<strong>${escapeHTML(date)}</strong>`;
    entries.push(`<li><span class="content-timeline__label">${label}</span>${markdown(match[2])}</li>`);
  }
  if (!entries.length || content.slice(offset).trim()) return markdown(content);
  return `<div class="content-timeline"${tone}>${title ? `<strong>${escapeHTML(title)}</strong>` : ''}<ol role="list">${entries.join('')}</ol></div>`;
}, { ends: true });

hexo.extend.tag.register('flink', function (args, content) {
  let data;
  try { data = load(content, { schema: JSON_SCHEMA }); }
  catch {
    hexo.log.warn('[Morii] Invalid YAML in a flink tag.');
    return '';
  }
  const groups = hexo.extend.helper.get('morii_friend_groups').call({ page: this }, data);
  return groups.map(group => {
    const cards = group.friends.flatMap(friend => {
      const target = navigationTarget(friend.url);
      if (!target) return [];
      const avatar = navigationTarget(friend.avatar);
      const src = avatar?.local ? siteURL(avatar.path) : avatar?.path;
      const image = src ? `<img src="${escapeHTML(src)}" width="43" height="43" alt="" loading="lazy" decoding="async">` : '';
      const description = friend.description ? `<small>${escapeHTML(friend.description)}</small>` : '';
      const initial = Array.from(friend.name)[0] || '';
      return [`<a class="friend-card" href="${escapeHTML(target.path)}"><span class="friend-avatar" data-image-fallback aria-hidden="true"><span>${escapeHTML(initial)}</span>${image}</span><span class="friend-card__text"><strong>${escapeHTML(friend.name)}</strong>${description}</span></a>`];
    });
    if (!cards.length) return '';
    const description = group.description ? `<p>${escapeHTML(group.description)}</p>` : '';
    return `<section class="content-flink data-section" aria-label="${escapeHTML(group.title)}"><strong>${escapeHTML(group.title)}</strong>${description}<div class="friend-grid">${cards.join('')}</div></section>`;
  }).join('');
}, { ends: true });
