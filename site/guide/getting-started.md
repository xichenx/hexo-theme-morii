# 安装 Morii

本页从一个**已经可以运行的 Hexo 8 博客**开始。如果还没有博客，先按 [Hexo 官方指南](https://hexo.io/zh-cn/docs/)创建站点。Morii 要求 Node.js 20.19.0 或更高版本，主题模板还需要 `hexo-renderer-pug`。

## 1. 安装主题

在**博客根目录**运行：

```bash
npm install hexo-theme-morii@latest hexo-renderer-pug
```

如果需要直接使用 Git 仓库，也可以在博客根目录运行：

```bash
git clone https://github.com/xichenx/hexo-theme-morii.git themes/morii
npm install hexo-renderer-pug
```

两种方式任选一种。npm 安装的主题位于 `node_modules/hexo-theme-morii/`；Git 安装的主题位于 `themes/morii/`。

## 2. 启用主题

编辑**博客根目录**的 `_config.yml`，把 `theme` 改为：

```yaml
theme: morii
```

## 3. 本地预览

```bash
npx hexo clean
npx hexo generate
npx hexo server
```

打开终端显示的本地地址。能看到 Morii 首页和你的文章，就说明主题已启用。

::: tip 配置放在哪里？
建议在博客根目录创建 `_config.morii.yml`，写入自己的主题设置。这样更新主题安装包时，个人配置不会被覆盖。下一步请看[首次配置](/guide/first-config)。
:::

如果页面空白或构建失败，先查看[常见问题](/troubleshooting)。
