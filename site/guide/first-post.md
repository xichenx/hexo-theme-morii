---
prev:
  text: '第 2 步：修改资料'
  link: /guide/first-config
next:
  text: '第 4 步：补齐页面和菜单'
  link: /guide/complete-site
---

# 第 3 步：写第一篇文章

**开始条件：**首页已显示自己的资料。**本页目标：**写一篇「我的第一篇文章」，带分类和标签，点击后能阅读正文。

## 1. 创建文章

在博客根目录执行：

```bash [终端：my-blog/]
hexo new "hello-morii"
```

终端会显示新建文件的路径，通常是 `source/_posts/hello-morii.md`。用编辑器打开**终端实际输出的文件**。这里用英文文件名方便定位，网页标题可以是中文。

已有同名文章时，不要重复创建，换一个文件名再运行。

## 2. 填入完整内容

**在哪里改：**刚创建的文章文件。**怎么改：**替换整个文件内容；日期可保留 Hexo 原来生成的时间，或换成你的实际发布时间。

<<< @/public/examples/starter/source/_posts/hello-morii.md{md} [source/_posts/hello-morii.md：完整文件]

| 这部分 | 作用 | 在网页中看到什么 |
| --- | --- | --- |
| 两条 `---` 之间 | 文章设置，也叫 Front Matter | 标题、日期、分类、标签 |
| `title` | 网页上显示的文章名称 | 我的第一篇文章 |
| `categories` | 文章所属分类 | 学习记录 |
| `tags` | 文章关键词 | Hexo、博客 |
| `featured: true` | 标记为首页精选候选 | 首页“值得一读”可展示这篇文章 |
| 第二条 `---` 后面 | 正文，使用 Markdown | 标题、段落、列表 |

文章标题已经由 `title` 提供，正文从 `##` 二级标题开始。先不用加封面，避免被图片路径问题打断。

## 3. 本地查看

如果预览服务正在运行，先按 **Ctrl+C**。然后在博客根目录执行：

```bash [终端：my-blog/]
hexo clean
hexo generate
hexo server
```

打开首页，点击「我的第一篇文章」。文章地址取决于 Hexo 的 `permalink` 配置，**直接点击文章卡片即可，不需要猜 URL**。

检查下面四项：

- 首页文章列表出现「我的第一篇文章」。
- 文章页能看到“今天完成了什么”等正文。
- 文章分类是“学习记录”，标签是“Hexo”和“博客”。
- 目录能识别正文中的 `##` 标题。

分类与标签的**总览页**还需要下一步创建；此时不必因为 `/categories/` 或 `/tags/` 尚未存在而重装主题。

::: details 可选：加一张封面
把图片放到 `source/images/first-cover.jpg`，在文章顶部两条 `---` 之间增加 `cover: /images/first-cover.jpg`。不要把这一行放到正文末尾。修改前后对照见[示例：添加文章封面](/examples/#cover)。
:::

::: tip “Hello World” 还在首页正常吗？
它是 Hexo 初始化附带的示例文章，可以与新文章一起显示。确认不需要后再自行删除 `source/_posts/hello-world.md`，然后重新生成。
:::

**本页完成标志：**从首页点进文章，能读到刚才写下的内容。下一步[补齐页面和菜单](/guide/complete-site)。保存本地文章不会自动更新线上网站，上线在第 5 步完成。
