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

这一步只修改两个文件，都在博客根目录 `my-blog/`，不需要进入 `themes/` 或 `node_modules/`。

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

## 2. 新建个人主题配置

**在哪里改：**新建 `my-blog/_config.morii.yml`，与 `_config.yml` 放在一起。**怎么改：**将下面的**完整文件**复制进去并保存。

也可以<a href="/examples/minimal/_config.morii.yml" download="_config.morii.yml">下载这一份最小配置</a>。已有个人配置的读者先备份，再合并字段；不要直接覆盖原来的服务与账号。

<<< @/public/examples/minimal/_config.morii.yml{yaml} [_config.morii.yml：完整文件]

`brand` 控制顶部站名，`intro` 控制首页介绍，`hero.title` 控制首页两行大标题。先照抄，看到效果后再把“小林”换成你的名字。

### 为什么暂时没有菜单？

对应页面还没建好，先用 `menu: false` 隐藏入口。[第 4 步](/guide/complete-site)会一起创建页面并开启菜单。

默认配置带有主题作者的账号、城市和外部服务。本示例先关闭这些功能，准备好自己的资料后再逐项开启。头像使用主题自带图片，暂时不需要准备图片文件。

::: details 为什么标题写成 `0:`、`1:`，列表写成 `false`？
当前配置合并方式会保留部分默认列表。这里使用已经验证的写法，覆盖首页标题并清除默认入口。先保留示例的结构即可，详细解释见[配置手册](/config/#_4-理解默认值和列表合并)。
:::

::: tip 保存文件时检查
文件名必须是 `_config.morii.yml`，不是 `_config.morii.yml.txt`。缩进用空格；同一文件里不要重复写两个 `home:` 或两个 `music:`。编辑器保存快捷键是 Windows 的 Ctrl+S 或 macOS 的 ⌘S。
:::

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
| 首页大标题 | 你好，我是小林。 / 欢迎来到我的笔记本。 |
| 大标题下的介绍 | 你好，我是小林。这里记录我的学习笔记和日常。 |
| 作者卡片 | 小林；分享编程实践、阅读心得与生活片段。 |
| 顶部菜单 | 暂时没有文章、相册等菜单项 |
| 页脚 | 不展示主题作者的运行时间与备案信息 |

如果站名正确而作者卡片仍是旧内容，回到 `_config.yml` 检查 `author` 和 `description`。全部没变化则检查文件位置和扩展名。

::: details 我想现在换头像
把方形图片放到博客 `source/images/avatar.png`，然后在已有 `_config.morii.yml` 中把 `avatar` 那一行改为 `avatar: /images/avatar.png`。没有图片时保持示例即可。Logo 和浏览器图标的区别见[图片配置](/config/basic)。
:::

**本页完成标志：**你能在首页认出自己的站名、姓名和介绍。接着写[第一篇文章](/guide/first-post)。
