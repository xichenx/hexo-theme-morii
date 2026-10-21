# 创建分类、关于和即刻等页面

文章能显示后，可以逐步添加其他页面。**数据文件和页面文件是两件事**：`source/_data/album.yml` 提供相册内容，`source/album/index.md` 才让 `/album/` 页面存在。只建立其中一个，页面就可能是 404 或没有内容。

## 哪些页面需要自己创建？

以下路径都相对于**你的博客根目录**：

| 想要的页面 | 页面文件 | `type` | 还需要的数据 |
| --- | --- | --- | --- |
| 分类总览 `/categories/` | `source/categories/index.md` | `categories` | 文章的 `categories` |
| 标签总览 `/tags/` | `source/tags/index.md` | `tags` | 文章的 `tags` |
| 关于 `/about/` | `source/about/index.md` | `about` | 可选 `source/_data/about.yml` |
| 即刻 `/essay/` | `source/essay/index.md` | `essay` | `source/_data/essay.yml` |
| 相册 `/album/` | `source/album/index.md` | `album` | `source/_data/album.yml` |
| 友链 `/link/` | `source/link/index.md` | `link` | `source/_data/link.yml` |
| 音乐馆 `/music/` | `source/music/index.md` | `music` | 主题配置中的 `music` |
| 朋友圈 `/fcircle/` | `source/fcircle/index.md` | `fcircle` | 自己可用的朋友圈接口 |

`/archives/` 由 Hexo 的归档生成器提供；`/cinema/` 在 `cinema.enable: true` 时由主题生成；`/reading-list/` 在 `reading_list.enable: true` 时由主题生成。它们不需要同名 `index.md`。电影院仍需要自己的片单数据。不要把主题**文档站**的 `site/` 当成你博客的 `source/`。

## 1. 先做分类和标签

在博客根目录运行：

```bash
hexo new page categories
hexo new page tags
```

打开 `source/categories/index.md`，把文件内容改为：

```yaml
---
title: 分类
type: categories
comments: false
---
```

打开 `source/tags/index.md`，写入：

```yaml
---
title: 标签
type: tags
comments: false
---
```

有文章使用了 `categories` 或 `tags` 后，这两页才会列出对应内容。`type` 是 Morii 选择页面样式的关键；写成别的单词会变成普通页面。

## 2. 创建关于页

在博客根目录运行 `hexo new page about`，把 `source/about/index.md` 改为：

```yaml
---
title: 关于我
type: about
comments: false
---
```

即使没有数据文件，关于页也能使用博客作者、简介和主题头像。想写更多资料，再创建博客根目录的 `source/_data/about.yml`：

```yaml
name: 我的名字
description: 我在这里记录学习与生活。
subtitle: 很高兴认识你。
avatarImg: /images/avatar.png
```

如果没有准备头像文件，请删除 `avatarImg` 这一行，页面会沿用 `_config.morii.yml` 里的 `avatar`。

### 进一步填写技能、经历与兴趣

下面的字段可以继续添加到**同一个** `source/_data/about.yml` 中。这是数据文件，不要放到 `_config.morii.yml`：

```yaml
maxim:
  maxim_top: 保持好奇，
  maxim_bottom: 慢慢积累。
avatarSkills:
  left:
    - JavaScript
    - 写作
  right:
    - 摄影
    - 阅读
careers:
  list:
    - desc: 2026：开始记录自己的学习过程
music:
  music_title: 喜欢安静的纯音乐
like:
  like_title: 阅读与旅行
  like_bottom: 从书本和路上寻找新的灵感。
```

| 字段 | 展示内容 |
| --- | --- |
| `name`、`description` | 姓名与介绍，未填时使用站点备用资料 |
| `avatarImg` | 关于页单独使用的头像 |
| `subtitle` | 关于页补充介绍 |
| `maxim.maxim_top` / `maxim_bottom` | 两段拼接为一句格言 |
| `avatarSkills.left` / `right` | 合并展示的技能文字列表 |
| `careers.list[].desc` | 经历说明列表 |
| `music.music_title` | 音乐偏好文字，不是播放器歌单配置 |
| `like.like_title` / `like_bottom` | 兴趣标题与说明 |

兴趣与音乐偏好区域还受主题配置 `about.show_interests` 控制。想隐藏它，在 `_config.morii.yml` 中设置：

```yaml
about:
  show_interests: false
```

`source/about/index.md` 在 Front Matter 后也可以继续写 Markdown 正文，适合补充较长的个人介绍。

## 3. 创建即刻页

运行 `hexo new page essay`，把 `source/essay/index.md` 改为：

```yaml
---
title: 即刻
type: essay
comments: false
---
```

再创建 `source/_data/essay.yml`：

```yaml
- title: 随手记
  home_essay: true
  essay_list:
    - content: 博客搭好了，记下这一刻。
      date: '2026-10-21'
```

`home_essay: true` 会让该组短文也能出现在首页即刻速览。日期请改成你发布短文的实际日期。

## 4. 重新生成并检查页面

运行 `hexo clean`、`hexo generate`，然后重启 `hexo server`。先**直接访问** `/categories/`、`/tags/`、`/about/`、`/essay/`，确认不再是 404。首页固定的“关于我”“看看即刻”和侧栏入口此时也应能打开。接着按[相册与友链](/features/album-links)建立其余页面，再按[外观与导航](/features/customization)开启顶部菜单。
