import { defineConfig } from 'vitepress'

const onboarding = {
  text: '5 步搭建博客',
  items: [
    { text: '先看接入路线', link: '/guide/' },
    { text: '1. 安装并启用主题', link: '/guide/getting-started' },
    { text: '2. 换成自己的资料', link: '/guide/first-config' },
    { text: '3. 写第一篇文章', link: '/guide/first-post' },
    { text: '4. 补齐页面和菜单', link: '/guide/complete-site' },
    { text: '5. 发布上线', link: '/guide/publishing' }
  ]
}
const onboardingExtras = {
  text: '配套资料',
  items: [
    { text: '手动配置与初始化向导', link: '/guide/initialization' },
    { text: '完整示例', link: '/examples/' },
    { text: '新手术语表', link: '/guide/glossary' }
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
const maintenance = {
  text: '升级与排障',
  items: [
    { text: '升级到 v1.1.0', link: '/guide/upgrade-1-1' },
    { text: '通用更新流程', link: '/guide/updating' },
    { text: '常见问题', link: '/troubleshooting' }
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
      { text: '入门教程', link: '/guide/', activeMatch: '^/guide/(?!upgrade-|updating)' },
      { text: '功能指南', link: '/features/', activeMatch: '^/features/(?!customization)' },
      { text: '配置手册', link: '/config/', activeMatch: '^/(config/|features/customization)' },
      { text: '示例', link: '/examples/' },
      {
        text: '版本与帮助',
        activeMatch: '^/(guide/(upgrade-|updating)|troubleshooting)',
        items: [
          ...maintenance.items,
          { text: '更新日志', link: 'https://github.com/xichenx/hexo-theme-morii/releases' }
        ]
      }
    ],
    // 按页面位置显示当前章节，避免新手同时面对所有字段与部署平台。
    sidebar: {
      '/guide/deploy/': [onboarding, deployment, maintenance],
      '/guide/publishing': [onboarding, deployment, maintenance],
      '/guide/upgrade-1-1': [maintenance],
      '/guide/updating': [maintenance],
      '/troubleshooting': [maintenance],
      '/guide/': [onboarding, onboardingExtras, maintenance],
      '/examples/': [onboardingExtras, onboarding],
      '/config/': [reference, maintenance],
      '/features/customization': [reference, maintenance],
      '/features/': [features, maintenance],
      '/': [onboarding, onboardingExtras, maintenance]
    },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            displayDetails: '展开搜索结果',
            resetButtonTitle: '清空搜索',
            backButtonTitle: '关闭搜索',
            noResultsText: '没有找到相关内容',
            footer: {
              selectText: '打开',
              selectKeyAriaLabel: '回车键',
              navigateText: '切换结果',
              navigateUpKeyAriaLabel: '向上方向键',
              navigateDownKeyAriaLabel: '向下方向键',
              closeText: '关闭',
              closeKeyAriaLabel: '退出键'
            }
          }
        }
      }
    },
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
