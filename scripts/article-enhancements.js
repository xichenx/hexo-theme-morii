'use strict';
const { escapeHTML, highlight } = require('hexo-util');
const { Parser } = require('htmlparser2');
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
hexo.extend.helper.register('morii_enhancement_connections', (page, resources) => {
  if (page.password || !page.content || (!resources.mermaid && !resources.math)) return [];
  let mermaid = false;
  let math = false;
  let inertDepth = 0;
  const inert = tag => tag === 'template' || tag === 'noscript';
  const parser = new Parser({
    onopentag(tag, attributes) {
      if (inert(tag)) inertDepth++;
      if (inertDepth || !attributes.class) return;
      const classes = attributes.class.split(/\s+/);
      if (tag === 'span' && classes.includes('morii-math')) math = true;
      if ((tag === 'pre' && classes.includes('morii-diagram-source')) ||
          (tag === 'code' && classes.includes('language-mermaid')) ||
          (tag === 'figure' && classes.includes('highlight') && classes.includes('mermaid'))) mermaid = true;
    },
    onclosetag(tag) {
      if (inert(tag)) inertDepth--;
    }
  });
  parser.end(page.content);

  const origins = new Map();
  const siteOrigin = URL.canParse(hexo.config.url) ? new URL(hexo.config.url).origin : '';
  const add = (value, anonymous) => {
    // Local paths already share the page connection.
    if (!/^https:\/\//i.test(value)) return;
    const url = new URL(value);
    if (url.origin === siteOrigin || url.username || url.password) return;
    origins.set(url.origin, anonymous || origins.get(url.origin) === true);
  };
  if (resources.mermaid && mermaid) add(resources.mermaidURL, true);
  if (resources.math && math) {
    add(resources.mathURL, false);
    // KaTeX fonts use an anonymous CORS connection to the stylesheet origin.
    add(resources.mathCSS, true);
  }
  return [...origins].map(([origin, anonymous]) => ({ origin, anonymous }));
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
