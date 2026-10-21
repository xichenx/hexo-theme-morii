# 部署到 Vercel

Vercel 可以连接 GitHub 博客仓库：推送文章后，它自动安装依赖、运行 Hexo 构建并发布 `public/`。先完成[通用准备和 GitHub 仓库步骤](/guide/publishing)。

## 1. 本地准备

确认**博客仓库**的 `package.json` 中有 `"build": "hexo generate"`，依赖包含 `hexo`、`hexo-theme-morii`、`hexo-renderer-pug`；`package-lock.json` 已提交。先在博客根目录运行 `npm run build`，确认 `public/index.html` 存在。Vercel 构建时会自己安装依赖，不需要提交 `public/`。

## 2. 导入 GitHub 仓库

1. 登录 [Vercel](https://vercel.com/)，在控制台选择 **Add New → Project** 或 **New Project**。
2. 连接 GitHub，按页面提示授权，选择**你的博客仓库**，点击导入。不要选 Morii 主题源码仓库。
3. 在部署前的项目设置中核对下表；若 Vercel 自动填了别的值，使用 *Override* 修改。

| 字段 | 应填的值 |
| --- | --- |
| Framework Preset | `Other` |
| Root Directory | 仓库根目录，通常保持默认 |
| Build Command | `npm run build` |
| Output Directory | `public` |
| Install Command | 保持自动检测 |
| Node.js Version | `24.x` |

4. 点击 **Deploy**。等待构建完成，在项目页面复制**生产地址**，通常以 `vercel.app` 结尾。项目名可能与预想不同，以控制台显示的实际地址为准。Vercel 的[构建设置说明](https://vercel.com/docs/builds/configure-a-build)支持手动设置构建命令与输出目录；[Node.js 版本说明](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)列出了可选版本。

如果创建项目时看不到 Node.js 版本选项，项目创建后到 **Settings → Build and Deployment → Node.js Version** 选择 `24.x`，再触发一次部署。

## 3. 设置博客网址

在博客根目录 `_config.yml` 修改原有的 `url`、`root`，例如：

```yaml
url: https://my-morii-blog.vercel.app
root: /
```

地址必须换成项目页面显示的**实际生产地址**。按[通用更新步骤](/guide/publishing#以后怎么更新网站)提交并推送，Vercel 会自动重新部署。打开首页、文章和图片确认链接正常。

## 4. 以后更新、绑定域名

修改文章后只需提交并推送到生产分支；到 Vercel 项目的 **Deployments** 查看最新构建是否成功。要绑定自己的域名，在项目的 **Settings → Domains** 添加域名，按控制台显示的 DNS 要求配置；生效后把博客 `_config.yml` 的 `url` 改为自己的域名并再次推送。

## 常见问题

- 显示默认页面或 404：检查 `Output Directory` 是否为 `public`，并查看构建日志里 `npm run build` 是否成功。
- 样式或图片路径错误：确认 `url` 是生产地址、`root: /`，推送后等待下一次部署完成。
- 构建提示找不到主题：检查**博客仓库**的 `package.json` 和锁文件是否包含主题依赖。Vercel 只会安装仓库里声明的依赖。

[回到平台选择](/guide/publishing) · [Vercel Git 部署说明](https://vercel.com/docs/git)
