---
description: 将现有 Hexo 博客中的 Morii 更新到 1.1.0，保留配置，检查首页和阅读功能。
prev: false
next:
  text: 通用更新流程
  link: /guide/updating
---

# 升级到 Morii v1.1.0

这份指南适用于已经在用 Morii 的博客。首次接入可从[安装教程](/guide/getting-started)开始。

[在线预览](https://xichenx.github.io/hexo-theme-morii/) · [44 秒功能演示](https://github.com/xichenx/hexo-theme-morii/blob/main/docs/media/morii-demo.mp4) · [v1.1.0 更新日志](https://github.com/xichenx/hexo-theme-morii/releases/tag/v1.1.0)

## 1. 备份并确认安装方式

在自己的博客目录备份 `_config.yml`、`_config.morii.yml` 和 `source/`。如果直接改过 `themes/morii/` 里的模板、样式或默认配置，也一起备份。已有的主题配置继续放在博客根目录的 `_config.morii.yml`。

| 博客中的目录 | 更新方式 |
| --- | --- |
| `themes/morii/` | 更新这个目录里的 Git 主题。如果同时安装了 npm 包，Hexo 仍优先使用这个目录。 |
| 只有 `node_modules/hexo-theme-morii/` | 更新博客的 npm 依赖。 |

## 2. 更新主题

在博客根目录选择与自己安装方式对应的一组命令。

::: code-group

```bash [npm 安装]
npm install --save-exact hexo-theme-morii@1.1.0
npm list hexo-theme-morii
```

```bash [Git 安装]
git -C themes/morii status --short --branch
git -C themes/morii fetch origin tag v1.1.0
git -C themes/morii switch --detach v1.1.0
git -C themes/morii describe --tags --exact-match
```

:::

npm 应显示 `hexo-theme-morii@1.1.0`。Git 命令适用于从官方仓库克隆的主题，最后应显示 `v1.1.0`。切换前先保存主题源码中的本地改动；检出标签后，后续升级时再切换到目标版本的标签。

## 3. 按需调整首页

新版推广卡默认占据桌面首页首屏右栏，手机上排在主卡下方。若想让「随手记」和「博客手账」回到首屏，在博客的 `_config.morii.yml` 中合并以下设置：

```yaml
home:
  theme_promo:
    enable: false
```

如果想同时显示推广卡和两张手账卡，将 `enable` 设为 `true`，再同级添加 `journal_below: true`。两张小卡会排在首屏下方。若想让「随便逛逛」只在点击「换一篇」时切换，将 `home.random.autoplay` 设为 `false`。[查看首页配置与更多示例](/config/home)

## 4. 本地验证并发布

```bash
npx hexo morii:check
npx hexo clean
npx hexo generate
npx hexo server
```

1. **首页**。检查主卡、推广卡或手账卡是否符合设置。手机上打开「从这里开始」的入口，确认链接能到对应页面。
2. **文章**。打开一篇有封面、目录或代码的文章，检查顶栏滚动后的可读性、目录位置和已有阅读配置。[文章设置](/config/article)
3. **内页与服务**。检查分类、归档和已启用的音乐馆、相册或评论。分类等内页的标题区在此版本改为紧凑排布。

本地验证通过后，按博客现有的[发布流程](/guide/publishing)重新上线。如果通过 Git 自动部署，npm 安装的博客需提交更新后的 `package.json` 和 `package-lock.json`；以 Git 子模块安装主题的博客需提交更新后的子模块引用。
