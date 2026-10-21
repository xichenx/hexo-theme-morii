# 音乐馆与电影院

这两个功能可以晚些再开启。先完成文章、页面和个人资料，再准备**自己有权使用**的音视频文件或可公开播放的地址。文件较大时，博客托管平台可能有限制；先用一个小文件验证流程。

## 音乐馆：先建页面

在博客根目录运行 `hexo new page music`，把 `source/music/index.md` 改为：

```yaml
---
title: 音乐馆
type: music
comments: false
---
```

最容易验证的方式是准备一首自己的音频，放在博客 `source/audio/song.mp3`，再修改 `_config.morii.yml` 中**已有的** `music` 分组：

```yaml
music:
  title: 我的音乐
  playlist_url: ''
  meting:
    enable: false
  tracks:
    - title: 第一首歌
      artist: 我的名字
      url: /audio/song.mp3
```

保存后先打开 `/audio/song.mp3` 确认资源存在，再访问 `/music/`。如果没有点击播放，浏览器不会保证自动发声。

### 音乐配置字段

| 字段（位于 `music` 下） | 作用 | 示例 / 默认值 |
| --- | --- | --- |
| `title` | 音乐馆标题 | `我的音乐收藏` |
| `description` | 音乐馆介绍 | 一句自己的介绍 |
| `volume` | 初始音量，范围 0–1 | 默认 `0.7`，不是 `70` |
| `playlist_url` | 跳转原平台歌单的链接 | 无歌单时用 `''` 清空默认地址 |
| `playlist_label` | 原平台歌单按钮文字 | 如 `打开我的歌单` |
| `embed_url` | HTTPS 嵌入播放器地址 | 默认 `''`；须为允许嵌入的播放器地址 |
| `meting.enable` | 是否获取在线歌单 | 自有音频方案设 `false` |
| `meting.server` | 歌单来源代号 | 如 `netease`、`tencent`，取决于接口支持 |
| `meting.type` | 请求的资源类型 | 歌单通常为 `playlist` |
| `meting.id` | 歌单编号 | 带引号的字符串，不是整条分享链接 |
| `meting.api` | 歌单接口模板 | 需要兼容 Meting 的接口 |
| `tracks` | 自有音频列表 | 每项至少有有效 `url` |

`playlist_url` 只是跳转按钮，不会自动把那个网页里的歌曲解析进播放器。

### 添加封面和歌词

给已有 `tracks` 列表中的歌曲补充字段，例如：

```yaml
music:
  meting:
    enable: false
  playlist_url: ''
  volume: 0.5
  tracks:
    - title: 我的第一首歌
      artist: 我的名字
      url: /audio/song.mp3
      cover: /images/music/cover.jpg
      lrc: /audio/song.lrc
```

准备好 `source/images/music/cover.jpg` 和 `source/audio/song.lrc`。`cover` 与 `lrc` 都可省略。歌词也可以写成 `lyrics: |` 多行文本；同一首歌优先选择一种歌词来源。时间轴歌词的形式如下，时间要与自己的音频对应：

```text
[00:00.00]第一句歌词
[00:12.50]第二句歌词
```

外部音频、封面或歌词的可用性由资源服务器决定。歌词请求还需要服务器允许跨域读取；直接打开资源能下载，并不能保证浏览器跨域请求也成功。

### 改用在线歌单

把已有 `music` 分组中的相关字段改为下面的结构。`替换为你的歌单编号` 必须替换：

```yaml
music:
  title: 我的在线歌单
  playlist_url: ''
  volume: 0.7
  meting:
    enable: true
    server: netease
    type: playlist
    id: '替换为你的歌单编号'
    api: 'https://api.injahow.cn/meting/?server=:server&type=:type&id=:id&r=:r'
  tracks: []
```

接口模板中的 `:server`、`:type`、`:id`、`:r` 由主题替换。上面使用当前主题默认接口，第三方接口是否可用需实际验证；主题不会替你部署歌单服务。在线歌曲能否播放也取决于音源和浏览器环境。

接口成功返回歌曲后，在线列表会替换播放器中的本地列表；接口失败时可以使用已配置的本地曲目。若需要本地备用曲目，把它们放进 `tracks`。主题默认 `tracks` 为空；如果你自己的旧列表已有内容，需在同一个配置文件里替换或删除旧条目，不能再追加一个同名 `music:`。

## 电影院：主题会自动生成页面

电影院**不需要** `source/cinema/index.md`。在 `_config.morii.yml` 中找到已有的 `cinema` 分组，把 `enable` 设为 `true`：

```yaml
cinema:
  enable: true
  title: 我的电影院
```

把自己的短视频放在博客 `source/videos/clip.mp4`，再创建 `source/_data/cinema.yml`：

```yaml
- title: 我的短片
  type: movie
  description: 第一段放进博客的视频。
  url: /videos/clip.mp4
```

`type` 可填 `movie`（电影）、`series`（剧集）或 `anime`（动漫）。如果暂时没有视频，保持 `cinema.enable: false`，不要在导航里添加 `/cinema/`。

### 片单字段

| 字段 | 作用 | 注意 |
| --- | --- | --- |
| `title` | 作品标题 | 必填；没有标题的条目会被忽略 |
| `type` | 作品分类 | `movie`、`series`、`anime` |
| `year` | 年份文字 | 建议写成 `'2026'` |
| `description` | 简介 | 可选 |
| `cover` | 封面图片 | 站内路径或 HTTPS 地址 |
| `url` | 单个视频直链 | 站内路径或 HTTPS 地址，不是视频网站详情页 |
| `embed` | 单个嵌入播放器地址 | 仅支持主题允许的播放器形式 |
| `episodes` | 分集列表 | 每集包含 `title` 和 `url` 或 `embed` |

`source/_data/cinema.yml` 中的片单优先于 `_config.morii.yml` 的 `cinema.items`。选择数据文件更容易维护；不要两处都填后期待它们自动合并。数据文件是空列表时，也会优先使用这个空列表。

### 添加一部多集作品

在同一个 `source/_data/cinema.yml` 列表里追加：

```yaml
- title: 我的旅行日记
  type: series
  year: '2026'
  description: 两段旅行记录。
  cover: /images/travel-cover.jpg
  episodes:
    - title: 第一集：出发
      url: /videos/travel-01.mp4
    - title: 第二集：到达
      url: /videos/travel-02.mp4
```

有 `episodes` 时，主题从分集列表读取播放源；不要同时依赖外层 `url`。空 `episodes: []` 仅展示作品，没有可播放分集。

### 使用嵌入播放器

当前代码只接受以下 HTTPS 嵌入地址形式：YouTube 的 `/embed/视频ID`（`www.youtube.com` 或 `www.youtube-nocookie.com`）、Bilibili 的 `player.bilibili.com/player.html`、Vimeo 的 `player.vimeo.com/video/数字ID`。

把平台提供的嵌入代码中 `src` 的完整地址填入 `embed`，不要把整段 `<iframe>` 代码粘进去。普通视频分享页不是嵌入地址；不符合允许形式的地址会被忽略。填写了有效 `embed` 时会优先使用它，而不是同项的 `url`。

## 检查结果

重新生成并预览博客，打开 `/music/` 和 `/cinema/`。先在浏览器地址栏单独打开 `/audio/song.mp3` 或 `/videos/clip.mp4`，确认文件不是 404，再在页面中点播放。如果文件能下载却不能播放，检查浏览器是否支持对应的音视频编码。

| 现象 | 优先检查 |
| --- | --- |
| `/music/` 是 404 | 是否创建了音乐页面并写 `type: music` |
| `/cinema/` 是 404 | `cinema.enable` 是否开启，是否重新生成 |
| 在线歌单为空 | 歌单编号、来源、接口响应及跨域请求 |
| 片单存在但不能播放 | 作品 / 分集是否有有效播放地址，是否填成分享网页 |
| 封面或歌词不显示 | 文件路径、大小写和资源服务器是否允许访问 |
| 改了 `cinema.items` 没效果 | 是否存在优先级更高的 `source/_data/cinema.yml` |
