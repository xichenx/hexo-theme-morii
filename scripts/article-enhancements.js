'use strict';
const { escapeHTML, highlight } = require('hexo-util');
const { styles, themes } = require('../scripts/lib/code-style.cjs');
const safe = (value, fallback) => {
  if (typeof value !== 'string' || !value) return fallback;
  if (/^\/(?!\/)/.test(value)) return value;
  try { return new URL(value).protocol === 'https:' ? value : fallback; } catch { return fallback; }
};
hexo.extend.helper.register('morii_enhancements', page => {
  const config = hexo.theme.config.article?.enhancements || {};
  return {
    mermaid: page.mermaid === true || (page.mermaid !== false && config.mermaid === true),
    math: page.math === true || (page.math !== false && config.math === true),
    mermaidURL: safe(config.mermaid_url, 'https://cdn.jsdelivr.net/npm/mermaid@11.12.0/dist/mermaid.esm.min.mjs'),
    mathURL: safe(config.math_url, 'https://cdn.jsdelivr.net/npm/katex@0.19.1/dist/katex.min.js'),
    mathCSS: safe(config.math_css, 'https://cdn.jsdelivr.net/npm/katex@0.19.1/dist/katex.min.css')
  };
});
hexo.extend.tag.register('mermaid', (args, content) => `<pre class="morii-diagram-source">${escapeHTML(content)}</pre>`, { ends: true });
hexo.extend.tag.register('math', (args, content) => `<span class="morii-math" data-display="${args.includes('inline') ? 'false' : 'true'}">${escapeHTML(content.trim())}</span>`, { ends: true });
hexo.extend.tag.register('note', (args, content) => {
  const [tone, ...title] = args;
  const kind = ['info', 'tip', 'warning', 'danger'].includes(tone) ? tone : 'info';
  const body = hexo.render.renderSync({ text: content, engine: 'markdown' });
  return `<aside class="article-note article-note--${kind}">${title.length ? `<strong>${escapeHTML(title.join(' '))}</strong>` : ''}${body}</aside>`;
}, { ends: true });
hexo.extend.tag.register('codefile', (args, content) => {
  const [filename, lang, lines = '', style, theme] = args.join(' ').split(',').map(value => value.trim());
  const mark = new Set();
  for (const part of lines.split(/\s+/)) {
    const match = /^(\d+)(?:-(\d+))?$/.exec(part);
    if (!match) continue;
    const first = Math.max(1, Number(match[1]));
    const last = Math.min(first + 200, Number(match[2] || first));
    for (let line = first; line <= last; line++) mark.add(line);
  }
  const attributes = `${styles.includes(style) ? ` data-code-style="${style}"` : ''}${themes.includes(theme) ? ` data-code-theme="${theme}"` : ''}`;
  return `<div class="code-file" data-filename="${escapeHTML(filename || '')}"${attributes}>${highlight(content, { lang: /^[\w+-]+$/.test(lang || '') ? lang : 'plaintext', gutter: true, mark: [...mark] })}</div>`;
}, { ends: true });
