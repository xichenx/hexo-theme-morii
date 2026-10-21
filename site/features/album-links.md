# 相册与友链：从空页面到有内容

本页继续使用[页面文件与数据文件](/features/pages)的做法。以下所有路径都在**你的博客根目录**下；先准备图片，再复制相应 YAML。

## 创建相册列表页

运行 `hexo new page album`，把 `source/album/index.md` 改为：

```yaml
---
title: 相册
type: album
comments: false
---
```

## 添加第一本相册

把自己的照片放在 `source/images/travel/`，例如 `source/images/travel/photo-1.jpg`。创建 `source/_data/album.yml`：

```yaml
- class_name: 旅行记录
  path_name: /album/travel/
  description: 一些路上的照片。
  cover: /images/travel/photo-1.jpg
  album_list:
    - image: /images/travel/photo-1.jpg
      content: 旅途中的第一张照片
      date: '2026-10-21'
```

接着在博客的 `source/album/travel/` 下新建 `index.md`，内容为：

```yaml
---
title: 旅行记录
type: album_detail
comments: false
---
```

这里的文件位置生成 `/album/travel/`，必须与数据中的 `path_name` **完全对应**。以后再加一本相册，就再添加一组 YAML 数据和一个对应的详情页。`image` 也可以是图片路径列表；先用一张图确认整个流程成功。[字段示例](https://github.com/xichenx/hexo-theme-morii/blob/main/demo/source/_data/album.yml)

## 创建友链页

运行 `hexo new page link`，把 `source/link/index.md` 改为：

```yaml
---
title: 友链
type: link
comments: false
---
```

创建 `source/_data/link.yml`，先用一个真实网站验证布局：

```yaml
- class_name: 常逛的网站
  class_desc: 从这里去看看别人的作品。
  link_list:
    - name: Hexo
      link: https://hexo.io/
      descr: Hexo 官方网站
```

确认能显示后，再换成你实际交换的友链。可选字段包括 `avatar`（头像 URL 或站内图片）、`siteshot`（站点截图）、`tag`（标签）和 `recommend: true`（推荐标记）。友链地址要以 `https://` 或 `http://` 开头。[字段示例](https://github.com/xichenx/hexo-theme-morii/blob/main/demo/source/_data/link.yml)

## 生成并检查

在博客根目录运行 `hexo clean`、`hexo generate`，重新启动预览。分别打开 `/album/`、`/album/travel/` 和 `/link/`：相册卡片应能点进详情，照片应能加载，友链应能打开。确认后，再按[外观与导航](/features/customization)把首次配置中的 `menu: false` 改成完整菜单。

::: tip 图片路径怎么写？
文件 `source/images/travel/photo-1.jpg` 对应网页地址 `/images/travel/photo-1.jpg`。如果图片是网上的完整 HTTPS 链接，也可以直接填 URL。显示不出来时，先在浏览器地址栏单独打开图片地址。
:::
