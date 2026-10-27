# 示例：照着文件改，更容易看懂

这里使用与[入门教程](/guide/)一致的「小林的笔记」。先看一个完整博客由哪些文件组成，再看常见修改的前后对照。

## 完成接入后的整套文件 {#complete}

这是[第 4 步](/guide/complete-site)完成后的状态：一篇文章、5 个页面、2 份页面数据和一份主题配置。你需要先有已经安装 Morii 的 Hexo 博客；这些文件**不包含** Hexo 本体、依赖或部署配置。

### 文件清单

点击“下载”保存对应文件。新建的练习博客可以按相同路径放置；已有内容的博客请先备份并逐项合并，不要整目录覆盖。

| 放到自己博客的哪个位置 | 用途 | 文件 |
| --- | --- | --- |
| `_config.morii.yml` | 主题资料与完整菜单 | <a href="/examples/starter/_config.morii.yml" download="_config.morii.yml">下载</a> |
| `source/_posts/hello-morii.md` | 第一篇文章 | <a href="/examples/starter/source/_posts/hello-morii.md" download="hello-morii.md">下载</a> |
| `source/categories/index.md` | 分类总览 | <a href="/examples/starter/source/categories/index.md" download="index.md">下载</a> |
| `source/tags/index.md` | 标签总览 | <a href="/examples/starter/source/tags/index.md" download="index.md">下载</a> |
| `source/about/index.md` | 关于页 | <a href="/examples/starter/source/about/index.md" download="index.md">下载</a> |
| `source/essay/index.md` | 即刻页面 | <a href="/examples/starter/source/essay/index.md" download="index.md">下载</a> |
| `source/link/index.md` | 友链页面 | <a href="/examples/starter/source/link/index.md" download="index.md">下载</a> |
| `source/_data/essay.yml` | 一条即刻短文 | <a href="/examples/starter/source/_data/essay.yml" download="essay.yml">下载</a> |
| `source/_data/link.yml` | 一张 Hexo 友链卡片 | <a href="/examples/starter/source/_data/link.yml" download="link.yml">下载</a> |

::: tip 多个文件都叫 index.md，怎么区分？
它们依靠父文件夹区分：关于页放到 `source/about/`，标签页放到 `source/tags/`。下载后若被浏览器改名为 `index (1).md`，移到正确文件夹后恢复成 `index.md`。也可以直接复制[第 4 步的分文件代码块](/guide/complete-site)。
:::

### Hexo 基本信息也要改

保留已有的 `_config.yml`，只修改这些字段：

```yaml [_config.yml：片段，不是完整文件]
title: 小林的笔记
author: 小林
description: 分享编程实践、阅读心得与生活片段。
language: zh-CN
timezone: Asia/Shanghai
theme: morii
```

### 完整主题配置

下面与上方下载的是**同一份文件**。相比入门第 2 步，它只把 `menu: false` 替换为已建好的 7 个入口，其余开关保持一致。

<<< @/public/examples/starter/_config.morii.yml{yaml} [_config.morii.yml：完整文件]

### 怎么确认复制正确？

在博客根目录运行 `hexo clean`、`hexo generate`、`hexo server`。首页应有“小林的笔记”和“我的第一篇文章”；点击全部 7 个菜单，按[预期结果表](/guide/complete-site#_4-生成后逐个点击)检查。首次构建仍出现报错时，先解决报错，再继续添加功能。

## 示例 1：把头像换成自己的 {#avatar}

**准备文件：**`source/images/avatar.png`。**修改文件：**`_config.morii.yml`。**操作：**替换已有的 `avatar` 行。

::: code-group
```yaml [修改前]
avatar: /icons/brand/morii-icon.png
```
```yaml [修改后]
avatar: /images/avatar.png
```
:::

**预期结果：**作者卡片换成你的头像。图片实际路径带 `source/`，配置中的网页路径不带它。若没有变化，先在浏览器单独访问 `/images/avatar.png`，确认图片能加载。没有准备图片时不要直接使用修改后的地址。

## 示例 2：给文章加封面 {#cover}

**准备文件：**`source/images/first-cover.jpg`。**修改文件：**`source/_posts/hello-morii.md`。**操作：**在文章顶部已有的两条 `---` 之间增加 `cover`，保留其他字段和正文。

::: code-group
```yaml [修改前：顶部字段节选]
title: 我的第一篇文章
description: 从零开始搭建小林的笔记，记录博客诞生的第一天。
```
```yaml [修改后：只新增 cover]
title: 我的第一篇文章
description: 从零开始搭建小林的笔记，记录博客诞生的第一天。
cover: /images/first-cover.jpg
```
:::

**预期结果：**文章卡片和文章顶部出现封面。不要在文件最下面另开一组 `---`。想保留卡片图片、关闭文章顶部大图，再在同一区域添加 `top_img: false`。更多字段见[文章配置](/config/article)。

## 示例 3：开启一条自己的公告 {#announcement}

**修改文件：**`_config.morii.yml`。**操作：**修改已有 `sidebar` 内的 `announcement`。如果其中已有 `tags`、`stats`，保留它们。

::: code-group
```yaml [修改前]
sidebar:
  announcement:
    enable: false
```
```yaml [修改后]
sidebar:
  announcement:
    enable: true
    title: 最近在做什么
    content: 正在整理 Hexo 学习笔记，每周更新一篇。
```
:::

**预期结果：**首页侧栏出现“最近在做什么”公告。只把 `enable` 改为 `true` 会继承默认公告，所以这里连标题和内容一起替换。

## 示例 4：新增一条即刻，不覆盖上一条 {#essay}

**修改文件：**`source/_data/essay.yml`。**操作：**在同一个 `essay_list` 下面新增一个 `- content` 条目，注意两项缩进一致。

```yaml [source/_data/essay.yml：添加后完整文件]
- title: 小林的日常
  home_essay: true
  essay_list:
    - content: 博客搭好了，记下这一刻。
      date: '2026-10-27'
    - content: 今天给博客补齐了关于和友链页面。
      date: '2026-10-28'
```

示例日期请改成真实记录时间。**预期结果：**即刻页有两条记录，首页速览也有可切换的内容。这里改的是数据文件，不是主题配置文件。

## 每次修改后的固定动作

保存文件 → 停止正在运行的预览服务（Ctrl+C）→ 在博客根目录运行：

```bash [终端：my-blog/]
hexo clean
hexo generate
hexo server
```

本地确认成功后，再按照自己的[发布方式](/guide/publishing)更新线上网站。更完整的字段和默认值放在[配置手册](/config/)，不需要为了完成这些示例把所有功能都开启。
