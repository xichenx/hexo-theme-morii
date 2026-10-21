# 部署到 GitHub Pages

本教程使用 **GitHub Actions**：你把博客源码推到 GitHub，Actions 安装依赖、生成 `public/`，再发布到 GitHub Pages。先完成[通用检查与 GitHub 仓库准备](/guide/publishing)。**不用**把本地 `public/` 提交到仓库。[GitHub 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)推荐用自定义工作流发布需要构建的静态站点。

使用 GitHub Free 的读者，博客仓库请设为**公开**；私有仓库能否使用 Pages 取决于账号或组织套餐。即使仓库可以设为私有，发布的网站仍会公开访问。具体规则以[GitHub Pages 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)为准。

## 1. 先确定访问地址

GitHub Pages 常见两种地址，填写方式**不同**：

| 仓库名 | 网站地址示例 | 博客 `_config.yml` |
| --- | --- | --- |
| `yourname.github.io` | `https://yourname.github.io/` | `url: https://yourname.github.io`、`root: /` |
| `my-morii-blog` | `https://yourname.github.io/my-morii-blog/` | `url: https://yourname.github.io/my-morii-blog`、`root: /my-morii-blog/` |

把 `yourname` 和仓库名换成自己的，**大小写与路径要一致**。在博客根目录的 `_config.yml` 修改原有 `url`、`root` 行。例如普通项目仓库：

```yaml
url: https://yourname.github.io/my-morii-blog
root: /my-morii-blog/
```

网站路径的开头和结尾都需要 `/`。改完在本地运行 `hexo clean`、`hexo generate`，检查 `public/index.html`。如果将来绑定自己的域名，一般会改为自定义域名和 `root: /`，并按 GitHub 的[自定义域名说明](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)配置 DNS。

## 2. 把博客源码推到仓库

按[通用 GitHub 步骤](/guide/publishing#需要自动部署-先把博客上传到-github)创建仓库并推送。仓库里要有 `package.json`、`package-lock.json`、`_config.yml`、`_config.morii.yml` 和 `source/`。`public/`、`node_modules/` 不要提交。`package.json` 应有 `"build": "hexo generate"`。

## 3. 新建 Actions 工作流

在**博客根目录**创建 `.github/workflows/deploy.yml`。如果文件夹不存在，依次新建 `.github`、`workflows`。复制完整内容：

```yaml
name: Deploy Hexo blog

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: github-pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Get blog source
        uses: actions/checkout@v4
      - name: Use Node.js 24
        uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: npm
      - name: Configure Pages
        uses: actions/configure-pages@v5
      - name: Install dependencies
        run: npm ci
      - name: Generate website
        run: npm run build
      - name: Upload website
        uses: actions/upload-pages-artifact@v4
        with:
          path: public
      - name: Publish to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

`npm ci` 使用提交到仓库的 `package-lock.json` 安装依赖；`npm run build` 调用博客自己的 Hexo 构建脚本；`public` 是 Hexo 输出目录。[GitHub 自定义工作流说明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

## 4. 启用 Pages 并推送工作流

1. 打开 GitHub 博客仓库的 **Settings → Pages**。
2. 在 *Build and deployment → Source* 选择 **GitHub Actions**，不要选“Deploy from a branch”。
3. 在本地博客根目录运行：

```bash
git add .
git commit -m "配置 GitHub Pages 自动部署"
git push
```

4. 在仓库 **Actions** 页面打开 “Deploy Hexo blog”，等待绿色成功标记。再回到 **Settings → Pages** 查看发布地址。

## 5. 以后更新与排错

写完文章后按[通用 Git 更新步骤](/guide/publishing#以后怎么更新网站)推送，工作流会再次运行。如果首页能打开，但 CSS、图片或搜索文件 404，通常是普通项目仓库忘记把 `root` 设为 `/仓库名/`。如果 Actions 中 `npm ci` 失败，检查 `package-lock.json` 是否已提交；如果 Pages 提示权限问题，确认仓库设置选了 **GitHub Actions**，工作流包含 `pages: write` 和 `id-token: write`。

[回到平台选择](/guide/publishing)
