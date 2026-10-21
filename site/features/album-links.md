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

### 相册字段对照

| 字段 | 作用 |
| --- | --- |
| `class_name` | 相册名称 |
| `path_name` | 相册详情页路径，要与实际创建的页面一致 |
| `description` | 相册说明 |
| `cover` | 相册封面，不填时尝试使用第一张照片 |
| `album_list[].image` | 一张图片的路径，或多张图片路径列表 |
| `album_list[].content` | 照片说明 |
| `album_list[].date` | 拍摄 / 记录日期，建议加引号 |
| `album_list[].address` | 地点文字 |
| `album_list[].from` | 作者或来源文字 |

例如要给第一张照片加地点，在 `image`、`content` 同一缩进层级加入 `address: 杭州`。这里的 `[]` 表示列表中的每一项，**不是实际要写进 YAML 的字段名**。

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

### 完整友链条目示例

以下是一个完整分组，可替换已有示例。网址、昵称和图片都要换成你自己的资料；没有的可选图片字段直接删去：

```yaml
- class_name: 博客朋友
  class_desc: 一起分享与成长。
  link_list:
    - name: 朋友的小站
      link: https://example.com/
      descr: 记录技术与生活
      avatar: /images/friends/friend-avatar.png
      siteshot: /images/friends/friend-site.jpg
      tag: 技术
      recommend: true
```

`class_name` 和 `class_desc` 控制分组标题与介绍；`link_list` 中每个 `- name` 开始一张友链卡片。`recommend` 是布尔值，不要写成字符串 `'true'`。缺少有效网址的条目会被忽略。

## 生成并检查

在博客根目录运行 `hexo clean`、`hexo generate`，重新启动预览。分别打开 `/album/`、`/album/travel/` 和 `/link/`：相册卡片应能点进详情，照片应能加载，友链应能打开。确认后，再按[外观与导航](/features/customization)把首次配置中的 `menu: false` 改成完整菜单。

::: tip 图片路径怎么写？
文件 `source/images/travel/photo-1.jpg` 对应网页地址 `/images/travel/photo-1.jpg`。如果图片是网上的完整 HTTPS 链接，也可以直接填 URL。显示不出来时，先在浏览器地址栏单独打开图片地址。
:::

## 朋友圈：显示朋友们的新文章

友链页展示固定的网站列表；朋友圈需要一个能提供文章数据的接口。只有 `source/_data/link.yml` 不会自动抓取朋友的新文章。

先在博客根目录执行 `hexo new page fcircle`，将 `source/fcircle/index.md` 写成：

```yaml
---
title: 朋友圈
type: fcircle
comments: false
---
```

再在 `_config.morii.yml` 中修改已有 `friends_feed` 分组：

```yaml
friends_feed:
  endpoint: ''
  page_size: 12
```

暂时没有自己的接口时，保留空 `endpoint`；页面可继续显示友链入口。已有可用接口时，把完整 HTTPS API 地址填进 `endpoint`，不是填某个博客首页。`page_size` 是每次读取的数量，默认 12，范围 1–50。

### 接口需要什么格式？

浏览器向接口添加 `start` 和 `end` 查询参数分页获取文章。最简单的响应是 JSON 数组，每项至少有 `title` 和有效的 `link`（也支持 `url`）：

```json
[
  {
    "title": "朋友的新文章",
    "link": "https://example.com/posts/hello/",
    "author": "朋友的昵称",
    "avatar": "https://example.com/avatar.png",
    "created": "2026-10-21T10:00:00+08:00"
  }
]
```

也兼容包含 `article_data` 等结构的响应。接口服务器需要允许你的博客域名跨域读取。主题提供前端展示，不会自动部署采集服务。

### 怎样确认接入成功？

生成后访问 `/fcircle/`，检查文章标题、作者和链接；点击“加载更多”检查分页。显示“暂时连不上朋友圈”时，查看浏览器网络请求的状态码、响应内容及跨域错误。如果接口直接打开显示的是 HTML 网页，就不是这里需要的 JSON 数据接口。
