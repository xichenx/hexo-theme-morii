'use strict';
hexo.extend.helper.register('morii_share_image', function (page) {
  const value = page.share_image || page.cover || hexo.theme.config.seo?.default_image;
  if (typeof value !== 'string' || !value.trim() || /^(?:data:|javascript:|\/\/)/i.test(value)) return '';
  const url = this.full_url_for(value);
  try { return /^https?:$/.test(new URL(url).protocol) ? url : ''; } catch { return ''; }
});
hexo.extend.helper.register('morii_structured_data', function (page) {
  if (hexo.theme.config.seo?.structured_data === false) return '';
  const url = this.full_url_for((page.path || '').replace(/index\.html$/, ''));
  const image = this.morii_share_image(page);
  const graph = [{ '@type': 'WebSite', '@id': this.full_url_for('/') + '#website', url: this.full_url_for('/'), name: hexo.config.title, inLanguage: this.morii_locale() }];
  if (this.is_post()) graph.push({
    '@type': 'BlogPosting', headline: page.title, description: this.morii_excerpt(page, 160),
    url, mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Person', name: page.author || hexo.config.author },
    datePublished: this.date_xml(page.date), dateModified: this.date_xml(page.updated || page.date),
    inLanguage: this.morii_locale(), ...(image ? { image: [image] } : {})
  });
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
});
