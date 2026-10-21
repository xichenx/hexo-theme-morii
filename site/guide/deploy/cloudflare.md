# 部署到 Cloudflare Pages

Cloudflare Pages 提供两种入门方式：**手动上传**本地生成的网页，或**连接 GitHub**自动构建。先完成[发布前的通用检查](/guide/publishing#所有平台都要做的检查)，再从下面选一种。它们需要分别创建 Pages 项目；[Cloudflare 官方说明](https://developers.cloudflare.com/pages/get-started/direct-upload/)指出，直接上传项目以后不能直接切换为 Git 集成项目。

## 方式一：手动上传，不需要 GitHub

### 1. 准备网页

在博客根目录的 `_config.yml` 修改原有设置。假设你给项目取名 `my-morii-blog`：

```yaml
url: https://my-morii-blog.pages.dev
root: /
```

实际地址可能因重名而变化；先按预期地址生成，部署后核对。运行：

```bash
hexo clean
hexo generate
```

确认 `public/index.html` 存在。`public/` 就是要上传的文件夹。

### 2. 在 Cloudflare 创建项目

1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)，进入 **Workers 和 Pages**。
2. 点击“创建应用”，选择 **Pages → 拖放文件**。英文界面可能显示 *Drag and drop your files*。
3. 输入项目名，把整个 `public/` 文件夹拖入上传区域。浏览器不能选文件夹时，可将 `public/` 压缩为 ZIP 后上传。不要上传博客根目录或 `node_modules/`。
4. 点击部署，等待显示成功，再打开控制台给出的 `*.pages.dev` 地址。

如果真实地址与 `_config.yml` 中的 `url` 不同，修改 `url`，重新运行 `hexo clean`、`hexo generate`。回到这个项目的部署页面，创建**新的生产部署**并再次上传 `public/`。[官方拖放教程](https://developers.cloudflare.com/pages/get-started/direct-upload/#drag-and-drop)

### 3. 以后更新

每次修改文章或配置后，在博客根目录重新生成，再到 Cloudflare 项目中创建新部署、上传新的 `public/`。只保存文件或只运行 `hexo generate`，线上都不会更新。

## 方式二：连接 GitHub，自动部署

### 1. 准备博客仓库

先完成[上传博客到 GitHub](/guide/publishing#需要自动部署-先把博客上传到-github)。注意仓库里应有 `package.json`、`package-lock.json`、`source/`、`_config.yml`、`_config.morii.yml`；`public/` 不必提交。博客的 `package.json` 应有 `"build": "hexo generate"`。

### 2. 连接仓库并填写构建设置

1. 在 [Cloudflare 控制台](https://dash.cloudflare.com/)打开 **Workers 和 Pages → 创建应用 → Pages → 连接 Git**，选择 GitHub 并按提示授权。
2. 选择**你的博客仓库**，开始设置。不要选择 `xichenx/hexo-theme-morii`，那是主题源码仓库。
3. 填入以下值；没有框架选项时保持默认即可。

| 字段 | 值 |
| --- | --- |
| 项目名 | 自己想用的名字，例如 `my-morii-blog` |
| 生产分支 | `main` |
| 构建命令 | `npm run build` |
| 输出目录 | `public` |
| 根目录 | 留空，使用博客仓库根目录 |
| 环境变量 | `NODE_VERSION` = `24` |

4. 点击保存并部署，打开构建日志，等待依赖安装、Hexo 生成和上传都成功。打开 Pages 给出的生产地址。Cloudflare 的 [Hexo 部署指南](https://developers.cloudflare.com/pages/framework-guides/deploy-a-hexo-site/)也使用 `npm run build` 和 `public`。

### 3. 修正网址并再次推送

项目创建后，以控制台显示的实际地址为准，在博客 `_config.yml` 设置：

```yaml
url: https://实际项目名.pages.dev
root: /
```

如果原来的 `url` 不一致，按[通用更新步骤](/guide/publishing#以后怎么更新网站)提交并推送。Cloudflare 会再构建一次。以后写完文章也按这几条 Git 命令更新。

## 部署失败时先检查

- 日志提示找不到 `hexo` 或 `morii`：检查博客 `package.json` 的依赖及 `package-lock.json` 是否已推送。
- 页面是 404：输出目录应为 `public`，不是 `site/.vitepress/dist`；确认本地存在 `public/index.html`。
- 首页正常但图片失效：核对 `_config.yml` 的 `url`、`root`，重新发布。

[回到平台选择](/guide/publishing) · [Cloudflare Git 集成说明](https://developers.cloudflare.com/pages/get-started/git-integration/)
