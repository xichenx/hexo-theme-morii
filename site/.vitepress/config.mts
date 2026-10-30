import { defineConfig } from 'vitepress'

const onboarding = {
  text: '跟着做：5 步完成接入',
  items: [
    { text: '先看接入路线', link: '/guide/' },
    { text: '1. 安装并启用主题', link: '/guide/getting-started' },
    { text: '2. 换成自己的资料', link: '/guide/first-config' },
    { text: '手动配置与快捷向导', link: '/guide/initialization' },
    { text: '3. 写第一篇文章', link: '/guide/first-post' },
    { text: '4. 补齐页面和菜单', link: '/guide/complete-site' },
    { text: '5. 发布上线', link: '/guide/publishing' }
  ]
}
const reference = {
  text: '按需查：主题配置',
  items: [
    { text: '配置总览与填写方法', link: '/config/' },
    { text: '基本信息、头像与 Logo', link: '/config/basic' },
    { text: '外观、导航与特效', link: '/features/customization' },
    { text: '首页内容与推荐', link: '/config/home' },
    { text: '文章与阅读功能', link: '/config/article' },
    { text: '侧栏、小组件与页脚', link: '/config/widgets' },
    { text: '搜索、社交与评论', link: '/features/interaction' },
    { text: '稳定性与技术写作增强', link: '/config/iteration' },
    { text: '系列、封面与大型搜索', link: '/config/content' }
  ]
}
const features = {
  text: '逐个添加功能',
  items: [
    { text: '先选一个功能', link: '/features/' },
    { text: '常用页面与关于资料', link: '/features/pages' },
    { text: '相册、友链与朋友圈', link: '/features/album-links' },
    { text: '音乐馆与电影院', link: '/features/media' },
    { text: '社交、评论与留言板', link: '/features/interaction' }
  ]
}
const deployment = {
  text: '选一个平台发布',
  items: [
    { text: '发布前准备与平台选择', link: '/guide/publishing' },
    { text: 'Cloudflare Pages', link: '/guide/deploy/cloudflare' },
    { text: 'GitHub Pages', link: '/guide/deploy/github-pages' },
    { text: 'Vercel', link: '/guide/deploy/vercel' },
    { text: 'Netlify', link: '/guide/deploy/netlify' },
    { text: 'EdgeOne Pages', link: '/guide/deploy/edgeone' }
  ]
}
const help = {
  text: '示例与帮助',
  items: [
    { text: '完整文件与修改前后对照', link: '/examples/' },
    { text: '常见问题', link: '/troubleshooting' },
    { text: '新手术语表', link: '/guide/glossary' },
    { text: '更新主题', link: '/guide/updating' }
  ]
}

export default defineConfig({
  lang: 'zh-CN',
  title: 'Morii 文档',
  description: '从安装到上线，跟着完整示例接入 Morii Hexo 主题',
  cleanUrls: true,
  srcExclude: ['public/**'],
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/morii-logo-v2.png' }]
  ],
  themeConfig: {
    siteTitle: 'Morii',
    logo: { src: '/morii-logo-v2.png', alt: 'Morii' },
    outline: { level: [2, 3], label: '本页步骤' },
    docFooter: { prev: '上一页', next: '下一页' },
    sidebarMenuLabel: '教程目录',
    returnToTopLabel: '返回顶部',
    nav: [
      { text: '开始使用', link: '/guide/', activeMatch: '^/guide/(?!deploy/|publishing)' },
      { text: '示例', link: '/examples/' },
      { text: '配置手册', link: '/config/', activeMatch: '^/(config/|features/customization)' },
      { text: '功能指南', link: '/features/', activeMatch: '^/features/(?!customization)' },
      { text: '发布上线', link: '/guide/publishing', activeMatch: '^/guide/(publishing|deploy/)' },
      { text: 'GitHub', link: 'https://github.com/xichenx/hexo-theme-morii' }
    ],
    // 按页面位置显示当前章节，避免新手同时面对所有字段与部署平台。
    sidebar: {
      '/guide/deploy/': [deployment, help],
      '/guide/publishing': [deployment, help],
      '/guide/': [onboarding, help],
      '/examples/': [onboarding, help],
      '/config/': [reference, help],
      '/features/customization': [reference, help],
      '/features/': [features, help],
      '/': [onboarding, help]
    },
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
