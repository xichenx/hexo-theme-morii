'use strict';
const { identity } = require('../scripts/lib/identity.cjs');
const { forPage } = require('../scripts/lib/i18n.cjs');
let routes;
hexo.extend.filter.register('before_generate', () => { routes = null; });
hexo.extend.helper.register('morii_identity', function () { return identity(hexo.config, hexo.theme.config, forPage(hexo, this).localized); });
hexo.extend.helper.register('morii_has_page', function (value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return false;
  const name = value.replace(/^\//, '').replace(/[?#].*$/, '');
  if (!routes) routes = new Set(hexo.route.list());
  return routes.has(!name || name.endsWith('/') ? name + 'index.html' : name);
});
