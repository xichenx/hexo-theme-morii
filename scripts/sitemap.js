'use strict';

const { canonicalURL, isNoindex } = require('./lib/seo.cjs');

const sitemapPath = 'sitemap.xml';
const robotsPath = 'robots.txt';
const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
const schema = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const maxURLs = 50_000;
const maxBytes = 50 * 1024 * 1024;
const indexable = new Map();
const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };

function xmlEntry(tag, url) {
  return `  <${tag}><loc>${url.replace(/[&<>"']/g, ch => entities[ch])}</loc></${tag}>\n`;
}

function xml(root, entries) {
  return xmlHeader + `<${root} xmlns="${schema}">\n` + entries.join('') + `</${root}>\n`;
}

function urlSets(urls) {
  const sets = [];
  let entries = [];
  const baseBytes = Buffer.byteLength(xml('urlset', []));
  let bytes = baseBytes;
  for (const url of urls) {
    if (url.length >= 2048) continue;
    const entry = xmlEntry('url', url);
    const size = Buffer.byteLength(entry);
    if (entries.length === maxURLs || bytes + size > maxBytes) {
      sets.push(xml('urlset', entries));
      entries = [];
      bytes = baseBytes;
    }
    entries.push(entry);
    bytes += size;
  }
  if (entries.length) sets.push(xml('urlset', entries));
  return sets;
}

hexo.extend.filter.register('before_generate', () => indexable.clear());

hexo.extend.filter.register('template_locals', locals => {
  if (hexo.theme.config.seo?.sitemap === false) return;
  const { page, path } = locals;
  const url = canonicalURL(hexo.config, path);
  // Skip aliases pointing at another route and leave untemplated assets out of the sitemap.
  if (!isNoindex(page) && url && url === canonicalURL(hexo.config, page.path)) indexable.set(path, url);
  else indexable.delete(path);
}, 100);

hexo.extend.filter.register('after_generate', () => {
  const { config, route } = hexo;
  const options = hexo.theme.config.seo || {};
  const siteURL = canonicalURL(config);
  if (!siteURL) return;
  const routes = new Set(route.list());
  let hasSitemap = routes.has(sitemapPath);

  if (options.sitemap !== false && !hasSitemap) {
    const urls = [...new Set([...indexable].filter(([path]) => routes.has(path)).map(([, url]) => url))].sort();
    const sets = urlSets(urls);
    if (sets.length === 1) {
      route.set(sitemapPath, sets[0]);
    } else if (sets.length > 1) {
      let number = 0;
      const entries = sets.map(body => {
        let path;
        do { path = `sitemap-morii-${++number}.xml`; } while (routes.has(path));
        route.set(path, body);
        return xmlEntry('sitemap', canonicalURL(config, path));
      });
      route.set(sitemapPath, xml('sitemapindex', entries));
    }
    hasSitemap = sets.length > 0;
  }

  if (options.robots === false || routes.has(robotsPath)) return;
  const rules = ['User-agent: *', 'Disallow:'];
  if (hasSitemap) rules.push('', `Sitemap: ${canonicalURL(config, sitemapPath)}`);
  route.set(robotsPath, rules.join('\n') + '\n');
}, 100);
