# 常见问题：按现象一步步排查

先确认你在**自己的博客根目录**，而不是主题仓库。博客根目录应包含 `_config.yml`、`package.json` 和 `source/`。大部分问题可先按顺序尝试：停止预览服务（Ctrl+C）→ `hexo clean` → `hexo generate` → `hexo server`。

## 输入 `node` 或 `npm` 提示找不到命令

Node.js 尚未安装好，或安装后终端没有重新打开。先按[从零安装](/guide/getting-started)安装 Node.js，再运行 `node --version` 和 `npm --version`。版本命令正常后再装 Hexo。

## 输入 `hexo` 提示找不到命令

说明全局 CLI 没有安装好，或终端还没刷新。运行 `npm install -g hexo-cli`，关闭并重新打开终端，再试 `hexo version`。如果命令能运行，但提示博客项目缺少 Hexo，请回到博客根目录执行 `npm install`，并检查 `package.json` 中是否有 `hexo` 依赖。

## 安装后还是原来的主题

打开**博客根目录**的 `_config.yml`，确认只有一条 `theme: morii`；确认 `node_modules/hexo-theme-morii/` 或 `themes/morii/` 实际存在。重新生成并重启预览。如果同时使用 npm 和 Git 安装，先选定一种方式，避免改错主题目录。

## 构建时提示 Pug 或 `pug` 渲染器缺失

在博客根目录运行：

```bash
npm install hexo-renderer-pug
hexo clean
hexo generate
```

## 修改了 `_config.morii.yml`，页面没有变化

检查文件名是否完整、是否误存成 `.txt`、是否放在**博客根目录**。再检查 YAML 缩进和重复字段。不要在同一文件写两个 `menu:`、两个 `appearance:` 或两个 `music:`。最后清理缓存、重新生成并重启预览服务。

## 仍然显示主题作者的社交链接或首页标题

当前 npm 版本会把列表和主题默认配置合并，`social: []` 不能清空默认社交入口。请照[首次配置](/guide/first-config)改成 `social: false`；需要自己的社交入口时，按[社交链接示例](/features/interaction#添加自己的社交入口)写完整列表。首页标题也请使用 `hero.title` 下的 `0:`、`1:` 两行格式，普通的 `[第一行, 第二行]` 不会替换默认两行。

## 菜单多出自己没有填写的项目

这是当前版本的列表合并行为。新站先用 `menu: false` 隐藏顶部菜单；准备好常用页面后，按[外观与导航](/features/customization#修改顶部菜单)写满七个菜单位置。仅写两三个项目，不会删除剩余的默认项目。

## 导航有“相册”或“关于”，点开却是 404

导航项只是链接，不会创建页面。检查对应的 `source/album/index.md`、`source/about/index.md` 是否存在，文件开头是否写了 `type: album` 或 `type: about`。按[页面创建教程](/features/pages)补齐，然后重新生成。

## 相册列表有了，点进详情却是 404

除了 `source/_data/album.yml`，还需要详情页。例如数据里 `path_name: /album/travel/`，就要有 `source/album/travel/index.md`，并设置 `type: album_detail`。路径拼写须一致，参考[相册教程](/features/album-links)。

## 友链或即刻页面是空的

检查数据文件是否在**博客根目录**的 `source/_data/`，文件名分别为 `link.yml`、`essay.yml`。确认 YAML 列表前有 `-`，缩进使用空格。Hexo 会把 `source/_data/` 的 YAML 作为数据加载，而不是当成普通网页文件。[Hexo 数据文件说明](https://hexo.io/zh-cn/docs/data-files.html)

## 图片不显示、音视频是 404

先找到电脑上的文件。例如 `source/images/avatar.png` 在网页里应访问 `/images/avatar.png`，**URL 中不写 `source`**。确认文件名、扩展名和大小写完全一致。直接在浏览器地址栏打开该 URL；如果仍是 404，重新生成博客并检查文件是否真的在博客的 `source/` 下。

## 本地正常，线上样式或链接异常

先查看博客根目录 `_config.yml` 的 `url` 和 `root`。部署在域名根路径时通常是 `root: /`；部署在 `用户名.github.io/仓库名/` 之类子目录时，需要按平台说明设置子路径。重新生成并重新发布。注意 **Morii 文档站上线**不等于**你的博客上线**。

## Cloudflare 构建失败或推送后没有更新

先到 Cloudflare 项目的“部署”页面打开最新一次构建日志。检查连接的是**自己的博客仓库**，生产分支是否为 `main`，构建命令是否为 `npm run build`，输出目录是否为 `public`，环境变量 `NODE_VERSION` 是否为 `24`。博客的 `package.json` 应有 `"build": "hexo generate"` 脚本；GitHub 仓库里应有 `package.json`、`package-lock.json`、`_config.yml`、`_config.morii.yml` 和 `source/`。如果日志提示找不到 `morii`，检查主题是否作为 npm 依赖写入 `package.json`；若安装在 `themes/morii/`，还需正确处理 Git 子模块。完整流程见[发布博客](/guide/publishing)。

## 评论或在线音乐无法使用

这些功能依赖外部服务。先检查 `_config.morii.yml` 中是否填了**自己的**服务地址，而不是作者示例。评论需有可用的 Twikoo 后端；在线歌单需接口和音源可访问。先在浏览器中验证外部服务，再看[搜索、社交与评论](/features/interaction)和[音乐馆](/features/media)。

## 仍然无法解决

在 [GitHub Issues](https://github.com/xichenx/hexo-theme-morii/issues) 描述：Hexo 与 Morii 版本、运行的命令、终端报错、出问题的页面路径、你已经尝试的步骤。公开日志前先删除密码、Token 和私人信息。
