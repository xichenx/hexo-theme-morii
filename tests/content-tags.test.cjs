'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

const tags = {};
vm.runInNewContext(fs.readFileSync(require.resolve('../scripts/content-tags.js'), 'utf8'), {
  require,
  hexo: {
    config: { root: '/blog/', url: 'https://example.test/blog/' },
    render: { renderSync: ({ text }) => text },
    extend: { tag: { register(name, tag) { tags[name] = tag; } } }
  }
});

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

test('timeline preserves invalid or incomplete blocks as ordinary content', () => {
  const entry = '<!-- timeline 2024-02-31 -->\nAn entry\n<!-- endtimeline -->';
  assert.match(tags.timeline(['<更新>,', 'unknown'], entry), /&lt;更新&gt;/);
  assert.doesNotMatch(tags.timeline([], entry), /<time /);
  for (const input of [`${entry}\n\n<!-- timeline later -->\nMore`, `Introduction\n${entry}`]) {
    assert.equal(tags.timeline([], input), input);
  }
});
