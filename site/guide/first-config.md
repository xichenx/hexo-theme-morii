# 首次配置：把示例站变成自己的博客

安装完成后，先别急着上线。Morii 的默认配置带有作者的头像、账号、城市、备案和音乐歌单等**演示值**。本页会教你把个人设置放在博客里，并先关闭尚未配置的功能。

## 先认识三个位置

| 位置 | 你应该做什么 |
| --- | --- |
| 博客根目录 `_config.yml` | 设置博客标题、作者、网址、语言和 `theme: morii` |
| 博客根目录 `_config.morii.yml` | 设置 Morii 的外观、头像、菜单和功能开关；**推荐修改这里** |
| `node_modules/hexo-theme-morii/` 或 `themes/morii/` | 主题安装目录；更新时可能被替换，初学者不要在这里保存个人资料 |

`_config.morii.yml` 是一个**新文件**。文件名以英文下划线开头，扩展名是 `.yml`，不要保存成 `_config.morii.yml.txt`。Windows 用户如果看不到扩展名，先在文件管理器中打开“显示文件扩展名”。

## 1. 填写博客基本信息

打开博客根目录的 `_config.yml`，找到相应配置并修改**原有的行**：

```yaml
title: 我的博客
subtitle: 记录学习与生活
description: 我的个人博客
author: 我的名字
language: zh-CN
timezone: Asia/Shanghai
theme: morii
```

这里不用替换整个 `_config.yml`；它还有许多 Hexo 自带设置。`title` 是浏览器标签和首页的站名，`author` 是文章作者。`url` 先保持当前值，**正式上线前**再按[发布博客](/guide/publishing)填写真实地址。

## 2. 创建个人主题配置

在博客根目录新建 `_config.morii.yml`，先复制以下**完整起步配置**：

```yaml
brand: 我的博客
tagline: 欢迎来到我的小站
intro: 这里记录我的学习与生活。
avatar: /icons/brand/morii-icon.png

hero:
  title:
    0: 你好，欢迎来坐坐。
    1: 这是我的新博客。
  note: 从第一篇文章开始，慢慢把这里填满。

social: false
featured: false
menu: false
explore: false

home:
  selected_posts: false
github_calendar:
  enable: false
clock:
  enable: false
quick_navigation:
  enable: false
reading_list:
  enable: false
sidebar:
  announcement:
    enable: false
friends_feed:
  endpoint: ''
music:
  playlist_url: ''
  meting:
    enable: false
cinema:
  enable: false
comments:
  enable: false
footer:
  runtime:
    enable: false
  filing:
    enable: false
```

这份配置先隐藏作者的社交链接、首页推荐卡片、菜单、探索链接和公告，并关闭未填好的第三方服务与个人信息。`avatar` 暂时使用主题内置图标，因此不会出现作者的头像。首页仍有一些固定的“关于我”“即刻”等入口；按[创建常用页面](/features/pages)补齐后就能打开。

::: warning 为什么这里写 `false`，而不是 `[]`？
当前发布的 Morii 版本在合并博客配置与主题默认配置时，空列表 `[]` **不会清除**默认列表。写 `social: []` 仍可能显示主题作者的社交链接；短于默认长度的 `menu` 列表也可能留下多余菜单项。`hero.title` 同样不能用 `[第一行, 第二行]` 覆盖，所以示例用 `0:`、`1:` 指定两行文字。照抄即可。上面的写法已按当前版本实测。准备开启菜单和社交链接时，请照[外观与导航](/features/customization)和[搜索、社交与评论](/features/interaction)的完整示例操作。
:::

::: warning YAML 缩进很重要
使用**空格**缩进，不要用 Tab。冒号后面留一个空格，例如 `enable: false`。同一个文件中不要重复写两个 `music:` 或两个 `footer:`；需要新增设置时，把它放进已有分组。
:::

## 3. 换自己的头像和图标

在博客根目录创建 `source/images/` 文件夹，把头像文件命名为 `avatar.png` 放进去：

```text
my-blog/source/images/avatar.png
```

然后把 `_config.morii.yml` 中的头像改为：

```yaml
avatar: /images/avatar.png
```

文件系统中的 `source/images/avatar.png` 会变成网站中的 `/images/avatar.png`。**网站路径不写 `source`**。如果还没有自己的图片，保留主题内置图标即可。顶部 Logo 和浏览器 favicon 也可用 `logo`、`favicon` 设置，详细步骤见[基本信息、头像与 Logo](/config/basic)。

## 4. 重新生成并核对

在博客根目录运行：

```bash
hexo clean
hexo generate
hexo server
```

打开本地博客，检查站名、首页介绍、头像和页脚。此时顶部菜单应为空；确认没有出现主题作者账号、备案号、歌单或评论入口。如果仍显示旧内容，停止预览服务后重新启动，并检查文件是否确实叫 `_config.morii.yml`。

**下一步：**写[第一篇文章](/guide/first-post)。需要逐项调整主题时，进入[配置手册](/config/)，按基本信息、首页、阅读、侧栏和外部服务查找；里面还有可下载的带注释配置模板。
