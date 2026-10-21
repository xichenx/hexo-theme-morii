# 更新主题

更新之前，先备份博客根目录的 `_config.morii.yml` 和 `source/_data/`。这些文件保存你的个人配置与页面数据。

## npm 安装

在博客根目录运行：

```bash
npm install hexo-theme-morii@latest
npx hexo clean
npx hexo generate
```

## Git 安装

在 `themes/morii/` 中拉取所需版本，或重新克隆到该目录。更新前若曾直接改动主题目录，先把个人改动迁移到博客根目录的 `_config.morii.yml` 和 `source/`，避免被覆盖。

## 核对配置变化

查看[更新日志](https://github.com/xichenx/hexo-theme-morii/blob/main/CHANGELOG.md)和新版[默认配置](https://github.com/xichenx/hexo-theme-morii/blob/main/_config.yml)，特别留意新增、改名或弃用的设置。更新后重新构建，并检查首页、文章和已启用的功能页。
