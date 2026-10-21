# 相册与友链

## 相册

在博客根目录创建 `source/_data/album.yml`。从[演示相册数据](https://github.com/xichenx/hexo-theme-morii/blob/main/demo/source/_data/album.yml)复制字段结构，再替换为自己的相册名称、封面和照片。相册详情使用 `path_name` 匹配页面路径，写错时详情页可能找不到内容。

相册图片可以使用公开的 HTTPS 地址；使用博客本地图片时，把文件放在博客 `source/` 下，再在数据中填写对应的网站路径。

## 友链

在博客根目录创建 `source/_data/link.yml`。参考[演示友链数据](https://github.com/xichenx/hexo-theme-morii/blob/main/demo/source/_data/link.yml)填写分组、站名、地址、头像等信息。`siteshot`、`tag` 和 `recommend` 可用于展示截图、标签和推荐标记。

写完后重新构建，打开 `/album/` 和 `/link/` 检查图片与链接。若页面内容没更新，先确认修改的是**博客**的 `source/_data/`，再执行 `npx hexo clean && npx hexo generate`。
