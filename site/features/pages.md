# 页面与数据文件

Morii 提供关于、相册、友链、即刻、音乐馆和电影院等页面。先完成[首次配置](/guide/first-config)，再根据需要添加数据。

| 页面 | 个人数据位置 |
| --- | --- |
| 关于 | 博客根目录 `source/_data/about.yml` |
| 相册 | 博客根目录 `source/_data/album.yml` |
| 友链 | 博客根目录 `source/_data/link.yml` |
| 即刻 | 博客根目录 `source/_data/essay.yml` |
| 电影院 | 博客根目录 `source/_data/cinema.yml`，也可用主题配置中的 `cinema.items` |

可参考仓库的[演示站数据](https://github.com/xichenx/hexo-theme-morii/tree/main/demo/source/_data)了解字段格式。演示内容只用于展示，请替换为自己的资料。

添加数据后执行：

```bash
npx hexo clean
npx hexo generate
```

随后在本地预览中打开相应页面，确认文字、图片和链接正确。导航入口由 `_config.morii.yml` 中的 `menu` 和 `explore` 配置；关闭某个功能时，也检查是否需要移除对应入口。
