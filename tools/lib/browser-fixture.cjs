'use strict';
const yaml = require('js-yaml');
const prefix = '/layout/';
const title = '长标题布局验证：AndroidInternalsAndRenderingPipelineWithoutWordBreaks'.repeat(3);
const category = 'Android底层原理与渲染实践';
const sampleCode = Array.from({ length: 24 }, (_, index) => `const value${index} = 'Morii sample ${index}';`).join('\n');
const codeArticle = '---\ntitle: 代码块样式预览\ndate: 2026-10-29 09:00:00\npermalink: posts/code-styles/\ncode_style: minimal\ncode_theme: auto\ntoc: false\ncomments: false\n---\n\n## 继承文章设置\n\n```javascript\nconst inherited = true;\n```\n\n' + ['classic', 'mac', 'minimal'].flatMap(style => ['auto', 'light', 'dark'].map(theme => `## ${style} / ${theme}\n\n{% codefile src/components/code-block/${style}-${theme}-example-file-with-a-long-name.js, javascript, 2-3, ${style}, ${theme} %}\n${sampleCode}\n{% endcodefile %}\n\n`)).join('');
const longArticle = `---\n${yaml.dump({ title, date: '2026-10-30 09:00:00', permalink: 'posts/layout-stress/', categories: [category], tags: ['布局回归'], toc_scroll_percent: false, comments: false })}---\n\n` +
  Array.from({ length: 36 }, (_, index) => `## ${index + 1}. 学习路线与实践记录\n\n${'阅读侧栏保持目录可滚动，时钟与天气信息完整可见。'.repeat(14)}\n\n`).join('') +
  '\n## 代码与表格允许在自身区域横向滚动\n\n```text\n' + 'a_long_code_line_'.repeat(30) + '\n```\n\n| 字段 | 说明 |\n| --- | --- |\n| sample | 正文表格的内容 |\n';
const options = {
  fixture: 'browser-layout', root: prefix,
  themeOverrides: {
    article: {
      nav_title: true,
      copyright: { enable: true, license: 'Example license', license_url: 'https://example.test/license' },
      edit: { enable: true, url: 'https://github.com/example/blog/edit/main/source/{path}' }
    },
    clock: { enable: true, city: '布局测试城市', latitude: 0, longitude: 0, timezone: 'UTC' },
    music: { meting: { enable: false }, tracks: [] },
    github_calendar: { enable: false },
    comments: { enable: true, env_id: 'https://comments.example.test/', script_url: '/test-comments.js', load_mode: 'manual' },
    friends_feed: { endpoint: 'https://feed.example.test/articles?source=fixture', page_size: 2 }
  },
  sourceOverrides: {
    ...Object.fromEntries(['manual', 'viewport', 'immediate'].map(mode => [
      `comments/${mode}/index.md`,
      `---\ntitle: 留言板 ${mode}\ncomments: true\n${mode === 'manual' ? '' : 'comments_load: ' + mode + '\n'}---\n\n<div style="height:2400px">欢迎留言。</div>\n`
    ])),
    '_data/essay.yml': yaml.dump([
      { home_essay: true, essay_list: [
        { content: 'October note', date: new Date('2026-10-15T00:00:00Z') },
        { content: 'September note', date: '2026/9/14 10:00' }
      ] },
      { essay_list: [{ content: 'Undated note' }] }
    ]),
    '_data/link.yml': yaml.dump([
      { class_name: '技术', link_list: [
        { name: 'Alpha', link: 'https://alpha.friend.test/' },
        { name: 'Beta', link: 'https://beta.friend.test/' }
      ] },
      { class_name: '生活', link_list: [
        { name: 'Gamma', link: 'https://gamma.friend.test/' }
      ] }
    ]),
    '_posts/search-matches.md': '---\ntitle: Search matches fixture\ndate: 2020-02-01 00:00:00\npermalink: posts/search-matches/\n---\n\nOverview.\n\n<!-- more -->\n\norioncache ' + 'Ordinary prose. '.repeat(22) + '\n\nnebularender\n',
    '_posts/layout-stress.md': longArticle,
    '_posts/code-styles.md': codeArticle,
    '_posts/lazy-images.md': `---
title: Article image loading
date: 2020-01-01 00:00:00
permalink: posts/lazy-images/
---

图标 {% inlineImg /icons/brand/morii-logo.png 18px "Morii 图标" %} 会保留在句子里。

<img src="${prefix}test-images/first.svg" alt="First" width="120" height="60">

<div style="height:12000px"></div>

<img src="${prefix}test-images/later.svg" alt="Later" width="120" height="60" />

<div style="height:12000px"></div>

<img src="${prefix}test-images/print.svg" alt="Print" width="120" height="60">
`
  }
};
module.exports = { prefix, title, options, sampleCode };
