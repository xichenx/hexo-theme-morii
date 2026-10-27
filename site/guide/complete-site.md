---
prev:
  text: '第 3 步：写第一篇文章'
  link: /guide/first-post
next:
  text: '第 5 步：发布上线'
  link: /guide/publishing
---

# 第 4 步：补齐页面和菜单

**开始条件：**第一篇文章能打开。**本页目标：**顶部显示“首页、文章、分类、标签、即刻、友链、关于”7 个入口，每一个都能访问。

这一步先建页面，再填写数据，最后打开菜单。相册、音乐馆等内容以后再按[功能指南](/features/)添加。

## 1. 创建 5 个页面文件

在博客根目录执行：

```bash [终端：my-blog/]
hexo new page categories
hexo new page tags
hexo new page essay
hexo new page link
hexo new page about
```

如果某个页面已存在，跳过对应创建命令，先备份并检查已有内容。不要在博客根目录创建 `about/index.md`，正确位置是 `source/about/index.md`。

下面每个标签代表**一个不同文件**。依次点击标签，把内容写入对应文件，不要把五段内容都粘进同一个文件：

::: code-group
<<< @/public/examples/starter/source/categories/index.md{md} [source/categories/index.md]
<<< @/public/examples/starter/source/tags/index.md{md} [source/tags/index.md]
<<< @/public/examples/starter/source/essay/index.md{md} [source/essay/index.md]
<<< @/public/examples/starter/source/link/index.md{md} [source/link/index.md]
<<< @/public/examples/starter/source/about/index.md{md} [source/about/index.md]
:::

`type` 告诉 Morii 使用哪种页面布局，不能随意改名。分类和标签会读取上一篇文章的设置；关于页可以直接写 Markdown 正文。文章归档 `/archives/` 由 Hexo 的归档生成器提供，不需要再创建页面。

## 2. 给即刻和友链添加内容

在 `source/` 下新建 `_data` 文件夹，再分别创建两个文件：

::: code-group
<<< @/public/examples/starter/source/_data/essay.yml{yaml} [source/_data/essay.yml]
<<< @/public/examples/starter/source/_data/link.yml{yaml} [source/_data/link.yml]
:::

| 文件 | 生成的效果 |
| --- | --- |
| `essay.yml` | 即刻页出现“博客搭好了，记下这一刻。”；首页也可显示这条短文 |
| `link.yml` | 友链页出现一张“Hexo”网站卡片 |

现在博客里应该有：

```text
my-blog/
├── _config.yml
├── _config.morii.yml
└── source/
    ├── _posts/hello-morii.md
    ├── _data/
    │   ├── essay.yml
    │   └── link.yml
    ├── categories/index.md
    ├── tags/index.md
    ├── essay/index.md
    ├── link/index.md
    └── about/index.md
```

## 3. 开启顶部菜单

**在哪里改：**`_config.morii.yml`。**怎么改：**找到原来的 `menu: false`，用下面完整菜单替换它；不要再添加第二个 `menu:`。

::: code-group
```yaml [修改前]
menu: false
```
```yaml [修改后]
menu:
  - name: 首页
    path: /
  - name: 文章
    path: /archives/
  - name: 分类
    path: /categories/
  - name: 标签
    path: /tags/
  - name: 即刻
    path: /essay/
  - name: 友链
    path: /link/
  - name: 关于
    path: /about/
```
:::

先保留全部 7 项。这份菜单完整覆盖当前默认菜单，避免只写两三项时保留多余默认入口。`name` 决定显示文字，`path` 必须指向已创建的页面。

## 4. 生成后逐个点击

停止正在运行的预览服务，在博客根目录运行：

```bash [终端：my-blog/]
hexo clean
hexo generate
hexo server
```

从首页逐一点击菜单，对照检查：

| 入口 | 默认本地地址 | 预期内容 |
| --- | --- | --- |
| 首页 | `http://localhost:4000/` | 小林的笔记与第一篇文章 |
| 文章 | `http://localhost:4000/archives/` | 按时间列出文章 |
| 分类 | `http://localhost:4000/categories/` | 学习记录 |
| 标签 | `http://localhost:4000/tags/` | Hexo、博客 |
| 即刻 | `http://localhost:4000/essay/` | 博客搭好了，记下这一刻。 |
| 友链 | `http://localhost:4000/link/` | Hexo 网站卡片，点击能打开官网 |
| 关于 | `http://localhost:4000/about/` | 个人资料与“你好，我是小林”的正文 |

端口如果不是 4000，以终端实际输出为准。

## 没得到预期结果？

| 现象 | 应该检查哪个文件 |
| --- | --- |
| 直接访问 `/about/` 是 404 | `source/about/index.md` 是否存在，是否重新生成 |
| 页面能开但样式不对 | 页面开头的 `type` 是否拼对 |
| 即刻 / 友链有页面却没有条目 | `source/_data/essay.yml`、`link.yml` 的位置和缩进 |
| 分类 / 标签是空的 | 文章是否填了分类、标签 |
| 顶部菜单仍为空 | 是否替换了 `menu: false`，文件是否保存 |
| 菜单里多出“相册” | 是否使用完整 7 项菜单覆盖默认项 |

**本页完成标志：**7 个入口全部可用。现在可以进入[第 5 步：发布上线](/guide/publishing)。想对照整个主题配置，可查看[完整示例](/examples/#complete)。
