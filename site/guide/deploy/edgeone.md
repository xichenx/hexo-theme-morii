# 部署到腾讯云 EdgeOne Pages

EdgeOne Pages 可以连接 GitHub 仓库，自动构建 Hexo 博客。以下按腾讯云控制台的 Git 仓库方式介绍；先完成[通用准备与 GitHub 仓库步骤](/guide/publishing)。**连接的是你的博客仓库**，不是 Morii 主题仓库。

## 1. 核对仓库和本地构建

仓库中应有 `package.json`、`package-lock.json`、`source/`、`_config.yml` 和 `_config.morii.yml`。`package.json` 应有 `"build": "hexo generate"`，依赖包含 Hexo、Morii 与 Pug 渲染器。在博客根目录运行 `npm run build`，确认 `public/index.html` 存在。`public/` 不需要提交 Git。

## 2. 创建 Pages 项目

1. 登录[腾讯云 EdgeOne Pages 控制台](https://console.cloud.tencent.com/edgeone/pages)，按页面提示开通服务，选择创建项目、**导入 Git 仓库**。
2. 连接 GitHub 并按提示授权，选择你的**博客仓库**及 `main` 分支。
3. 在自定义构建设置中核对下表。框架可以选 Hexo；自动填出的值若不同，手动改成这里的值。

| 字段 | 值 |
| --- | --- |
| 根目录 | 仓库根目录 `./` |
| 构建命令 | `npm run build` |
| 输出目录 | `public` |
| 安装命令 | 保持 npm 自动检测 |
| Node.js 版本 | 选择 `24.5.0` 或控制台提供的更新 24.x |

4. 点击创建或部署，等待构建完成。复制控制台给出的**正式访问地址**，打开首页检查。EdgeOne 的[构建指南](https://edgeone.cloud.tencent.com/pages/document/162936788693114880)说明了根目录、构建命令、输出目录和 Node.js 版本的设置位置；[快速开始](https://edgeone.cloud.tencent.com/pages/document/162936669376004096)说明了连接 GitHub 的流程。

如果创建页没有 Node.js 版本选项，先建项目，再到 **项目设置 → Node.js 版本** 选择 24.x 并重新部署。

## 3. 把真实地址写回博客

在博客根目录 `_config.yml` 修改原有的 `url`、`root`：

```yaml
url: https://这里填写控制台显示的正式地址
root: /
```

不要把中文示例地址直接发布。保存后按[通用 Git 更新步骤](/guide/publishing#以后怎么更新网站)提交并推送；EdgeOne 会重新构建。等部署完成，再打开文章、图片和搜索检查。

## 4. 更新和排错

以后修改文章，提交并推送到生产分支，然后在 EdgeOne Pages 项目的部署记录中查看结果。构建失败时先看日志：缺少 `morii` 通常是主题 npm 依赖没有进入博客仓库；`public` 不存在通常是构建命令失败或输出目录填错；本地正常而线上资源 404 时，检查 `url`、`root` 并重新部署。如果控制台选用了太旧的 Node 版本，按项目设置切换到 24.x 后再次部署。

绑定自己的域名时，按控制台给出的 DNS 提示完成设置，再把博客 `_config.yml` 的 `url` 改为新域名并推送。域名生效前先使用平台提供的正式地址验证。

[回到平台选择](/guide/publishing) · [EdgeOne Pages 常见问题](https://edgeone.cloud.tencent.com/pages/document/162936949996421120)
