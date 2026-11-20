# 稳定性、技术写作与搜索增强

本轮功能按「资源更新 → 加载诊断 → 导航 → 技术写作 → 搜索 → 阅读与评论」顺序接入。已有站点可以保留当前配置，按需开启公式、图表、最新评论和 Waline。

## 资源更新与缓存

Morii 为主题 CSS、JavaScript 自动生成带内容指纹的文件名。文件内容变化后，生成的页面会引用新地址；不需要手动维护 `?v=版本号`。子目录部署也适用，CSS 中的相对图标路径继续有效。

更新主题后执行：

```bash
npx hexo clean
npx hexo generate
```

部署时应让 HTML 可以重新验证或使用较短缓存时间。资源指纹解决静态文件版本问题；如果 CDN 一直返回旧 HTML，仍需按部署平台的方式刷新 HTML 缓存。增量部署时可以保留上一版本资源，减少旧页面在更新期间的 404。

## 检查配置

在已启用 Morii 的博客根目录运行：

```bash
npx hexo morii:check
# CI 中希望警告也阻止发布时使用：
npx hexo morii:check --strict
```

检查范围包括导航、服务地址、布局选项、布尔值、主题色、时间格式和示例资料。错误会令检查命令失败；普通警告默认不会阻止构建。严格模式也会将警告视为失败。构建时会给出同样的配置提示。

## 定位加载缓慢

只诊断一次访问时，在地址后添加 `?morii-debug=1`；已有参数时使用 `&morii-debug=1`。也可以在 `_config.morii.yml` 中开启：

```yaml
performance:
  diagnostics: true
```

打开浏览器开发者工具，在控制台执行：

```js
MoriiDiagnostics.report()
MoriiDiagnostics.download()
```

报告包含当前页面的 TTFB、DOM 就绪、FCP，以及浏览器支持时的 LCP、CLS；同时列出慢资源、资源加载错误和音乐导航耗时。跨域服务没有开放详细计时权限时，会标记 `timingRestricted`，不要把缺失计时当作耗时为零。

报告只在本机生成，资源地址会移除查询参数和片段。诊断默认关闭。采样结果用于定位问题，并非真实访客的长期性能统计。

## 音乐播放中的导航

音乐未激活时，继续使用普通页面导航。播放启动后，站内切页保留播放器，并为浏览器前进后退保存当前会话内的滚动位置。加载超时会保留当前内容，提供重试和直接打开入口；选择直接打开会进行普通导航。

## 技术文章

### 提示块

在文章正文中使用：

```text
{% note tip 小提示 %}
这里可以写 **Markdown**。
{% endnote %}
```

可选类型：`info`、`tip`、`warning`、`danger`。

### 正文时间线

用 `timeline` 在文章或页面中展示项目里程碑、版本更新或学习路线。条目按写作顺序展示，正文支持 Markdown。

```text
{% timeline 项目进度, purple %}
<!-- timeline 2026-10-15 -->
完成 **第一版**。
<!-- endtimeline -->
<!-- timeline 下一步 -->
补充部署说明。
<!-- endtimeline -->
{% endtimeline %}
```

把条目的开始和结束注释放在独立行。标题与颜色可省略，默认使用主题色。颜色可选 `blue`、`pink`、`red`、`purple`、`orange`、`green`。日期可用 `YYYY-MM-DD` 或 `YYYY-MM`，也可以直接写阶段名。

### 正文按钮链接

```text
{% btn /archives/, 浏览归档 %}
{% btn https://hexo.io/, 查看 Hexo 文档, outline %}
```

支持站内路径、`#章节锚点` 和 HTTP(S) 网址。站内路径会自动加上博客部署前缀。第三个参数 `outline` 可选，用于显示描边样式。

### 行内图片

`inlineImg` 适合把图标、徽标或小图放在文字旁边。图片支持 HTTP(S) 地址和以 `/` 开头的站内路径，站内路径会自动加上博客部署前缀。

```text
这个图标 {% inlineImg /icons/brand/morii-logo.png 1.2em "Morii 图标" %} 会跟着文字排版。
```

高度可以用 `px`、`em`、`rem`，纯数字按 `px` 处理。省略高度或填写 `auto` 时使用 `1em`。有含义的图片请填写替代文本，纯装饰图片可省略。行内图片不会进入正文图片预览。

### 行内隐藏文字

在教程中先收起答案、提示或剧透，读者可点击或用键盘展开，再次操作即可收起。关闭 JavaScript 也可使用。

```text
问：Hexo 用哪条命令生成站点？{% hideInline hexo generate, 查看答案 %}
```

英文逗号分隔答案和按钮文字，正文内可使用中文逗号。答案只支持纯文本，按钮文字可省略。答案会从主题摘要和站内搜索中剔除，但仍在网页源码里。

### 文件名与行高亮

```text
{% codefile app.js, javascript, 2-3 5 %}
const theme = 'Morii';
console.log(theme);
{% endcodefile %}
```

前三个参数分别是文件名、代码语言和高亮行。多个行号或范围用空格分开；原有代码复制与长代码折叠继续可用。还可追加第 4、5 个参数指定单块外观与配色，例如 `app.js, javascript, 2, mac, auto`，详见[代码块外观与配色](/config/article#代码块外观与配色)。

### Mermaid 图表

在文章 Front Matter 中添加 `mermaid: true`，正文写：

```text
{% mermaid %}
graph TD
  A[开始] --> B[阅读]
{% endmermaid %}
```

也支持渲染器输出的 `language-mermaid` 代码块或 `figure.highlight.mermaid`。成功后可以展开查看源码，失败时保留原始内容并提供重试。Mermaid 按严格模式初始化。

### 数学公式

在文章 Front Matter 中添加 `math: true`，正文写：

```text
{% math %}
E = mc^2
{% endmath %}
```

行内形式使用 `{% math inline %}x^2{% endmath %}`。使用独立标签可避免 Markdown 提前处理公式里的下划线、反斜杠等字符。本轮不自动识别正文中的 `$...$`。

公式使用 KaTeX，默认不信任公式中的 HTML 指令。图表与公式库仅在启用且页面出现对应内容时下载，普通文章不会加载这些库。默认固定版本；可通过以下配置换为自托管资源：

```yaml
article:
  enhancements:
    mermaid: false
    math: false
    mermaid_url: '' # Mermaid ESM 入口，保留依赖文件的相对目录
    math_url: ''    # KaTeX 浏览器脚本
    math_css: ''    # KaTeX CSS，保留字体文件的相对目录
```

全站配置为 `true` 时，单篇文章仍可用 `mermaid: false`、`math: false` 关闭。

只有正文实际包含对应内容时，公开文章才会为第三方渲染资源添加预连接。同源资源无需额外连接。加密文章仍在解锁后按需加载，并发的公式渲染会共用同一次 KaTeX 加载。

参考：[Mermaid 使用说明](https://mermaid.js.org/config/usage)、[KaTeX 浏览器集成](https://katex.org/docs/browser.html)。

## 搜索

搜索行为包括标题优先排序、中文分词（浏览器支持时）、分类筛选和命中高亮。首次打开搜索时才下载交互脚本及索引。

```yaml
search:
  content: true
  page_size: 10
  shard_size: 100
```

文章数量超过 `shard_size` 后，索引分为轻量目录和全文分片。仅标题、分类与标签搜索使用目录；在「全部内容」中输入关键词后才下载正文，每次最多并发两个分片请求。部分请求失败时会提示结果不完整，重试保留已经下载的分片。分片及目录使用内容指纹。

大型站点现在默认使用[关键词倒排索引与 Web Worker](/config/content#大型站点搜索)，只下载候选文章所在的正文分片；可以通过 `search.inverted: false` 保留原有分片扫描。加密文章不会将正文或分类标签写入搜索索引。

## 阅读中控台

点击顶部四格按钮或按 `?` 打开快捷导航，即可使用深浅模式与音乐控制；文章页面还会显示字号、专注阅读及收藏入口。中控台复用原有阅读偏好和播放器状态。

## 评论与分享信息

原有 Twikoo 配置继续可用。切换 Waline 时，在 `_config.morii.yml` 中设置：

```yaml
comments:
  enable: true
  provider: waline
  server_url: https://comments.example.com
  script_url: ''
  style_url: ''
```

Waline 会跟随页面语言和深浅模式，进入评论区域或点击加载后才初始化。请先部署自己的 [Waline 服务端](https://waline.js.org/guide/get-started/)。

Twikoo 用户还可开启最新评论侧栏：

```yaml
comments:
  provider: twikoo
  recent:
    enable: true
    limit: 5
```

最新评论只在有侧栏的页面展示，进入附近区域后加载；失败可以重试。评论展示使用纯文本，评论链接限定为本站地址。Waline 的最新评论侧栏尚未接入。

默认输出 WebSite / BlogPosting 结构化数据，以及 Open Graph 和 Twitter 分享信息。分享图优先级为文章 `share_image` → `cover` → 全站默认图片：

```yaml
seo:
  structured_data: true
  default_image: /images/share.jpg
```

图片需要自行提供。这些元数据便于搜索引擎和分享平台读取，但不保证被收录或生成指定样式的卡片。
