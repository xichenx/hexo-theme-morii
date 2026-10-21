import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Morii 文档',
  description: 'Morii Hexo 主题安装、配置与使用指南',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/morii-logo-v2.png' }]
  ],
  themeConfig: {
    siteTitle: 'Morii',
    logo: { src: '/morii-logo-v2.png', alt: 'Morii' },
    nav: [
      { text: '从零开始', link: '/guide/getting-started' },
      { text: '功能指南', link: '/features/pages' },
      { text: '发布博客', link: '/guide/publishing' },
      { text: 'GitHub', link: 'https://github.com/xichenx/hexo-theme-morii' }
    ],
    sidebar: [
      {
        text: '从零开始',
        items: [
          { text: '安装 Hexo 与 Morii', link: '/guide/getting-started' },
          { text: '首次配置', link: '/guide/first-config' },
          { text: '第一篇文章', link: '/guide/first-post' },
          { text: '发布博客：平台选择', link: '/guide/publishing' },
          { text: '更新主题', link: '/guide/updating' }
        ]
      },
      {
        text: '平台部署',
        items: [
          { text: 'Cloudflare Pages', link: '/guide/deploy/cloudflare' },
          { text: 'GitHub Pages', link: '/guide/deploy/github-pages' },
          { text: 'Vercel', link: '/guide/deploy/vercel' },
          { text: 'Netlify', link: '/guide/deploy/netlify' },
          { text: 'EdgeOne Pages', link: '/guide/deploy/edgeone' }
        ]
      },
      {
        text: '功能指南',
        items: [
          { text: '创建常用页面', link: '/features/pages' },
          { text: '相册与友链', link: '/features/album-links' },
          { text: '音乐馆与电影院', link: '/features/media' },
          { text: '外观与导航', link: '/features/customization' },
          { text: '搜索、社交与评论', link: '/features/interaction' }
        ]
      },
      {
        text: '帮助',
        items: [
          { text: '常见问题', link: '/troubleshooting' },
          { text: '新手术语表', link: '/guide/glossary' }
        ]
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
