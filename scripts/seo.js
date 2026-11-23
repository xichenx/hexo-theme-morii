'use strict';

const { forPage } = require('./lib/i18n.cjs');
const { httpURL } = require('./lib/article-attribution.cjs');
const { canonicalURL, isNotFound, isNoindex } = require('./lib/seo.cjs');

function shareImage(context, page, fallback) {
  const candidates = page.password ? [fallback] : [page.share_image, page.cover, fallback];
  for (const value of candidates) {
    if (typeof value !== 'string' || !value.trim() || /^(\/\/|#)/.test(value.trim())) continue;
    const image = httpURL(context.full_url_for(value.trim()));
    if (image) return image;
  }
  return '';
}

function articleTrail(page) {
  const archive = '/' + String(hexo.config.archive_dir || 'archives').replace(/^\/+|\/+$/g, '') + '/';
  const series = this.morii_series(page);
  const crumbs = [{ name: this.morii_t('首页'), path: '/' }];
  if (this.morii_has_page(archive)) crumbs.push({ name: this.morii_t('文章'), path: archive });
  if (series) crumbs.push({ name: series.title, path: series.path });
  return crumbs;
}

hexo.extend.helper.register('morii_article_breadcrumb', articleTrail);
hexo.extend.helper.register('morii_seo', function (page) {
  const site = hexo.config;
  const options = hexo.theme.config.seo || {};
  const isPost = this.is_post();
  const noindex = isNoindex(page);
  const canonical = isNotFound(page) ? '' : canonicalURL(site, page.path);
  const firstHome = this.is_home() && !(page.current > 1);
  let title = this.morii_page_title(page);
  if (page.current > 1 && (this.is_archive() || this.is_category() || this.is_tag())) {
    title += ' · ' + this.morii_t('第 {0} 页', page.current);
  }
  const description = isPost
    ? this.morii_excerpt(page, 160)
    : (page.type === 'series_detail' && this.morii_series(page.series_key)?.description) || page.description || site.description;
  const image = shareImage(this, page, options.default_image);
  const published = isPost ? this.date_xml(page.date) : '';
  const modified = isPost ? this.date_xml(page.updated || page.date) : '';
  const metadata = {
    title,
    documentTitle: firstHome ? site.title : title + ' · ' + site.title,
    description, image, canonical, noindex, isPost, published, modified
  };

  if (noindex || !canonical || options.structured_data === false) return metadata;

  const home = canonicalURL(site);
  const graph = [{
    '@type': 'WebSite', '@id': home + '#website', url: home, name: site.title, inLanguage: forPage(hexo).locale
  }];
  if (isPost) {
    const author = page.author || site.author;
    graph.push({
      '@type': 'BlogPosting', '@id': canonical + '#article', headline: page.title, description,
      url: canonical, mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      ...(author ? { author: { '@type': 'Person', name: author } } : {}),
      datePublished: published, dateModified: modified,
      inLanguage: this.morii_locale(), ...(image ? { image: [image] } : {})
    });
    const trail = articleTrail.call(this, page).map(crumb => ({ name: crumb.name, url: canonicalURL(site, crumb.path) }));
    trail.push({ name: page.title, url: canonical });
    graph.push({
      '@type': 'BreadcrumbList', '@id': canonical + '#breadcrumb',
      itemListElement: trail.map(({ name, url }, index) => ({
        '@type': 'ListItem', position: index + 1, name, item: url
      }))
    });
  }

  metadata.structuredData = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
    .replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return metadata;
});
