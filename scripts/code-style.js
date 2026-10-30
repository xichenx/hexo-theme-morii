'use strict';
const { resolveCode } = require('../scripts/lib/code-style.cjs');
const warned = new Set();
hexo.extend.filter.register('before_generate', () => warned.clear());
hexo.extend.helper.register('morii_code_style', page => resolveCode(hexo.theme.config.article?.code, page, (field, fallback) => {
  const key = field.startsWith('article.') ? field : `${page?.path || ''}:${field}`;
  if (!warned.has(key)) {
    warned.add(key);
    hexo.log.warn(`[Morii] ${key} 配置无效，已回退为 ${fallback}。`);
  }
}));
