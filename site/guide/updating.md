# 更新 Morii 主题

更新主题前，先确认你用的是 **npm 安装**还是 **Git 安装**。判断方法：在博客根目录看 `node_modules/hexo-theme-morii/` 或 `themes/morii/` 哪个存在。更新命令只在**博客根目录**执行。

## 1. 先备份自己的内容

至少备份这些博客文件：

```text
_config.yml
_config.morii.yml
source/_posts/
source/_data/
source/images/
```

如果还用了音视频，也备份 `source/audio/`、`source/videos/`。个人资料应保存在博客目录，不应只放在主题安装目录里。

## 2. 查看更新内容

先读 [Morii 更新日志](https://github.com/xichenx/hexo-theme-morii/blob/main/CHANGELOG.md)。如果更新涉及配置项，再对照新版[默认配置](https://github.com/xichenx/hexo-theme-morii/blob/main/_config.yml)检查自己的 `_config.morii.yml`。

## 3. 执行更新

### npm 安装

在博客根目录运行：

```bash
npm install hexo-theme-morii@latest
npm list hexo-theme-morii
```

### Git 安装

在博客根目录运行：

```bash
cd themes/morii
git pull
cd ../..
```

如果 `git pull` 提示本地文件冲突，先检查你是否直接改过主题源码；**不要直接删除这些改动**。把需要保留的个人配置迁到博客根目录，再处理冲突。

## 4. 重新生成并检查

```bash
hexo clean
hexo generate
hexo server
```

检查首页、文章、你已经启用的相册或音乐等页面。如果本地正常、线上仍是旧版，还需要按你的博客托管方式重新发布；更新本地 npm 包不会自动更新网站。
