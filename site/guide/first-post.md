# 发布第一篇文章

现在你的博客已经能在本地打开。本页会创建一篇文章，并解释写作时最常见的几个字段。

## 1. 创建文章文件

在**博客根目录**运行：

```bash
npx hexo new "我的第一篇文章"
```

终端会打印新文件路径，一般在 `source/_posts/` 里。用文本编辑器打开这个 `.md` 文件。**编辑终端实际显示的文件**，不必自己猜文件名。

## 2. 写标题、分类和正文

把文件改成类似下面的内容。Hexo 自动生成的 `date` 可以保留原值：

```markdown
---
title: 我的第一篇文章
date: 2026-10-21 10:00:00
categories: 生活
tags:
  - 日常
  - 开始
---

# 你好，Morii

这是我博客里的第一篇文章。

## 今天做了什么

我安装了 Hexo 和 Morii，接下来会在这里继续记录。
```

文件开头两条 `---` 之间是 **Front Matter**，用来填写标题、日期、分类和标签；两条 `---` 后面才是 Markdown 正文。复制示例时，可以直接用 Hexo 为你生成的日期，不需要写示例中的日期。`categories` 会影响分类页，`tags` 会影响标签页。[Hexo 写作说明](https://hexo.io/zh-cn/docs/writing.html)、[Front Matter 说明](https://hexo.io/zh-cn/docs/front-matter.html)

## 3. 可选：添加文章封面

把自己的图片放到博客根目录 `source/images/first-cover.jpg`，然后在文章顶部增加一行：

```yaml
cover: /images/first-cover.jpg
```

没有图片就先不要写 `cover`。路径区分大小写；写了不存在的文件，页面会显示加载失败的图片。

## 4. 本地查看结果

在博客根目录运行：

```bash
npx hexo clean
npx hexo generate
npx hexo server
```

首页应出现新文章。点开它，检查标题、正文、分类和标签。以后写文章时重复 `npx hexo new "文章标题"`，或者直接在 `source/_posts/` 新建 `.md` 文件。

::: tip 保存不等于上线
修改本地文章后，需要重新生成网站并按你的博客托管方式发布。Morii 文档站在 Cloudflare Pages 上，不会同步发布你的个人文章。下一步看[发布自己的博客](/guide/publishing)。
:::
