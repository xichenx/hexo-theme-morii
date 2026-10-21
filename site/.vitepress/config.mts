import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Morii 文档',
  description: 'Morii Hexo 主题安装、配置与使用指南',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    siteTitle: 'Morii',
    nav: [
      { text: '快速开始', link: '/guide/getting-started' },
      { text: '功能指南', link: '/features/pages' },
      { text: 'GitHub', link: 'https://github.com/xichenx/hexo-theme-morii' }
    ],
    sidebar: [
      {
        text: '开始使用',
        items: [
          { text: '安装主题', link: '/guide/getting-started' },
          { text: '首次配置', link: '/guide/first-config' },
          { text: '更新主题', link: '/guide/updating' }
        ]
      },
      {
        text: '功能指南',
        items: [
          { text: '页面与数据文件', link: '/features/pages' },
          { text: '相册与友链', link: '/features/album-links' },
          { text: '音乐馆与电影院', link: '/features/media' }
        ]
      },
      {
        text: '帮助',
        items: [{ text: '常见问题', link: '/troubleshooting' }]
      }
    ],
    search: { provider: 'local' },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/xichenx/hexo-theme-morii' }
    ],
    editLink: {
      pattern: 'https://github.com/xichenx/hexo-theme-morii/edit/main/site/:path',
      text: '编辑此页'
    },
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © Morainet'
    }
  }
})
