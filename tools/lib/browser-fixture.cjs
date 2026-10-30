'use strict';
const yaml = require('js-yaml');
const prefix = '/layout/';
const title = '长标题布局验证：AndroidInternalsAndRenderingPipelineWithoutWordBreaks'.repeat(3);
const category = 'Android底层原理与渲染实践';
const longArticle = `---\n${yaml.dump({ title, date: '2026-10-30 09:00:00', permalink: 'posts/layout-stress/', categories: [category], tags: ['布局回归'], comments: false })}---\n\n` +
  Array.from({ length: 36 }, (_, index) => `## ${index + 1}. 学习路线与实践记录\n\n${'阅读侧栏保持目录可滚动，时钟与天气信息完整可见。'.repeat(14)}\n\n`).join('') +
  '\n## 代码与表格允许在自身区域横向滚动\n\n```text\n' + 'a_long_code_line_'.repeat(30) + '\n```\n\n| 字段 | 说明 |\n| --- | --- |\n| sample | 正文表格的内容 |\n';
const options = {
  fixture: 'browser-layout', root: prefix,
  themeOverrides: {
    clock: { enable: true, city: '布局测试城市', latitude: 0, longitude: 0, timezone: 'UTC' },
    music: { meting: { enable: false }, tracks: [] },
    github_calendar: { enable: false }, comments: { enable: false }, friends_feed: { endpoint: '' }
  },
  sourceOverrides: { '_posts/layout-stress.md': longArticle }
};
module.exports = { prefix, title, options };
