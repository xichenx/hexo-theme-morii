'use strict'

hexo.extend.generator.register('morii-404', () => ({
  path: '404.html',
  layout: '404',
  data: { title: '页面未找到', type: '404' }
}))
