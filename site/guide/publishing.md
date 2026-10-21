# 把自己的博客发布到网上

本地的 `http://localhost:4000/` 只有你的电脑能访问。要让别人看到博客，需要把 Hexo 生成的静态文件放到网站托管平台。**主题文档站的 Cloudflare Pages 项目与自己的博客是两个独立项目。**

第一次上线可选**方式 A**：自己生成网页并上传，步骤少。希望以后写完文章只需推送到 GitHub，就选**方式 B**：Cloudflare 自动构建。请先选一种；Cloudflare 的直接上传项目不能改成 Git 集成项目，想换方式需要建新项目。

## 发布前检查

先确认博客里已替换默认头像、账号、歌单、备案和评论地址，详见[首次配置](/guide/first-config)。再确认文章和页面在本地能打开、图片没有 404。

Hexo 在博客根目录的 `_config.yml` 中使用 `url` 与 `root` 生成链接。如果你准备把博客放在域名根路径，例如 `https://my-morii-blog.pages.dev/`，应设置：

```yaml
url: https://my-morii-blog.pages.dev
root: /
```

这里的地址只是**示例**。实际项目名由你创建时决定，务必换成自己的地址。修改后重新生成网站。

## 方式 A：先用 Cloudflare Pages 手动上传

这个方式适合第一次上线、还不熟悉 Git 的读者。以后每次更新文章，都要重新上传生成结果。

1. 注册或登录 [Cloudflare](https://dash.cloudflare.com/)，进入 **Workers 和 Pages**。
2. 选择创建应用，并找到 **Pages → 拖放文件 / Drag and drop your files**。
3. 为**你的博客**取一个项目名，例如 `my-morii-blog`。先记下预计地址 `https://my-morii-blog.pages.dev/`。项目名可能被占用，最终地址以 Cloudflare 页面显示的为准。
4. 回到博客根目录，把 `_config.yml` 的 `url` 改成实际地址，`root` 设为 `/`。
5. 在博客根目录运行：

```bash
hexo clean
hexo generate
```

6. 生成完成后，博客根目录会出现 `public/` 文件夹。**把这个 `public/` 文件夹拖进上传区域**，不要上传整个博客，也不要上传 Morii 主题仓库。如果浏览器不能选择文件夹，可先把 `public/` 压缩成 ZIP 再上传。
7. 点击部署，完成后打开 Cloudflare 给出的 `*.pages.dev` 地址，检查首页、文章、图片和内页链接。如果实际地址与第 4 步填写的不同，回到 `_config.yml` 修改 `url`，重新生成并创建一次新部署。

Cloudflare 的[直接上传说明](https://developers.cloudflare.com/pages/get-started/direct-upload/)也列出了最新的界面步骤。直接上传项目**不能事后改成 Git 集成项目**；以后想自动部署，需要重新创建一个 Git 集成的 Pages 项目。

## 方式 B：连接 Git 仓库，自动部署

这一方式把**自己的博客根目录**放进单独的 GitHub 仓库，再连接 Cloudflare Pages。不要连接 `xichenx/hexo-theme-morii`：那是主题源码仓库，不包含你的文章。

### 1. 把博客放到 GitHub

先登录 [GitHub](https://github.com/) 并创建一个**空仓库**，例如 `my-morii-blog`。创建时不要勾选“添加 README”“添加 .gitignore”或“添加许可证”，这样第一次推送比较简单。复制 GitHub 显示的仓库地址，形如 `https://github.com/你的用户名/my-morii-blog.git`。

在博客根目录打开 `.gitignore`，确认至少包含下面几行；缺少的行可以追加，**不要删掉原有内容**：

```text
node_modules/
public/
db.json
```

`node_modules/` 是电脑上的依赖安装结果，`public/` 是生成的网站，`db.json` 是本地缓存。Cloudflare 会根据 `package.json` 自己安装依赖、重新生成网站。确认博客根目录有 `package.json` 和 `package-lock.json`，然后在博客根目录运行：

打开 `package.json`，确认 `scripts` 中有 `"build": "hexo generate"`。按本文 `hexo init` 创建的博客通常已经有这一项；如果你用的是自己改过的博客模板，缺少时需要补上。

```bash
git init
git add .
git status --short
git commit -m "创建 Morii 博客"
git branch -M main
git remote add origin https://github.com/你的用户名/my-morii-blog.git
git push -u origin main
```

把远程地址里的“你的用户名”和仓库名换成真实值。执行 `git status --short` 时，确认待提交列表里**没有** `node_modules/`、`public/`、`db.json`。如果 Git 提示先填写姓名和邮箱，按终端提示设置后重试提交；如果 GitHub 要求登录，请按它给出的浏览器认证流程操作。刷新 GitHub 仓库页面，应能看到 `source/`、`_config.yml` 和 `package.json`。

::: tip 使用 Git 安装主题的读者
如果博客的主题在 `themes/morii/`，这个文件夹里可能有自己的 `.git`，普通 `git add .` 不会把主题源码完整上传。初学者可以先用**方式 A** 手动上传博客；要用自动部署，先把主题安装方式整理为 npm 依赖，或学习 [Git 子模块](https://git-scm.com/book/zh/v2/Git-工具-子模块)后再提交仓库。不要在不清楚结果时直接推送一个不完整的 `themes/morii/`。
:::

### 2. 连接 Cloudflare Pages

1. 进入 Cloudflare 控制台的 **Workers 和 Pages**，点击创建应用，选择 **Pages → 连接 Git**（界面文字可能是 *Connect to Git* 或 *Import an existing Git repository*）。
2. 选择 GitHub 并按页面提示授权，选中刚创建的**博客仓库**，开始设置。
3. 按下表填写构建配置；如果没有框架选项，可选“None”或保持默认。

| Cloudflare 字段 | 填写值 |
| --- | --- |
| 生产分支 | `main` |
| 构建命令 | `npm run build` |
| 输出目录 | `public` |
| 根目录 | 留空，表示仓库根目录 |
| 环境变量 | `NODE_VERSION` = `24` |

4. 点击保存并部署。等待构建完成，Cloudflare 会给出一个 `*.pages.dev` 地址。打开它检查文章与图片。
5. 如果实际地址与 `_config.yml` 的 `url` 不同，修改成实际地址，`root` 保持 `/`，再按下一节提交并推送一次。链接、图片和搜索结果会随下一次部署更新。

Cloudflare 的构建环境没有你电脑上全局安装的 `hexo-cli`；`npm run build` 会使用博客 `package.json` 中的脚本和本地依赖，因此适合自动构建。

Cloudflare 的 [Hexo 部署指南](https://developers.cloudflare.com/pages/framework-guides/deploy-a-hexo-site/)和 [Git 集成说明](https://developers.cloudflare.com/pages/get-started/git-integration/)可用于对照当前界面。

### 3. 以后如何更新文章

在本地编辑 `source/_posts/` 里的文章并预览确认后，回到博客根目录运行：

```bash
git add .
git commit -m "更新博客文章"
git push
```

到 Cloudflare 项目的“部署”页面等待最新一次构建成功，再打开线上地址检查。只修改本地文件而**没有推送**时，线上不会变化；`public/` 是构建产物，无需提交。

## 其他平台

Morii 生成的是静态网页，也可部署到 GitHub Pages 等静态托管平台。若使用 `https://用户名.github.io/仓库名/` 这种**子目录地址**，必须按实际地址配置博客的 `url` 和 `root`，否则图片、搜索索引或页面链接可能失效。按 [Hexo 官方 GitHub Pages 指南](https://hexo.io/zh-cn/docs/github-pages.html)设置即可。

::: tip 文档站的发布方式
这份 Morii 文档使用 VitePress，构建输出是 `site/.vitepress/dist`；你的 Hexo 博客构建输出是 `public/`。这两个目录不能混用。
:::
