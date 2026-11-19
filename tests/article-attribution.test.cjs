'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { resolveAttribution } = require('../scripts/lib/article-attribution.cjs');
const { inspect } = require('../scripts/lib/config-check.cjs');
const { buildDemo } = require('../tools/demo.cjs');
const settings = { copyright: { enable: true, license: 'Custom license', license_url: 'https://example.test/license' }, edit: { enable: true, url: 'https://github.com/owner/blog/edit/main/source/{path}' } };

test('attribution is opt-in, respects per-post overrides and encodes source paths independently of permalinks', () => {
  assert.equal(resolveAttribution().enabled, false);
  const result = resolveAttribution(settings, { source: '_posts/中文 note#.md', author: 'Guest', copyright: { license: 'Guest license', license_url: '' } }, { author: 'Owner' });
  assert.equal(result.author, 'Guest'); assert.equal(result.license, 'Guest license'); assert.equal(result.licenseURL, '');
  assert.equal(result.editURL, 'https://github.com/owner/blog/edit/main/source/_posts/%E4%B8%AD%E6%96%87%20note%23.md');
  const hidden = resolveAttribution(settings, { source: '_posts/a.md', copyright: false, edit: false });
  assert.equal(hidden.enabled, false); assert.equal(hidden.editURL, '');
});

test('unsafe URLs and traversal paths never become attribution or source links', () => {
  for (const url of ['javascript:alert(1)', '//example.test/license', 'https://name:secret@example.test/', 'https://example.test/\nfoo', 'https:\\example.test']) {
    const result = resolveAttribution({ copyright: { enable: true, license: 'License', license_url: url, author_url: url }, edit: { enable: true, url: url + '/{path}' } }, { source: '_posts/a.md' });
    assert.equal(result.authorURL, ''); assert.equal(result.licenseURL, ''); assert.equal(result.editURL, '');
  }
  for (const source of ['../secret.md', '/etc/passwd', '_posts/../secret.md', '_posts\\a.md', '']) assert.equal(resolveAttribution(settings, { source }).editURL, '');
  assert.ok(inspect({ article: { edit: { enable: true, url: 'https://example.test/' }, code: { word_wrap: 'true' } } }).some(issue => issue.field === 'article.edit.url'));
  assert.ok(inspect({ article: { code: { word_wrap: 'true' } } }).some(issue => issue.field === 'article.code.word_wrap'));
});

test('generated attribution uses deployment-aware canonical links, escaped text and real source paths', async () => {
  const output = await buildDemo({ fixture: 'attribution', root: '/blog/', language: 'en', themeOverrides: { article: { ...settings, code: { word_wrap: true } } }, sourceOverrides: {
    '_posts/中文 note.md': '---\ntitle: Attribution example\npermalink: posts/attribution/\nauthor: "<Guest>"\n---\n\nExample.',
    '_posts/no-attribution.md': '---\ntitle: Hidden\npermalink: posts/hidden/\ncopyright: false\nedit: false\ncode_word_wrap: false\n---\n\nExample.'
  } });
  const dom = new JSDOM(fs.readFileSync(path.join(output, 'posts/attribution/index.html'), 'utf8'));
  try {
    const d = dom.window.document;
    assert.equal(d.querySelector('.article-copyright h2').textContent, 'Article copyright');
    assert.equal(d.querySelector('.article-copyright dd span').textContent, '<Guest>');
    assert.equal(d.querySelector('.article-copyright Guest'), null);
    assert.equal(d.querySelector('.article-copyright a').href, 'https://example.test/blog/posts/attribution/');
    assert.equal(d.querySelector('.article-edit').href, 'https://github.com/owner/blog/edit/main/source/_posts/%E4%B8%AD%E6%96%87%20note.md');
    assert.equal(d.querySelector('.article-body').dataset.codeWordWrap, 'true');
  } finally { dom.window.close(); }
  const hidden = new JSDOM(fs.readFileSync(path.join(output, 'posts/hidden/index.html'), 'utf8'));
  assert.equal(hidden.window.document.querySelector('.article-copyright, .article-edit'), null);
  assert.equal(hidden.window.document.querySelector('.article-body').dataset.codeWordWrap, 'false');
  hidden.window.close();
});
