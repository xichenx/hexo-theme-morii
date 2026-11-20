'use strict';

const { navigationTarget } = require('../scripts/lib/navigation-url.cjs');
const text = value => typeof value === 'string' ? value.trim() : '';

hexo.extend.helper.register('morii_article_reward', page => {
  const config = hexo.theme.config.article?.reward;
  if (config?.enable !== true || page.reward === false || !Array.isArray(config.methods)) return null;

  const methods = config.methods.flatMap(method => {
    const label = text(method?.label);
    const qr = navigationTarget(method?.qr);
    const url = navigationTarget(method?.url) || qr;
    return label && url ? [{ label, qr, url }] : [];
  });

  return methods.length ? { text: text(config.text), methods } : null;
});
