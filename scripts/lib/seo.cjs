'use strict';

const { httpURL } = require('./article-attribution.cjs');

function canonicalURL(site, path = '') {
  const base = httpURL(site.url);
  if (!base) return '';
  const url = new URL(base);
  let route = (path || '').replace(/^\/+/, '').replace(/(^|\/)index\.html$/, '$1');
  if (site.pretty_urls?.trailing_html === false) route = route.replace(/\.html$/, '');
  url.pathname = url.pathname.replace(/\/?$/, '/') + route;
  url.search = '';
  url.hash = '';
  return url.href;
}

function isNotFound(page) {
  return page.type === '404' || page.layout === '404' || page.path === '404.html';
}

function isNoindex(page) {
  return isNotFound(page) || page.type === 'reading_list' || Boolean(page.password) ||
    page.published === false || page.noindex === true;
}

module.exports = { canonicalURL, isNotFound, isNoindex };
