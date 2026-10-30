# 系列、响应式封面与大型站点搜索

本轮加入系列专题、响应式封面、倒排索引与 Web Worker，并完善图表换色和移动端中控台。所有生成页面均支持博客子目录和三种界面语言。

## 系列文章与专题

给同一系列的文章填写相同的 `series` 标识，在 Front Matter 中指定阅读顺序：

```yaml
---
title: Android 启动流程
series: android-internals
series_order: 1
---
```

`series` 以字母、数字或中文开头，可包含连字符和下划线，长度不超过 80 个字符。它是 URL 标识，建议保持稳定。`series_order` 按数字升序排列；指定顺序的文章排在未指定的文章前面。顺序相同或均未填写时，按发布日期升序，再按文章路径排序。

在**博客根目录**的 `source/_data/series.yml` 填写专题资料：

```yaml
android-internals:
  title:
    zh-CN: Android 底层原理
    zh-TW: Android 底層原理
    en: Android internals
  description: 从启动流程到 UI 渲染，连接零散的技术笔记。
  order: 1
  cover: /images/series/android.jpg
```

标题和简介可以使用普通字符串，也可以填写三语言映射。没有资料文件时，使用 `series` 标识作为名称。只填写专题资料而没有文章，不会生成空专题。

生成后可以访问：

- `/series/`：全部专题。
- `/series/android-internals/`：该系列的有序文章目录。
- 系列内文章：显示可折叠目录、当前文章标记和系列上一篇 / 下一篇。

文章头部还会显示面包屑。系列前后篇与原有的按时间相邻文章分别展示，便于按两种方式继续阅读。系列目录不依赖 JavaScript。未发布草稿不参与生成；加密文章只使用公开标题与加密提示。

站点有系列文章时，快捷导航会自动加入专题入口。也可以在 `_config.morii.yml` 的 `menu` 中添加：

```yaml
menu:
  - name:
      zh-CN: 专题
      zh-TW: 專題
      en: Collections
    path: /series/
```

通过以下配置整体关闭：

```yaml
series:
  enable: false
```

如果博客已经存在 `source/series/index.md`，主题会保留该路径的手工页面。不要将手工页面放在自动专题的同名路径上，除非你希望由手工页面接管展示。

## 响应式封面

### 本地图片

主题默认使用可选依赖 `sharp`，为文章 `cover` / `top_img` 和专题 `cover` 生成 WebP 候选图。处理发生在 Hexo 构建时，浏览器通过 `srcset` 与 `sizes` 选择适合屏幕的版本。原始文件和回退地址会保留。

```yaml
images:
  responsive: true
  widths: [480, 800, 1200]
  quality: 78
  cover_tone: true
```

图片不会被放大到超过原始宽度。输出地址包含原图内容与处理参数的指纹；生成结果缓存在博客 `.cache/morii-images`。主题保留首屏封面高优先级，其他卡片仍然懒加载。

若部署环境省略了可选依赖，自动生成会跳过，构建会提示原因；原图和显式候选仍可使用。需要自动生成时，在博客根目录安装：

```bash
npm install sharp@^0.35.5
```

自动处理只读取博客和主题资源目录内的本地 JPEG、PNG、WebP、AVIF，跳过动画及过大的图片。不会下载远程图片，也不会跟随指向资源目录外的符号链接。

### 远程图片与自行准备的候选

远程封面可以显式填写尺寸和不同宽度的图片：

```yaml
cover: https://cdn.example.com/post-1200.webp
cover_width: 1200
cover_height: 675
cover_srcset:
  - src: https://cdn.example.com/post-480.webp
    width: 480
  - src: https://cdn.example.com/post-800.webp
    width: 800
  - src: https://cdn.example.com/post-1200.webp
    width: 1200
cover_color: '#487465'
```

候选图应保持相同内容和宽高比。单独的文章头图使用 `top_img_width`、`top_img_height`、`top_img_srcset`。没有真实尺寸时，主题使用 1200 × 675 的布局保留比例；远程图片建议填写真实尺寸。

封面加载时保留卡片空间并显示轻量占位；失败使用星号状态。没有 JavaScript 时仍可直接显示图片。

### 封面取色

本地封面在构建时提取主色；远程图片可以用 `cover_color` 指定。颜色只用于文章头部底色与叠层，正文和全站主题色继续使用原配置。标题上保留暗色遮罩，避免亮色封面降低文字对比度。

使用 `images.cover_tone: false` 可以关闭取色效果。

## 大型站点搜索

```yaml
search:
  content: true
  page_size: 10
  shard_size: 100
  inverted: true
  worker: true
```

文章数量超过 `shard_size` 后，生成三级数据：

1. 文章目录：标题、简介、分类和正文所在分片。
2. 关键词倒排索引：按固定哈希规则拆成 64 个文件。
3. 正文分片：只在候选文章需要时下载。

搜索先下载查询词对应的关键词索引，再求候选文章交集，只取候选文章所在的正文分片。已下载数据在当前页面内复用。短关键词或覆盖面很广的查询仍可能命中很多分片，不能保证每次只下载一个。

索引采用字符 n-gram，支持中文以及英文单词的部分匹配。候选结果仍会用原文校验，避免仅因字符片段相同就误命中。加密文章的正文、分类和标签均不进入索引。

浏览器允许时，交集计算与筛选排序在同源 Web Worker 中执行；文章数据仅在更新时同步给 Worker，不在每次输入时重复传输。快速修改查询时，过期结果不会覆盖新结果。

回退方式：

- Worker 不可用或被 CSP 拦截：使用浏览器主线程的同一套搜索规则。
- 关键词索引加载失败：回退到已有的正文分片扫描。
- 正文分片加载失败：提示结果可能不完整，支持重试。
- 搜索脚本或索引不可用：保留页面内的标题和摘要入口。

`search.inverted: false` 可保留上一版的分片模式；`search.worker: false` 只关闭 Worker。小站点继续使用单文件索引。

如果站点配置了 CSP，请允许本站脚本、`worker-src 'self'` 和搜索 JSON 请求。主题使用独立同源 Worker 文件，不需要 `blob:` Worker。

## 图表、长标题与手机

Mermaid 图表会在深浅模式切换后重新绘制，保留源码展开状态。重新渲染失败时，已显示的图表会继续保留并提供重试，原始源码也始终可查看。

文章头部、卡片和专题目录处理较长标题与无空格字符串。移动端中控台增加安全区域间距、独立滚动和较大的按钮触控区域；较窄屏幕下快捷导航改成单列。
