'use strict';
const { resolveAttribution } = require('../scripts/lib/article-attribution.cjs');
hexo.extend.helper.register('morii_article_attribution', page => resolveAttribution(hexo.theme.config.article, page, hexo.config));
