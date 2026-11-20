'use strict';
const yaml = require('js-yaml');
const prefix = '/layout/';
const title = '长标题布局验证：AndroidInternalsAndRenderingPipelineWithoutWordBreaks'.repeat(3);
const category = 'Android底层原理与渲染实践';
const sampleCode = Array.from({ length: 24 }, (_, index) => `const value${index} = 'Morii sample ${index}';`).join('\n');
const codeArticle = '---\ntitle: 代码块样式预览\ndate: 2026-10-29 09:00:00\npermalink: posts/code-styles/\ncode_style: minimal\ncode_theme: auto\ncode_copy: true\ncode_language: true\ntoc: false\ntoc_style_simple: true\nreward: false\ncomments: false\n---\n\n## 继承文章设置\n\n```javascript\nconst inherited = true;\n```\n\n' + ['classic', 'mac', 'minimal'].flatMap(style => ['auto', 'light', 'dark'].map(theme => `## ${style} / ${theme}\n\n{% codefile src/components/code-block/${style}-${theme}-example-file-with-a-long-name.js, javascript, 2-3, ${style}, ${theme} %}\n${sampleCode}\n{% endcodefile %}\n\n`)).join('');
const longArticle = `---\n${yaml.dump({ title, date: '2026-10-30 09:00:00', permalink: 'posts/layout-stress/', categories: [category], tags: ['布局回归'], toc_scroll_percent: false, comments: false })}---\n\n` +
  Array.from({ length: 36 }, (_, index) => `## ${index + 1}. 学习路线与实践记录\n\n${'阅读侧栏保持目录可滚动，时钟与天气信息完整可见。'.repeat(14)}\n\n`).join('') +
  '\n## 代码与表格允许在自身区域横向滚动\n\n```text\n' + 'a_long_code_line_'.repeat(30) + '\n```\n\n| 字段 | 说明 |\n| --- | --- |\n| sample | 正文表格的内容 |\n';
const options = {
  fixture: 'browser-layout', root: prefix,
  themeOverrides: {
    appearance: { back_to_top_percent: true },
    article: {
      code: { copy: false, language: false },
      nav_title: true,
      navigation_order: 'oldest_first',
      outdated: { enable: true, days: 365, position: 'bottom' },
      reward: { enable: true, text: '感谢支持这篇文章', methods: [
        { label: '打开示例二维码', qr: '/icons/brand/morii-logo.png' },
        { label: '支持说明', url: '/about/' },
        { label: '无效项目', url: 'javascript:alert(1)', qr: '//example.test/qr.png' }
      ] },
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
    '_posts/toc-simple.md': '---\ntitle: 简洁目录示例\ndate: 2020-01-01\nupdated: 2024-02-03 12:00:00\npermalink: posts/toc-simple/\ntoc_style_simple: true\nsidebar_position: left\nmeta_date_type: updated\nmeta_word_count: true\nmeta_reading_time: false\n---\n\n## 第一个章节\n\n正文。\n\n## 第二个章节\n\n更多内容。\n',
    '_posts/outdated-bottom.md': '---\ntitle: 文末时效提醒\ndate: 2020-01-01\nupdated: 2020-01-01\npermalink: posts/outdated-bottom/\noutdated_days: 30\n---\n\n## 正文\n\n文末显示提醒。\n',
    '_posts/outdated-top.md': '---\ntitle: 文首时效提醒\ndate: 2020-01-01\nupdated: 2020-01-01\npermalink: posts/outdated-top/\noutdated_position: top\n---\n\n## 正文\n\n文首显示提醒。\n',
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
    '_posts/code-controls.md': [
      '---', 'title: 长代码阅读设置', 'date: 2019-01-01', 'permalink: posts/code-controls/',
      'code_viewer: false', 'code_start_collapsed: false', 'code_copy: true', '---', '',
      '```javascript', sampleCode, '```', ''
    ].join('\n'),
    '_posts/code-height.md': [
      '---', 'title: 代码块高度限制', 'date: 2018-01-01', 'permalink: posts/code-height/',
      'code_height_limit: 130', '---', '', '```text', 'word '.repeat(900), '```', ''
    ].join('\n'),
    '_posts/lazy-images.md': `---
title: Article image loading
date: 2020-01-01 00:00:00
permalink: posts/lazy-images/
image_captions: true
---

图标 {% inlineImg /icons/brand/morii-logo.png 18px "Morii 图标" %} 会保留在句子里。

<img src="${prefix}test-images/first.svg" alt="First" title="First image caption" width="120" height="60">

<div style="height:12000px"></div>

<img src="${prefix}test-images/later.svg" alt="Later" width="120" height="60" />

<div style="height:12000px"></div>

<img src="${prefix}test-images/print.svg" alt="Print" width="120" height="60">
`
  }
};
module.exports = { prefix, title, options, sampleCode };
