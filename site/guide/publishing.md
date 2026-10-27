---
prev:
  text: '第 4 步：补齐页面和菜单'
  link: /guide/complete-site
next: false
---

# 第 5 步：发布自己的博客

**开始条件：**已经在本地检查过文章和全部菜单。**本页目标：**选一个平台，把自己的博客发布到正式网址。

本地的 `http://localhost:4000/` 只有你的电脑能访问。要让别人看到博客，需要发布 Hexo 生成的网页。**Morii 文档站和你自己的博客是两个网站**；下面部署的是你的博客。

| 平台 | 开始条件 | 本教程的方式 |
| --- | --- | --- |
| [Cloudflare Pages](/guide/deploy/cloudflare) | Cloudflare 账号 | 手动上传或 Git 自动部署 |
| [GitHub Pages](/guide/deploy/github-pages) | GitHub 仓库 | GitHub Actions 自动部署 |
| [Vercel](/guide/deploy/vercel) | GitHub 仓库 | Git 自动部署 |
| [Netlify](/guide/deploy/netlify) | Netlify 账号 | 手动上传或 Git 自动部署 |
| [EdgeOne Pages](/guide/deploy/edgeone) | 腾讯云账号、GitHub 仓库 | Git 自动部署 |

**选一个平台即可。**完全不会 Git，可以先用 Cloudflare Pages 或 Netlify 手动上传；想在以后每次推送文章时自动更新，再用 Git 自动部署。

## 所有平台都要做的检查

先完成[修改资料](/guide/first-config)、[第一篇文章](/guide/first-post)和[页面菜单](/guide/complete-site)，再在**自己的博客根目录**运行：

```bash
hexo clean
hexo generate
hexo server
```

本地打开 `http://localhost:4000/`，确认站名、文章、图片和内页正确，没有主题作者的账号、备案或评论地址。按 **Ctrl+C** 停止预览。博客根目录应有 `public/index.html`。**发布的是 `public/` 中的网页**，不是主题仓库，也不是文档站的 `site/`。

打开博客根目录的 `package.json`，确认依赖中有 `hexo`、`hexo-theme-morii`、`hexo-renderer-pug`，且 `scripts` 中有 `"build": "hexo generate"`。用本教程的 `hexo init` 创建的博客通常已有这个脚本。缺少主题或渲染器时，在博客根目录运行 `npm install hexo-theme-morii@latest hexo-renderer-pug`。

::: warning 通过 Git 安装主题的读者
`themes/morii/` 可能有自己的 `.git`；普通的 `git add .` 不会把主题源码完整上传。初学者可以先手动上传 `public/`。改用 npm 安装主题前，先备份主题目录中的个人修改，把它们迁到博客根目录 `_config.morii.yml`，再移走 `themes/morii/`、安装 npm 版并在本地确认能生成网页。已经熟悉 Git 的读者也可正确配置子模块。
:::

## `url` 与 `root` 怎么填？

打开博客根目录的 `_config.yml`，**修改原有的** `url:`、`root:`，不要写第二组。大多数平台把网站放在域名根路径：

```yaml
url: https://你的实际站点地址
root: /
```

`url` 要填平台**最终显示的地址**，结尾不加 `/`；`root` 是网站在域名下的路径。不要把中文占位文字直接发布。GitHub Pages 的“项目仓库”通常放在 `/仓库名/` 子路径，需要按[GitHub Pages 教程](/guide/deploy/github-pages)设置，例如：

```yaml
url: https://yourname.github.io/my-blog
root: /my-blog/
```

如果第一次部署后的实际地址与你预想的不同，回来修改 `_config.yml`，重新发布一次。绑定自己的域名后也要同步修改 `url`。

## 需要自动部署？先把博客上传到 GitHub

五个平台的 Git 自动部署都可以使用你的 GitHub **博客仓库**。它应包含**你的文章与博客配置**，不要只上传 Morii 主题源码。

### 1. 创建空仓库

登录 [GitHub](https://github.com/)，新建仓库，例如 `my-morii-blog`。初次推送时，不勾选自动生成 README、`.gitignore` 或许可证。记下仓库地址，形如 `https://github.com/你的用户名/my-morii-blog.git`。

### 2. 检查要上传的文件

在**博客根目录**打开 `.gitignore`，确认至少有下面三行；缺少就追加，不要删除原有内容：

```text
node_modules/
public/
db.json
```

博客根目录应有 `package.json`、`package-lock.json`、`_config.yml`、`_config.morii.yml` 和 `source/`。`node_modules/` 是本地依赖，`public/` 是生成结果，`db.json` 是 Hexo 缓存，都不需要提交。

### 3. 首次提交并推送

在**博客根目录**运行，先把仓库地址里的用户名、仓库名换成自己的：

```bash
git init
git add .
git status --short
git commit -m "创建博客"
git branch -M main
git remote add origin https://github.com/你的用户名/my-morii-blog.git
git push -u origin main
```

`git status --short` 列出的待提交文件里**不应出现** `node_modules/`、`public/` 或 `db.json`。Git 要求姓名和邮箱时，按终端提示设置后重试提交；GitHub 要求登录时，按它给出的浏览器认证步骤操作。刷新 GitHub 仓库页面，应能看到 `source/`、`_config.yml` 和 `package.json`。如果博客已有自己的 Git 远程仓库，保留现有设置，确认代码已推送即可。

## 以后怎么更新网站？

使用**手动上传**：在本地修改文章后运行 `hexo clean`、`hexo generate`，再上传新的 `public/`。使用**Git 自动部署**：在博客根目录运行：

```bash
git add .
git commit -m "更新博客"
git push
```

到平台的“部署”页面等待最新构建成功，再打开线上网站检查。**保存本地文件不等于上线**。

## 上线后检查什么？

依次打开首页、一篇文章、分类页和一张图片，再试站内搜索。如果首页能打开、内页或图片却是 404，优先检查 `_config.yml` 的 `url` 与 `root`，重新部署。更多症状见[常见问题](/troubleshooting)。

::: tip 两个构建输出不要混用
你的 Hexo 博客输出在 `public/`。这份 VitePress 文档站输出在 `site/.vitepress/dist/`，属于 Morii 主题源码仓库。
:::
