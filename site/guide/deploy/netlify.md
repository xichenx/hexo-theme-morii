# 部署到 Netlify

Netlify 支持**手动拖入 `public/`**，也支持**连接 GitHub 自动更新**。先完成[通用发布前检查](/guide/publishing#所有平台都要做的检查)，然后选一种方式。[Netlify 官方入门说明](https://docs.netlify.com/welcome/add-new-site/)包含这两种流程。

## 方式一：手动拖入网页文件夹

### 1. 生成网页

在博客根目录运行：

```bash
hexo clean
hexo generate
```

确认 `public/index.html` 存在。Netlify 默认会给站点生成一个名字和 `*.netlify.app` 地址；第一次部署后再用实际地址修正博客配置。

### 2. 上传并记下地址

1. 登录 [Netlify](https://app.netlify.com/)，在团队页面选择 **Add new project → Deploy manually**，或打开 [Netlify Drop](https://app.netlify.com/drop)。
2. 把**整个 `public/` 文件夹**拖到上传区域；不要拖博客根目录或主题目录。手动拖入时应选文件夹，Netlify 的[官方说明](https://docs.netlify.com/welcome/add-new-site/)也建议先解压 ZIP 再拖文件夹。
3. 部署成功后，复制控制台显示的 `*.netlify.app` 地址。在 `_config.yml` 修改原有的 `url`，`root` 设为 `/`：

```yaml
url: https://实际站点名.netlify.app
root: /
```

4. 重新运行 `hexo clean`、`hexo generate`，到该站点的 **Deploys** 页面，再把新的 `public/` 拖入部署区域。这样站内链接会使用正确地址。

### 3. 以后更新

每次写完文章，都重新生成并在 **Deploys** 页面拖入新的 `public/`。只改本地文件不会更新线上。站点名可以在控制台自定义；改名后默认地址也会变化，需要再次修改博客的 `url`。[Netlify 项目名称说明](https://docs.netlify.com/manage/projects/customize-project-name-and-cover-image)

## 方式二：连接 GitHub 自动部署

### 1. 准备仓库

按[通用 GitHub 步骤](/guide/publishing#需要自动部署-先把博客上传到-github)推送**自己的博客**。确认仓库中有 `package.json`、`package-lock.json`、`source/` 和两份配置文件；`package.json` 中有 `"build": "hexo generate"`。

### 2. 导入并填写构建配置

1. 在 Netlify 团队的 **Projects** 页面选 **Add new project → Import an existing project**。
2. 选择 GitHub，授权后选中**博客仓库**。
3. 核对下表。Netlify 自动识别的值若不同，以这里为准。

| 字段 | 值 |
| --- | --- |
| Branch to deploy | `main` |
| Base directory | 留空，使用仓库根目录 |
| Build command | `npm run build` |
| Publish directory | `public` |
| 环境变量 | `NODE_VERSION` = `24` |

4. 点击部署，等待构建日志显示成功，复制实际的 `*.netlify.app` 地址。Netlify 的[Hexo 构建说明](https://docs.netlify.com/build/frameworks/overview/#hexo)列出的输出目录也是 `public`；[Node.js 版本说明](https://docs.netlify.com/build/configure-builds/available-software-at-build-time/)支持用 `NODE_VERSION` 指定版本。

### 3. 修正网址并更新

在博客 `_config.yml` 把 `url` 改为控制台显示的地址，`root: /`，然后按[通用 Git 更新步骤](/guide/publishing#以后怎么更新网站)推送一次。以后写文章也按同样方式推送；Netlify 会自动重新构建。

## 常见问题

- 首页 404：检查 *Publish directory* 是否为 `public`，并确认日志显示成功生成 `public/index.html`。
- 本地改了文章但线上未变化：手动站点要再次拖入文件夹；Git 站点要提交并推送。
- 图片或搜索异常：核对 `url` 与 `root`，重新生成、重新部署。

[回到平台选择](/guide/publishing)
