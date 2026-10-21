# 音乐馆与电影院

## 音乐馆

音乐馆地址为 `/music/`。如需使用歌单，在博客根目录 `_config.morii.yml` 中配置自己的 Meting 信息，例如：

```yaml
music:
  meting:
    enable: true
    server: netease
    type: playlist
    id: '你的歌单 ID'
```

完整的播放器选项包括 `music.tracks`（备用曲目）和 `music.embed_url`（嵌入地址），见[主题默认配置](https://github.com/xichenx/hexo-theme-morii/blob/main/_config.yml)。在线播放依赖歌单服务及音源可用性，请在发布后用浏览器实际试听。

## 电影院

电影院地址为 `/cinema/`。在博客根目录创建 `source/_data/cinema.yml`，参考[演示片单](https://github.com/xichenx/hexo-theme-morii/blob/main/demo/source/_data/cinema.yml)填写电影、剧集或动漫。自有视频文件可放在博客 `source/videos/`，片单中使用 `/videos/文件名.mp4` 这样的路径。

如果暂时不用电影院，在 `_config.morii.yml` 中设置 `cinema.enable: false`，并从 `explore` 中移除电影院入口。
