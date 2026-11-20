'use strict';

const { escapeHTML, url_for } = require('hexo-util');
const { navigationTarget } = require('../scripts/lib/navigation-url.cjs');
const { timelineDate } = require('../scripts/lib/timeline-date.cjs');
const markdown = text => hexo.render.renderSync({ text, engine: 'markdown' });

hexo.extend.tag.register('btn', args => {
  const [value = '', label = '', style, options] = args.join(' ').split(',').map(part => part.trim());
  const destination = value.replace(/^(["'])(.*)\1$/, '$2');
  const target = navigationTarget(destination);
  const fragment = /^#[^\s\\\u0000-\u001f\u007f]+$/.test(destination) ? destination : '';
  const href = target?.local ? url_for.call({ config: hexo.config }, target.path) : target?.path || fragment;
  if (!href || !label) return escapeHTML(label);
  const outline = `${style || ''} ${options || ''}`.split(/\s+/).includes('outline') ? ' content-button--outline' : '';
  return `<a class="button content-button${outline}" href="${escapeHTML(href)}">${escapeHTML(label)}</a>`;
});

hexo.extend.tag.register('timeline', (args, content) => {
  const [title, color] = args.join(' ').split(',').map(part => part.trim());
  const tone = ['blue', 'pink', 'red', 'purple', 'orange', 'green'].includes(color) ? ` data-tone="${color}"` : '';
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
