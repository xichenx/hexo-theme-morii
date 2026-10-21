# 基本信息、头像与 Logo

本页会同时用到两个文件：Hexo 的 `_config.yml` 和主题的 `_config.morii.yml`，都位于**博客根目录**。先看清代码块上方的文件名，再修改。

## 1. 设置站名和作者

在 **`_config.yml`** 中找到并修改原有字段：

```yaml
title: 小林的笔记
subtitle: 记录学习与生活
description: 分享编程实践、阅读心得与生活片段。
author: 小林
language: zh-CN
timezone: Asia/Shanghai
theme: morii
```

| 字段 | 显示位置或作用 | 填写提示 |
| --- | --- | --- |
| `title` | 首页浏览器标签、其他页面标题后缀 | 你的博客名称 |
| `author` | 侧栏个人卡片等作者信息 | 你的昵称 |
| `description` | 侧栏个人卡片简介、页面描述的默认值 | 用一句话说明博客内容 |
| `subtitle` | Hexo 站点副标题字段 | Morii 顶栏小字由下面的 `tagline` 控制 |
| `language` | 页面语言 | 中文用 `zh-CN` |
| `timezone` | 文章日期等时间显示使用的时区 | 中国大陆通常用 `Asia/Shanghai` |
| `theme` | 使用的主题 | 保持 `morii` |

在 **`_config.morii.yml`** 中修改：

```yaml
brand: 小林的笔记
tagline: 把每一天写成一页
intro: 你好，我是小林。这里收藏我的技术笔记和生活灵感。
```

`brand` 是顶部导航、首页签名和页脚的品牌文字；`tagline` 是导航和页脚的小字；`intro` 是首页大标题下的介绍，也会作为关于页部分内容的备用值。

**检查方法：**分别看浏览器标签、顶部导航、首页介绍、右侧作者卡片。如果作者卡片还显示旧简介，检查 `_config.yml` 的 `description`，而不只是 `intro`。

## 2. 设置正式网址

在 **`_config.yml`** 中修改 `url` 和 `root`。下面是地址结构示例，发布时替换为你的真实域名。

| 部署位置 | `url` 示例 | `root` |
| --- | --- | --- |
| 域名根目录 | `https://blog.example.com` | `/` |
| 子目录 | `https://example.com/blog` | `/blog/` |

```yaml
url: https://blog.example.com
root: /
```

`root` 要保留开头和结尾的 `/`。不要在 `url` 中保留 `localhost:4000` 后直接上线。复制文章链接、规范链接等功能会使用站点网址。不同平台填写方式见[平台部署教程](/guide/publishing)。

## 3. 准备图片

在博客的 `source/` 里新建 `images/` 文件夹，放入自己的图片：

```text
source/images/avatar.png    → /images/avatar.png
source/images/logo.png      → /images/logo.png
source/images/favicon.png   → /images/favicon.png
```

建议头像使用方形图片；Logo 使用留白适当的透明 PNG 或 SVG；标签图标使用缩小后仍能辨认的简单图形。文件名尽量用小写英文字母、数字和短横线。

把下面三行加入 **`_config.morii.yml`**，已有字段则修改原行：

```yaml
avatar: /images/avatar.png
logo: /images/logo.png
favicon: /images/favicon.png
```

| 字段 | 控制什么 | 没显示时检查 |
| --- | --- | --- |
| `avatar` | 侧栏头像；关于页未单独设置时也会使用 | 图片是否真实存在，关于页是否有独立头像 |
| `logo` | 顶部导航图标 | 图片四周是否留白过多；路径是否正确 |
| `favicon` | 浏览器标签页图标 | 浏览器缓存；直接打开图片地址 |

这三个字段互相独立。更改 `logo` 不会自动更改头像或 favicon。若三处想用同一张图，可以把三个值都写成同一个路径。

### 使用 Morii 内置 Logo

当前仓库的新 Logo 配置是：

```yaml
logo: /icons/brand/morii-logo-v2.png
favicon: /icons/brand/morii-logo-v2.png
```

**先检查安装目录中有没有 `source/icons/brand/morii-logo-v2.png`。**如果你安装的 npm 版本尚未包含它，先保留该版本默认图标，或把准备好的图片放进博客 `source/images/` 后使用自己的路径。不要仅复制新路径，否则会出现 404。

`logo: ''` 会使用主题默认星形标记；Logo 图片加载失败也会回退为星形。`favicon: ''` 则继续尝试 Hexo 的 `favicon` 设置或 `/favicon.ico`，并不是“完全禁用图标”。

### 在线图片和子目录部署

完整 HTTPS 图片地址也可以填写。站内图片则使用 `/images/avatar.png` 这种路径；本地文件系统路径（如 `C:\\图片\\头像.png`）不能直接填入网页配置。

主题品牌图片会通过 Hexo 的路径助手处理。部署到 `/blog/` 时，配置里仍写 `/images/avatar.png`，生成后应为 `/blog/images/avatar.png`；不要手动再加一次 `/blog`。

## 4. 设置关于页的兴趣区域

```yaml
about:
  show_interests: true
```

该开关只控制关于页的音乐和兴趣展示区域；还需要 `source/_data/about.yml` 中有对应数据。关于页姓名、头像、介绍等可独立配置，见[创建关于页](/features/pages#_2-创建关于页)。没有内容时仅打开开关不会自动生成资料。

## 5. 最后检查

保存后按[配置生效步骤](/config/#_5-保存、生成、检查)重新生成。先直接访问 `http://localhost:4000/images/avatar.png`，确认能看到图片，再查看首页。若图片直接访问也失败，先解决文件路径问题；线上还显示旧 favicon 时用无痕窗口复查。
