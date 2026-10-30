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

## 新版默认配置迁移

本节适用于加入初始化向导后的版本；安装前先确认更新日志。已有 `_config.morii.yml` 的显式设置继续生效，主题不会自动删除账号、改写页面或清理旧数据。

| 配置 | 新的默认行为 | 升级时检查 |
| --- | --- | --- |
| `brand`、`tagline`、`intro` | 沿用博客 `title`、`subtitle`、`description` | 需要独立文字时保留覆盖；`tagline: false` / `intro: false` 隐藏对应文字 |
| `hero.title` | 沿用博客标题与副标题 | 原字符串、两项列表、`0:` / `1:` 写法继续支持 |
| `avatar` | 博客 `avatar`，否则内置图片 | 保留自己的头像路径 |
| `menu` | 首页、文章 | 保留现有完整菜单；新页面可用向导生成 |
| `featured`、`explore`、`social` | 空列表 | 保留自己的卡片与链接 |
| 评论、时钟、电影、Meting | 默认关闭 | 原先只填写地址或 ID、依赖默认开启的配置，补上对应 `enable: true` |
| GitHub 日历 | 未设置用户时关闭 | 配置自己的 `user` 并显式设置 `enable: true`；旧 `githubcalendar` 兼容入口保留 |
| 朋友圈接口、备案、运行时间 | 不预填作者资料；备案与运行时间默认关闭 | 填自己的值并显式开启需要的模块 |
| `clock` 坐标 | 不预填城市与坐标 | 仅 `enable: true` 显示站点时区的时钟；完整经纬度才请求天气 |

如果曾整份复制旧版 `_config.yml` 到个人覆盖文件，里面的示例账号仍会保留。请自行检查并删除不需要的示例；新版默认值不会清空你的显式配置。

先备份、更新主题，手动检查自己的配置即可。需要查看向导的补页建议时，可选运行下面第一条命令；第二条用于检查配置：

```bash
npx hexo morii:init --pages about,categories,tags --dry-run
npx hexo morii:check
```

需要补页时去掉 `--dry-run`。已有配置会另存为建议文件，合并需要的字段后删除建议文件即可；不要将建议文件直接覆盖到原配置。最后重新生成并检查已有页面和服务。
