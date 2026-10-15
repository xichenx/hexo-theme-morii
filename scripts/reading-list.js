'use strict';

hexo.extend.generator.register('morii-reading-list', () => {
  if (hexo.theme.config.reading_list?.enable === false) return [];
  return { path: 'reading-list/index.html', layout: 'reading-list', data: { title: '稍后阅读', type: 'reading_list', comments: false } };
});
