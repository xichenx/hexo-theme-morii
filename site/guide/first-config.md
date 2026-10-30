---
prev:
  text: '第 1 步：安装主题'
  link: /guide/getting-started
next:
  text: '第 3 步：写第一篇文章'
  link: /guide/first-post
---

# 第 2 步：换成自己的资料

**开始条件：**已经在本地看到 Morii 首页。**本页目标：**站名、作者和介绍改成「小林的笔记」，未配置的服务先关闭。

这一步主要修改博客基本配置；主题覆盖文件按需创建。文件都在博客根目录 `my-blog/`，不需要进入 `themes/` 或 `node_modules/`。

## 1. 修改博客身份

**在哪里改：**`my-blog/_config.yml`。**怎么改：**找到下列字段，修改原有值，其他内容保留。

```yaml [_config.yml：只修改这些字段]
title: 小林的笔记
subtitle: 记录学习与生活
description: 分享编程实践、阅读心得与生活片段。
author: 小林
language: zh-CN
timezone: Asia/Shanghai
theme: morii
```

### 选择界面语言

`language` 支持 `en`（英文）、`zh-CN`（简体中文）和 `zh-TW`（繁体中文）。修改后执行 `npx hexo clean && npx hexo generate`。导航、搜索、播放器提示及主题按钮会使用对应语言，文章和个人资料保留原文。默认使用简体中文；语言数组只取第一项，不会自动创建多语言文章副本。

单篇页面可以通过 Front Matter 的 `lang: en` 或 `lang: zh-TW` 覆盖站点语言。自定义导航名称还可在 `_config.morii.yml` 中使用语言映射：

```yaml
menu:
  - name:
      zh-CN: 我的笔记
      zh-TW: 我的筆記
      en: My notes
    path: /archives/
```

内置导航名称会自动翻译；其他字符串保持原样。外部评论服务及嵌入式播放器的内部语言由对应服务控制。

| 修改的字段 | 去哪里看结果 |
| --- | --- |
| `title` | 浏览器标签里的站名 |
| `author` | 作者卡片的姓名 |
| `description` | 作者卡片里的介绍 |

不要用这个片段覆盖整个 `_config.yml`，它还有 Hexo 的网址、文章和分页设置。正式网址等到[第 5 步](/guide/publishing)再填写。

## 2. 按需添加主题配置

顶部站名、首页两行标题与介绍会直接使用刚才填写的 `title`、`subtitle` 和 `description`；头像使用内置图片，未填写的外部服务保持关闭。可以手动复制配置，也可以用可选的快捷向导，按自己的习惯选择。

### 手动复制配置

新建 `my-blog/_config.morii.yml`，复制下面的最小配置即可：

<<< @/public/examples/minimal/_config.morii.yml{yaml} [_config.morii.yml：可选]

<a href="/examples/minimal/_config.morii.yml" download="_config.morii.yml">下载最小配置</a>。也可以整份复制安装目录里的主题 `_config.yml`，保存为博客根目录的 `_config.morii.yml` 后自行修改。已有个人配置请保留原文件，按需合并字段。

页面和菜单按[第 4 步](/guide/complete-site)手动创建，整个过程无需运行 `morii:init`。

### 快捷创建页面（可选）

想自动创建关于、分类和标签页，在博客根目录执行：

```bash
npx hexo morii:init --yes
```

安装了全局 `hexo-cli` 也可以直接运行 `hexo morii:init --yes`。更多选择和已有站点的处理方式见[配置方式说明](/guide/initialization)。暂时只写文章也可以跳过主题配置与向导，保留“首页、文章”两个默认菜单。

例如 `avatar: /images/avatar.png` 用于自定义头像，`intro` 用于单独修改首页介绍。内置导航名称自动翻译，个人内容只需写一种语言；语言映射仅在需要独立译文时使用。

## 3. 重新启动并对照结果

先在运行预览服务的终端按 **Ctrl+C**，再在 `my-blog/` 执行：

```bash [终端：my-blog/]
hexo clean
hexo generate
hexo server
```

打开终端显示的地址，通常是 `http://localhost:4000/`。

| 页面位置 | 本示例的预期结果 |
| --- | --- |
| 顶部左侧 | 小林的笔记 |
| 首页大标题 | 小林的笔记 / 记录学习与生活 |
| 大标题下的介绍 | 分享编程实践、阅读心得与生活片段。 |
| 作者卡片 | 小林；分享编程实践、阅读心得与生活片段。 |
| 顶部菜单 | 默认首页、文章；运行向导后增加所选页面 |
| 页脚 | 不展示主题作者的运行时间与备案信息 |

如果站名正确而作者卡片仍是旧内容，回到 `_config.yml` 检查 `author` 和 `description`。全部没变化则检查文件位置和扩展名。

::: details 我想现在换头像
把方形图片放到博客 `source/images/avatar.png`，然后在已有 `_config.morii.yml` 中把 `avatar` 那一行改为 `avatar: /images/avatar.png`。没有图片时保持示例即可。Logo 和浏览器图标的区别见[图片配置](/config/basic)。
:::

**本页完成标志：**你能在首页认出自己的站名、姓名和介绍。接着写[第一篇文章](/guide/first-post)。
