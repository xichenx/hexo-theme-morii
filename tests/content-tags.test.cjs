'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

const tags = {};
const helpers = {};
const warnings = [];
const context = {
  require, URL,
  hexo: {
    config: { root: '/blog/', url: 'https://example.test/blog/' },
    log: { warn: value => warnings.push(value) },
    render: { renderSync: ({ text }) => text },
    extend: {
      tag: { register(name, tag) { tags[name] = tag; } },
      helper: { register(name, helper) { helpers[name] = helper; }, get: name => helpers[name] }
    }
  }
};
for (const filename of ['content-data', 'content-tags', 'plain-text']) {
  vm.runInNewContext(fs.readFileSync(require.resolve(`../scripts/${filename}.js`), 'utf8'), { ...context });
}

test('button links escape labels and reject destinations that bypass the site root', () => {
  const button = tags.btn(["'/archives/?a=1&b=2#year',", '<更多>,,', 'outline']);
  const dom = new JSDOM(button + tags.btn(['#year, 查看年份']) + tags.btn(['https://hexo.io/, Hexo']));
  const links = [...dom.window.document.querySelectorAll('a')];
  assert.deepEqual(links.map(link => link.getAttribute('href')), ['/blog/archives/?a=1&b=2#year', '#year', 'https://hexo.io/']);
  const [link] = links;
  assert.equal(link.textContent, '<更多>');
  assert.ok(link.classList.contains('content-button--outline'));
  for (const url of ['javascript:alert(1)', '//example.test/', '/%2e%2e/outside/', 'https://user@example.test/']) {
    assert.equal(tags.btn([`${url}, 安全标签`]), '安全标签');
  }
  dom.window.close();
});

test('inline answers escape text and stay out of generated excerpts', () => {
  const markup = tags.hideInline.call({ lang: 'en' }, ['<b>藏起来</b>']);
  const dom = new JSDOM(markup);
  const document = dom.window.document;
  assert.equal(document.querySelector('label').textContent.trim(), 'Show hidden text');
  assert.equal(document.querySelector('.inline-answer').textContent.trim(), '<b>藏起来</b>');
  assert.equal(document.querySelector('.inline-answer').children.length, 0);
  assert.equal(document.querySelector('.inline-answer').hasAttribute('data-nosnippet'), true);
  const post = { title: 'Question', excerpt: `before ${markup} after` };
  assert.equal(helpers.morii_excerpt(post), 'before Show hidden text after');
  assert.equal(helpers.morii_search_text(post), 'question before show hidden text after');
  assert.equal(tags.hideInline(['', ',', '查看']), '');
  dom.window.close();
});

test('timeline preserves invalid or incomplete blocks as ordinary content', () => {
  const entry = '<!-- timeline 2024-02-31 -->\nAn entry\n<!-- endtimeline -->';
  assert.match(tags.timeline(['<更新>,', 'unknown'], entry), /&lt;更新&gt;/);
  assert.doesNotMatch(tags.timeline([], entry), /<time /);
  for (const input of [`${entry}\n\n<!-- timeline later -->\nMore`, `Introduction\n${entry}`]) {
    assert.equal(tags.timeline([], input), input);
  }
});

test('inline images resolve deployment paths, escape text and use only supported heights', () => {
  const dom = new JSDOM(tags.inlineImg(['/icons/logo.png', '1.5em', '"<Morii>', 'logo"']) + tags.inlineImg(['https://example.test/logo.png', '50vh']));
  const [local, remote] = dom.window.document.images;
  assert.equal(local.getAttribute('src'), '/blog/icons/logo.png');
  assert.equal(local.alt, '<Morii> logo');
  assert.equal(local.style.getPropertyValue('--inline-image-height'), '1.5em');
  assert.equal(remote.getAttribute('src'), 'https://example.test/logo.png');
  assert.equal(remote.alt, '');
  assert.equal(remote.hasAttribute('style'), false);
  assert.equal(tags.inlineImg(['javascript:alert(1)', 'auto', 'Logo']), 'Logo');
  assert.equal(tags.inlineImg(['/%2e%2e/logo.png']), '');
  dom.window.close();
});

test('inline friend groups render plain text and accept safe links and deployment-aware avatars', () => {
  const dom = new JSDOM(tags.flink([], `
- class_name: '<目录>'
  link_list:
    - null
    - name: '<b>Hexo</b>'
      link: https://hexo.io/
      avatar: /images/hexo.png
      descr: '<b>说明</b>'
    - link: https://example.test/
      avatar: /%2e%2e/outside.png
    - name: false
      link: 42
    - link: https://user@example.test/
    - link: javascript:alert(1)
- class_name: Empty
  link_list: []
`));
  const document = dom.window.document;
  assert.equal(document.querySelectorAll('.content-flink').length, 1);
  assert.equal(document.querySelector('section').getAttribute('aria-label'), '<目录>');
  assert.deepEqual([...document.querySelectorAll('a')].map(link => link.getAttribute('href')), ['https://hexo.io/', 'https://example.test/']);
  assert.equal(document.querySelector('a strong').textContent, '<b>Hexo</b>');
  assert.equal(document.querySelector('a small').textContent, '<b>说明</b>');
  assert.equal(document.querySelectorAll('img').length, 1);
  assert.equal(document.querySelector('img').getAttribute('src'), '/blog/images/hexo.png');
  assert.equal(tags.flink([], 'invalid: ['), '');
  assert.match(warnings.at(-1), /Invalid YAML/);
  dom.window.close();
});
