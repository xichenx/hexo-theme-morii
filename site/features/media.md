# 音乐馆与电影院

这两个功能可以晚些再开启。先完成文章、页面和个人资料，再准备**自己有权使用**的音视频文件或可公开播放的地址。文件较大时，博客托管平台可能有限制；先用一个小文件验证流程。

## 音乐馆：先建页面

在博客根目录运行 `npx hexo new page music`，把 `source/music/index.md` 改为：

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

如果选择在线歌单，把 `meting.enable` 设为 `true`，填写 `server`、`type`、`id`，并按需要配置可用的 `api`。例如 `server: netease` 对应网易云音乐，`server: tencent` 对应 QQ 音乐。在线歌曲能否播放取决于歌单接口、音源和浏览器环境；先在浏览器里实际点播验证。完整字段见[主题默认配置](https://github.com/xichenx/hexo-theme-morii/blob/main/_config.yml)。

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

`type` 可填 `movie`（电影）、`series`（剧集）或 `anime`（动漫）。多集内容使用 `episodes` 列表，格式见[示例片单](https://github.com/xichenx/hexo-theme-morii/blob/main/demo/source/_data/cinema.yml)。如果暂时没有视频，保持 `cinema.enable: false`，不要在导航里添加 `/cinema/`。

## 检查结果

重新生成并预览博客，打开 `/music/` 和 `/cinema/`。先在浏览器地址栏单独打开 `/audio/song.mp3` 或 `/videos/clip.mp4`，确认文件不是 404，再在页面中点播放。如果文件能下载却不能播放，检查浏览器是否支持对应的音视频编码。
