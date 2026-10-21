# 常见问题

## 构建时提示找不到 Pug 渲染器

在**博客根目录**安装 `hexo-renderer-pug`，然后重新生成：

```bash
npm install hexo-renderer-pug
npx hexo clean
npx hexo generate
```

## 已设置 `theme: morii`，但页面没有变化

检查修改的是博客根目录 `_config.yml`；确认主题安装在 `node_modules/hexo-theme-morii/` 或 `themes/morii/`。清理 Hexo 缓存并重启本地预览服务。

## 相册、友链或电影院没有自己的内容

检查 YAML 文件是否位于**博客根目录**的 `source/_data/`，文件名是否正确，以及 YAML 缩进是否一致。可对照[演示数据](https://github.com/xichenx/hexo-theme-morii/tree/main/demo/source/_data)。

## 图片或资源返回 404

区分文件系统路径和网站路径：博客 `source/images/avatar.png` 对应网站路径 `/images/avatar.png`。如果博客部署在子目录，还应核对博客根目录 `_config.yml` 中的 `url` 与 `root`。

## 还需要帮助

带上 Hexo 与主题版本、复现步骤和相关构建日志，到 [GitHub Issues](https://github.com/xichenx/hexo-theme-morii/issues) 提问。公开日志前请移除私人信息。
