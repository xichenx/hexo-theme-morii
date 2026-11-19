'use strict';

const text = value => typeof value === 'string' ? value.trim() : '';
const httpURL = value => {
  const raw = text(value);
  if (!raw || /[\\\u0000-\u0020]/.test(raw)) return '';
  try {
    const url = new URL(raw);
    return /^https?:$/.test(url.protocol) && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
};

function resolveAttribution(article = {}, page = {}, site = {}) {
  const copyright = article.copyright || {};
  const overrides = page.copyright && typeof page.copyright === 'object' ? page.copyright : {};
  const license = text(overrides.license ?? copyright.license);
  let editURL = '';
  const source = text(page.source);
  const template = text(article.edit?.url);
  if (article.edit?.enable === true && page.edit !== false && template.includes('{path}') &&
      source && !/[\\\u0000-\u001f]/.test(source) && source.split('/').every(part => part && part !== '.' && part !== '..')) {
    const encoded = source.split('/').map(encodeURIComponent).join('/');
    editURL = httpURL(template.replaceAll('{path}', encoded));
  }
  return {
    enabled: copyright.enable === true && page.copyright !== false,
    author: text(overrides.author) || text(page.author) || text(site.author),
    authorURL: httpURL(overrides.author_url ?? copyright.author_url),
    license,
    licenseURL: license ? httpURL(overrides.license_url ?? copyright.license_url) : '',
    editURL
  };
}

module.exports = { resolveAttribution, httpURL };
