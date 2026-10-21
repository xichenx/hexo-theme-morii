# 文章封面与阅读功能

文章有两类配置：**只影响一篇文章的设置**写在该文章顶部；**所有文章共用的阅读功能**写在博客 `_config.morii.yml`。

## 1. 一篇文章的完整示例

打开 `source/_posts/我的第一篇文章.md`，将字段合并到已有的两条 `---` 之间，不要在正文中再加第二组 Front Matter：

```markdown
---
title: 我的第一篇文章
date: 2026-10-21 10:00:00
updated: 2026-10-21 10:00:00
description: 记录我搭建博客的第一天。
cover: /images/posts/first-post.jpg
categories:
  - 生活记录
tags:
  - 博客
  - Hexo
featured: true
comments: false
outdated: false
---

## 今天做了什么

这是我的正文。
```

请把时间换成自己的时间；封面需要真实放在 `source/images/posts/first-post.jpg`，还没准备图片时删掉 `cover` 行。

| 字段 | 作用 | 不填时 |
| --- | --- | --- |
| `title` | 文章标题 | 建议始终填写 |
| `date` / `updated` | 发布 / 更新时间 | 由 Hexo 处理；主动填写便于控制 |
| `description` | 文章介绍、摘要来源之一 | 使用正文摘要等备用内容 |
| `cover` | 卡片封面、文章顶部封面的备用来源 | 使用无封面布局 |
| `top_img` | 单独指定文章顶部封面 | 使用 `cover`；设为 `false` 可关闭顶部封面 |
| `categories` / `tags` | 分类与标签 | 不显示相应分类、标签 |
| `featured` | `true` 时参与首页精选 | 不主动标记为精选 |
| `comments` | `false` 仅关闭本篇评论 | 遵循主题评论设置 |
| `outdated` | `false` 仅关闭本篇过时提示 | 遵循主题过时提示设置 |

例如要保留列表封面但隐藏文章顶部大图，可以同时写 `cover: /images/posts/first-post.jpg` 和 `top_img: false`。文章 `comments: true` 不会绕过全站 `comments.enable: false`。

## 2. 所有文章共用的阅读设置

以下代码写到 **`_config.morii.yml`** 的同一个 `article:` 分组中：

```yaml
article:
  resume:
    enable: true
  share:
    enable: true
  print:
    enable: true
  reading_settings: true
  navigation: true
  outdated:
    enable: true
    days: 365
  related:
    enable: true
    limit: 3
  code:
    collapse: true
    lines: 18
```

| 字段 | 默认值 | 功能与使用提示 |
| --- | --- | --- |
| `article.resume.enable` | `true` | 记录阅读位置，再次打开文章时可继续阅读 |
| `article.share.enable` | `true` | 显示文章分享功能；关闭后仍保留“复制文章链接”按钮 |
| `article.print.enable` | `true` | 显示打印 / 导出 PDF 工具，通过浏览器打印流程保存 |
| `article.reading_settings` | `true` | 允许访客调整字号和专注阅读模式 |
| `article.navigation` | `true` | 显示上一篇、下一篇；需要存在相邻文章 |
| `article.outdated.enable` | `true` | 根据文章更新时间显示内容可能过时的提示 |
| `article.outdated.days` | `365` | 过时提示天数阈值，使用正整数 |
| `article.related.enable` | `true` | 显示相关文章 |
| `article.related.limit` | `3` | 相关文章数量，范围 1–6 |
| `article.code.collapse` | `true` | 较长的代码块默认折叠 |
| `article.code.lines` | `18` | 代码折叠行数阈值，范围 5–100，建议从默认值开始 |

例如只想关闭打印功能，修改 `article.print.enable` 即可，不需要关闭全部阅读工具。`reading_settings` 和 `navigation` 直接接受布尔值，**不要在它们下面再套一层 `enable`**。

## 3. 稍后阅读

```yaml
reading_list:
  enable: true
```

开启后主题会生成 `/reading-list/`，并在文章页提供“加入稍后阅读”入口。无需自己创建同名页面。访客可以在清单页搜索、导入和导出收藏。

阅读清单、阅读进度和字号偏好保存在**访客当前浏览器的本地存储**，不会自动同步到手机或另一台电脑。清理站点数据后记录可能消失；迁移收藏可先导出清单。浏览器禁止存储时，相应功能会受影响。

## 4. 相关文章为什么没有出现？

相关文章按共同标签和分类匹配，共同标签的权重更高；没有匹配文章就不显示。建议先给至少两篇公开文章设置一个相同标签，再查看文章底部。加密文章不参与推荐。

## 5. 目录如何设置？

目录从正文标题生成。正文使用 `## 二级标题`、`### 三级标题`，不要只是加粗文字。文章标题已经由 Front Matter 的 `title` 提供，正文一般从 `##` 开始。

当前主题没有 `article.toc.enable` 这样的配置项，不要凭空添加。手机和桌面上的目录位置不同，需要分别检查。

## 6. 怎么验证这些功能？

1. 生成博客，打开一篇包含多个标题、长代码块和封面的文章。
2. 检查封面和目录，点击目录跳转，展开代码。
3. 滚动阅读一段内容后离开再返回，检查继续阅读提示。
4. 点击“加入稍后阅读”，打开 `/reading-list/` 确认记录存在。
5. 打开打印预览，检查标题、正文和来源网址；分享网址错误时回到 `_config.yml` 检查 `url`。

过时提示不出现时，先看文章的 `updated` 和 `outdated`，不要只看全局开关。
