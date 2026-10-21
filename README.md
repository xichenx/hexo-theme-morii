# Morii Theme

📖 [使用文档](https://morii-docs.pages.dev/) · [文档站开发与部署](https://github.com/xichenx/hexo-theme-morii/blob/main/docs/DOCS-SITE.md)

**Morii by Morainet · 用卡片，收藏技术与生活。**

为“心灵涂鸦”重新开发的 Hexo 主题。保留丰富卡片的视觉方向，模板、样式和交互独立实现。

主题品牌为 **Morii**，组织署名为 **Morainet**，项目仓库为 [xichenx/hexo-theme-morii](https://github.com/xichenx/hexo-theme-morii)。博客名称与主题品牌分别配置，当前博客名称继续使用“心灵涂鸦”。

## 演示视频

[![Morii 功能演示：点击查看完整视频](docs/media/morii-demo-preview.gif)](https://github.com/xichenx/hexo-theme-morii/blob/main/docs/media/morii-demo.mp4)

**[▶ 查看完整演示](https://github.com/xichenx/hexo-theme-morii/blob/main/docs/media/morii-demo.mp4)** · [下载 MP4](https://github.com/xichenx/hexo-theme-morii/raw/refs/heads/main/docs/media/morii-demo.mp4)

约 44 秒 · 1280 × 720 · 无配乐。使用独立演示站的真实界面截图剪辑，展示 `v0.1.0-alpha.2` 的功能。动图为节选，完整视频包含中文字幕轨与章节。

| 时间 | 内容 |
| --- | --- |
| 00:00 | 首页、品牌与内容卡片 |
| 00:07 | 文章阅读与阅读偏好 |
| 00:14 | 分类导航与时间树归档 |
| 00:21 | 图片查看器与音乐馆 |
| 00:28 | 站内搜索与深色模式 |
| 00:36 | 移动端首页与分类 |

## 已实现

- 可配置极光背景、星尘连线与鼠标避让、毛玻璃、卡片跟随光晕及按钮扫光；深色模式同步配色，手机减少粒子数量。
- 响应式首页、文章、归档、分类、标签、404 页面
- 首页可配置精选文章、全站分类导航、页码导航和按年份分组的时间树归档
- 首页、分类总览、分类文章、归档支持配置布局；分类总览可选双列主题导航、目录和卡片。
- 首页 GitHub 贡献日历支持主题配色、每日详情、键盘导航、移动端横向滚动、缓存与重试。
- 首页即刻速览、随机文章发现卡片，支持手动切换和无脚本回退
- 关于、友链、即刻短文、相册及相册详情页，读取现有 `source/_data` 文件
- 按需加载的正文搜索、命中摘要高亮、结果分页、深色模式、移动导航、文章目录
- 移动端折叠目录、当前章节提示、阅读进度、返回顶部、代码复制和文章链接复制
- 相关文章推荐、文末相邻文章导航、长代码展开与收起
- 文章字号调整、专注阅读、阅读偏好本机保存与一键恢复
- 稍后阅读收藏清单、本机保存、跨标签页状态同步
- 全站快捷导航面板、键盘入口与快捷键提示
- 原生数字时钟与天气卡片、固定城市、天气缓存和失败重试
- 资料卡和关于页的社交关注入口、自定义平台与扫码关注
- 文章打印预览、打印样式、通过浏览器另存为 PDF
- 可配置公告、热门标签卡片、本地站点统计与文章时效提醒
- 图片弹窗预览、连续翻图、方向键导航、照片信息和加载失败重试
- 图片查看器支持 1–8 倍缩放、拖拽、双指缩放和适应窗口下的左右滑动切图；`+` / `−` 调整缩放，`0` 重置，`Esc` 关闭。
- 长文阅读进度保存在当前浏览器，再次访问可点击“继续上次阅读”；支持清除本篇记录，读完后自动移除。通过 `article.resume.enable: false` 关闭。最多保留 50 篇、90 天的进度；更新过的文章、带章节锚点的链接及加密文章不会显示旧进度提示。
- 关于页个人介绍、真实站点统计与文章主题；友链分组检索和本站名片复制
- 朋友圈卡片信息流、分页、重试及本地友链回退
- 完整音乐播放页、Meting 歌单、同步歌词、播放模式与站内连续播放的悬浮球
- 小空调网页玩具：开关、16–30°C 调温、冷暖模式和摆风
- canonical、Open Graph 和文章发布时间等元数据
- Twikoo 评论入口与原有文章的 `tabs`、`folding`、`link`、`label`、`p` 标签兼容

## 安装

在已有 Hexo 8 站点根目录安装最新版本：

```bash
npm install hexo-theme-morii@latest hexo-renderer-pug
```

也可以从 GitHub 克隆到主题目录：

```bash
git clone https://github.com/xichenx/hexo-theme-morii.git themes/morii
npm install hexo-renderer-pug
```

将站点 `_config.yml` 中的主题改为：

```yaml
theme: morii
```

主题使用 Pug 模板与原生 CSS / JavaScript，无额外前端打包步骤。当前开发环境为 Hexo 8.1.2。npm 安装会使用 `node_modules/hexo-theme-morii`；建议通过站点根目录的 `_config.morii.yml` 覆盖主题配置，避免修改安装包。首次安装请按自己的信息修改头像、社交账号、备案号、建站时间和音乐歌单；这些配置目前保留作者站点的示例值。

```bash
npx hexo generate
npx hexo server
```

## 配置

主题设置在 Git 安装的 `themes/morii/_config.yml` 或 npm 安装的 `node_modules/hexo-theme-morii/_config.yml`，也可通过站点根目录的 `_config.morii.yml` 覆盖。

`logo` 控制顶部导航栏图标，`favicon` 控制浏览器标签页图标，两者可以分别替换，支持本站路径或完整图片网址。例如：

```yaml
logo: /icons/brand/morii-logo.png
favicon: /icons/brand/morii-favicon.png
```

本地图片放在主题的 `source/` 目录下，配置中省略 `source`。`logo` 留空时显示默认星形标记，图片加载失败时也会回退为星形。

首页 `featured[].icon` 可使用主题内置线性图标名称，例如 `book`、`code`、`sparkles`、`sun`；快捷导航会按页面路径自动选择同风格图标。自定义单个字符图标仍可使用，找不到对应图标名称时会按原文字显示。

本仓库仅包含 Morii 主题。原 AnZhiYu 主题、博客文章及 `source/_data/` 数据由站点自行管理，不随主题发布。使用旧站数据时，请检查即刻和友链中的演示内容；切换主题后也应按需关闭旧主题专用的时钟和 Live2D 插件，避免重复浮层。

## 页脚备案信息

页脚保留运行时长，使用 `footer.runtime` 配置：

```yaml
footer:
  runtime:
    enable: true
    start: '2024-03-15T00:00:00+08:00'
    label: 本站居然运行了
```

上线时间沿用原站配置，请填写带时区的 ISO 日期。浏览器按秒更新天、小时、分钟和秒；标签页隐藏时暂停更新，返回后重新计算。关闭 JavaScript 时显示构建时的时长；`enable: false` 隐藏，格式无效时不展示。运行时长与备案信息共享紧凑一行，小屏自动换行。

在主题配置中设置 `footer.filing`，支持 ICP 与公安备案号，未填写的条目自动隐藏。`enable: false` 隐藏整个区域。已沿用原主题的 ICP 备案文本；请按自己的实际备案信息填写，主题不会自动校验备案状态。`url` 为点击后打开的查询链接，公安备案未配置链接时显示为纯文本。

```yaml
footer:
  filing:
    enable: true
    icp:
      number: '你的 ICP 备案号'
      url: https://beian.miit.gov.cn/
    police:
      number: ''
      url: ''
```

## 首页与文章浏览

通过 `home.selected_posts` 指定精选文章的标题、路径或 slug，顺序即展示顺序；`home.selected_limit` 限制展示数量（1–6）。也可在文章 front matter 设置 `featured: true`。主题会去重并排除加密文章；未选中任何文章时回退到最近发表的公开文章。

```yaml
home:
  selected_limit: 3
  selected_posts:
    - RecyclerView底层实现原理
    - Flutter
    - Ktor 学习与实践文档
```

大幅介绍和精选卡片仅出现在首页第一页。后续页直接显示文章列表与页码；分类按钮链接到 Hexo 生成的完整分类页面。归档会保留年份、月份的路由范围，分页支持首页空路径、自定义分页目录及长页码省略。

侧栏的分类数量和年份数量来自站点文章，最近更新按 `updated` 排序。自动摘要会跳过代码块、行号和脚本，纯代码文章显示代码笔记提示。

## 时钟与天气

`clock.enable` 控制首页、归档和文章侧栏中的数字时钟天气卡片。默认城市为长沙市，坐标 `latitude: 28.19`、`longitude: 112.98`，时区 `timezone: Asia/Shanghai`；更换城市时请同时修改名称、经纬度和时区。时钟每秒更新，与天气请求独立，不依赖远程字体。

天气使用 [Open-Meteo Forecast API](https://open-meteo.com/en/docs) 的当前天气数据，显示天气状况、温度、湿度、风向和数据更新时间。每 10 分钟刷新，最多使用 1 小时内缓存，失败可手动重试；无法连接时继续显示时钟与城市。页面不会获取访客 IP 或定位权限，默认显示配置城市。免费接口适用于非商业使用，商业站点请根据提供方条款选择服务。

旧 `electric_clock` 插件保持关闭，Morii 不读取或输出其中的 API 密钥。原插件的位置定位与和风天气服务并未启用，避免重复挂载。静态站点若需要密钥服务，建议由自有后端代理请求。

## 快捷导航

顶部九宫格按钮或 `?` 键可打开全站导航面板，入口来自 `menu`、`explore` 配置，自动补入标签与稍后阅读，重复路径只显示一次。菜单项可配置 `icon` 和 `description`；关闭稍后阅读时对应入口会自动隐藏。`quick_navigation.enable: false` 可关闭面板、按钮和脚本。

面板底部可直接打开搜索，`⌘/Ctrl + K` 继续作为搜索快捷键，`Esc` 关闭导航。输入框、文本编辑区域和其他弹窗打开时，`?` 不触发导航。关闭后焦点回到打开前的位置，手机端使用两列卡片。

## 站内搜索

首次打开搜索弹窗时加载本站生成的 `morii-search.json`，后续在当前页面复用。支持标题、正文、分类和标签，多关键词按同时匹配处理，标题匹配优先；结果摘要围绕命中位置截取并高亮。`search.content: false` 可关闭正文入索引，仍保留标题、摘要、分类和标签；`search.page_size` 设置每批结果数（5–30，默认 10）。

搜索面板支持“全部内容 / 仅标题 / 分类与标签”范围切换，以及热门标签快捷查找。使用 `↑` / `↓` 在结果与输入框之间移动，输入关键词后按 `Enter` 打开第一条结果，`Esc` 关闭；中文输入法组词期间不会触发跳转。头部与底部固定，结果区域独立滚动。全文索引加载失败时仍可搜索页面内的标题、摘要与分类标签，并可重试。

加密文章只输出标题、路径和日期，不输出描述、摘要、正文或标签；未发布文章不进入索引。搜索词只在浏览器中处理。索引下载失败时保留标题/摘要检索并提供重试。子目录部署时索引和文章链接会跟随站点 `root`。

## 首页内容发现

`home.moments.enable` 控制即刻速览，`limit` 限制条数（1–10，默认 5）。从 `source/_data/essay.yml` 中 `home_essay: true` 的分组读取非空内容，按日期从新到旧排列，并遵守各组的 `limit`。速览使用纯文本，点击后跳转到即刻页对应卡片；没有有效内容时隐藏。切换完全由用户操作，不自动轮播。

`home.random.enable` 控制“随便逛逛”。候选文章排除加密、未发布和重复路径；点击“换一篇”后更新预览，点击阅读链接才打开文章。一轮中不重复，候选耗尽后开始新一轮，也不会立即重复当前文章。没有 JavaScript 时展示第一条即刻和最近的公开文章；只有一条数据时不显示切换按钮。两个模块只在首页第一页展示。

当前即刻数据仍含原主题演示记录，可在 `source/_data/essay.yml` 更新为自己的内容；将对应分组的 `home_essay` 设为 `false`，即可从首页隐藏该组。

## 关于、相册与友链

### 社交关注入口

主题配置 `social` 为列表，资料卡和关于页使用同一份配置。当前沿用旧站的两个账号：GitHub `xichenx` 与 CSDN `qq_60642811`。主页链接在新标签页打开；手机是否唤起对应 App 取决于平台与系统的链接处理，主题不强制调用应用。

```yaml
social:
  - name: GitHub
    icon: github
    url: https://github.com/your-name
    description: 在 GitHub 关注我
  - name: 微信
    icon: wechat
    qrcode: /images/wechat-follow.png
    account: 你的微信号或公众号
    description: 使用微信扫一扫关注
```

`url` 支持 HTTP/HTTPS 主页，`qrcode` 支持站内绝对路径或 HTTP/HTTPS 图片，可同时配置；需要自己提供真实二维码。只配置二维码时显示扫码按钮，同时配置时显示主页和扫码入口。`enable: false` 可隐藏单项，`social: []` 隐藏全部。无效地址与重复项会被忽略。

可用平台图标包括 `github`、`csdn`、`bilibili`、`wechat`、`weibo`、`zhihu`、`douyin`、`xiaohongshu`、`telegram`，使用主题内的本地资源，来源见 `source/icons/social/NOTICE.md`；其他平台默认使用名称前两个字符。二维码弹窗提供加载提示、原图链接和键盘关闭，不会自动执行关注或发送消息。

这些页面继续读取 `source/_data/about.yml`、`album.yml`、`link.yml`。关于页的文章、分类和相册数量自动统计，主题标签来自实际文章分类；个人标签、经历和兴趣沿用数据文件，`about.show_interests` 控制兴趣卡片。

相册使用 `path_name` 精确匹配页面路径，`album_list[].image` 支持单个地址或地址数组，空项会被忽略。照片的 `content`、`address`、`from`、`date` 显示为说明信息。点击照片后可用左右按钮或方向键浏览，Esc 关闭；加载失败时可重试或打开原图。

友链采用分组卡片与本站名片侧栏布局，手机端自动改为单列。支持站名、简介、标签和域名关键词组合筛选，可清空搜索，无结果时可一键重置。沿用 `source/_data/link.yml` 中的 `siteshot`、`tag` 和 `recommend` 字段，展示截图、标签和推荐标记；图片失败时显示渐变封面或文字头像。分组标题显示当前匹配数量。

本站名片取自站点标题、地址、简介和主题头像，默认折叠 JSON 数据，支持一键复制。浏览器不允许自动复制时，会展开数据并选中内容供手动复制。交换友链入口跳转本站留言板，读者可自行留下网站信息。

## 文章阅读

### 文章分享

文章底部“分享文章”提供普通链接、Markdown 链接复制，以及浏览器支持时的系统分享。复制失败会选中内容，支持手动复制；系统分享由读者主动选择应用。分享内容仅包含文章标题与规范链接，不读取正文或解密内容。Markdown 标题中的括号和反斜杠会转义。

不支持系统分享的浏览器仍可复制链接。关闭弹窗或按 `Esc` 返回原按钮；打印预览期间不打开分享弹窗。设置 `article.share.enable: false` 可关闭分享弹窗，原有“复制文章链接”按钮保留。

### 打印与 PDF

阅读设置和文章底部提供“打印 / 导出 PDF”入口。先进入页面内预览，再选择“打印 / 保存 PDF”打开浏览器打印窗口，可使用浏览器的“另存为 PDF”。预览与纸张打印共用 `print.css`，隐藏导航、侧栏、评论和操作按钮；长代码完整展示并换行，正文中的折叠内容自动展开，文末附带站点、作者和原文链接。音视频、嵌入网页和文章封面不会打印，正文图片保留。

“返回阅读”或 `Esc` 会恢复折叠状态和原来的滚动位置。浏览器直接打印时，也会临时展开折叠内容并在打印后恢复。打印的是当前已加载的内容，外部资源加载失败或尚未解密的文章不会因此自动补全。PDF 的最终分页、页眉页脚和纸张设置由浏览器决定。设置 `article.print.enable: false` 可关闭主题提供的入口与样式。

### 稍后阅读

文章标题下可以加入或移出“稍后阅读”，侧栏导航和页脚提供清单入口 `/reading-list/`。清单按收藏顺序排列，支持继续阅读和逐条移除，最多保存 100 篇。记录只在当前浏览器的 `morii-reading-list` 中保存文章路径；标题与日期从本站索引读取，不保存正文。不同浏览器或设备之间不会同步，清理网站数据会清除收藏。

索引加载失败时提供重试；文章被移除或暂未找到时仍保留收藏记录，可以手动移除。浏览器禁用存储时显示提示，操作不会伪装成成功。跨标签页更改会自动刷新状态。通过 `reading_list.enable: false` 可以关闭按钮、导航和页面生成；`reading-list/` 为主题保留路由。

清单支持按标题、分类、标签和路径组合筛选。可以将收藏导出为 JSON，再在其他浏览器中导入；导入会保留当前收藏并合并去重，支持站点根目录变化，超出 100 篇时提示未导入数量。仅接受 256 KB 以内、格式版本受支持的 Morii 收藏备份，文件在浏览器内读取，不上传服务器。备份只包含文章路径，不包含正文、阅读位置和账号信息。

### 阅读设置

阅读页采用独立的通栏大封面，集中展示分类、标签、发布日期、更新日期、阅读时长和作者。封面优先使用文章 `top_img`，其次为 `cover`；`top_img: false` 使用纯渐变背景。正文与作者侧栏分为独立卡片，手机端封面信息居中。正文默认 17 px，章节标题、列表、表格和引用有独立排版，长代码在块内横向滚动。

文章标题下方提供“阅读设置”，支持 15 / 17 / 19 / 21 px 正文字号，以及收起侧栏、居中正文的专注阅读。设置在当前浏览器保存，切换文章时会沿用；“恢复默认”会清除本机阅读偏好并恢复 17 px。无法访问本地存储时仍可调整当前页面。

桌面作者卡片随页面滚出，目录与天气区域独立吸顶，窗口较矮时可在该区域滚动。当前章节高亮并自动保持在目录可见范围。目录支持 H1–H6，解密后的新增章节也会更新。手机、平板及专注模式提供左下角“目录”入口，显示阅读进度，可随时跳转章节；按 Esc 或关闭按钮返回。未开启 JavaScript 时保留正文前的折叠目录。

通过 `article.reading_settings: false` 隐藏控件并关闭偏好应用。不开启 JavaScript 时使用默认布局，设置面板保持隐藏。

### 侧栏卡片与时效提醒

参考 AnZhiYu 的公告、标签与站点信息模块，为 Morii 独立实现对应卡片。`sidebar.announcement` 支持 `enable`、`title` 和纯文本 `content`（支持换行，不执行 HTML）；`sidebar.tags` 支持 `enable` 和 `limit`（1–40，默认 12），按文章数量排列。`sidebar.stats.enable` 控制站点档案，显示发表数量、公开内容字数与最早文章日期；字数按汉字和外文单词估算，排除代码、加密正文和未发布文章。

`article.outdated.enable` 开启时效提醒，`days` 为距上次更新的天数阈值，默认 365；超过阈值才显示。无更新日期时使用发表日期，无有效日期或加密文章不展示。浏览器会重新计算天数，避免静态页面缓存造成提示过期；在文章 front matter 中设置 `outdated: false` 可单独关闭。更新日期以 Hexo 的 `updated` 为准，长期文章建议显式维护该字段。

### 继续阅读与代码

`article.related` 按共同标签、共同分类推荐文章：每个共同标签计 3 分，共同分类计 1 分，同分时优先较新的文章。排除当前文章、重复路径、加密文章和未发布文章；没有关联时隐藏整个推荐区。`limit` 支持 1–6，默认 3。

`article.navigation` 控制文末上一篇/下一篇导航。`article.code.collapse` 控制长代码默认收起，`lines` 设置预览行数（5–100，默认 18）。展开按钮可用键盘操作，复制按钮始终复制完整代码；文章解密后也会自动处理新增代码块。关闭 JavaScript 时直接显示完整代码。

```yaml
article:
  navigation: true
  related:
    enable: true
    limit: 3
  code:
    collapse: true
    lines: 18
```

## 小空调

访问 `/air-conditioner/` 使用网页小玩具，入口位于页脚。温度、模式和摆风偏好保存在本机浏览器；重新进入时默认关闭。该功能仅模拟界面，不连接实际设备，也不会播放声音。浏览器禁用本地存储时控件仍可使用。

## 朋友圈

`friends_feed.endpoint` 是返回 JSON 的完整接口地址。前端使用 `start`、`end` 参数分页，支持数组，以及 `article_data` 数组或以键组织的对象。文章字段为 `title`、`link`（或 `url`）、`author`、`avatar`、`created`（或 `date` / `updated`）。跨域接口需要允许博客域名的 CORS 请求。

默认沿用旧站配置的 `https://friends.anheyu.com/all`。2026-10-15 本地验证时该服务连接超时，尚未核实在线响应格式；已用代表性 JSON 数据验证渲染、去重、分页、失败重试与异常链接处理。真实接口不可用时页面仍显示友链，替换为你自己的服务地址后即可再次验证。

## 音乐馆

音乐馆是完整的播放页面：封面、同步滚动歌词、可搜索歌单和底部播放控制。支持进度拖动、点击歌词定位、音量调整，以及顺序、列表循环、单曲循环和随机播放。移动端可切换歌词 / 歌单。

访问音乐馆会自动获取歌单；点击播放后，站内链接跳转保留同一音频实例，离开音乐馆时显示参考 AnZhiYu 的左下角音乐胶囊：播放时主题色背景、旋转封面和呼吸光效，暂停后恢复普通卡片色。点击封面播放 / 暂停，点击歌名伸展 / 收起当前歌词，伸展或悬停时可切歌及返回完整播放器。支持浏览器前进 / 后退。导航由一个同源内容框架承载，目标页面正常执行自己的初始化和卸载，页面地址和标题会同步更新。外站、下载链接和新标签页仍按各自链接行为打开。

这是同一标签页内的连续播放；手动刷新或关闭标签页会重新加载播放器，不会自动播放。未播放前不会在普通页面额外请求歌单。

音乐馆支持与 AnZhiYu 相同的 Meting 配置，访问页面后自动获取平台歌单，在本站选曲播放。当前沿用原站 QQ 歌单，修改主题 `_config.yml`：

```yaml
music:
  playlist_url: https://y.qq.com/n/ryqq/playlist/1451608172
  playlist_label: 在 QQ 音乐收听
  volume: 0.7
  meting:
    enable: true
    server: tencent  # QQ 音乐；网易云使用 netease
    type: playlist
    id: '1451608172'
    api: 'https://api.injahow.cn/meting/?server=:server&type=:type&id=:id&r=:r'
  tracks: []
```

`api` 可替换为自己的 Meting 兼容服务，需允许站点跨域访问。支持返回 `name/artist/cover` 或 `title/author/pic` 字段的歌曲数组。歌单在浏览器端获取，不会在构建时缓存临时音频链接。公开接口和平台歌曲的可用性由服务端决定，部分歌曲可能无法播放；失败时可重试或打开原平台歌单。页面不会自动开始播放。

关闭 `music.meting.enable` 后可只使用本地配置；也可通过 `music.tracks` 提供获取歌单失败时的备用曲目：

```yaml
music:
  meting:
    enable: false
  tracks:
    - title: 音频标题
      artist: 作者
      url: https://your-domain.example/audio/example.mp3
      cover: https://your-domain.example/images/cover.jpg
```

配置官方提供的 HTTPS `music.embed_url` 也可展示嵌入播放器。

本地曲目可增加 `lrc: /audio/example.lrc` 指定 LRC 歌词文件，也可用 `lyrics: |` 直接填写带时间戳的歌词。在线歌单自动读取接口返回的 `lrc`；歌词加载失败不影响音频播放。

曲目的 `url` 和 `cover` 也支持 `/audio/example.mp3` 这样的本站路径。未开启 JavaScript 时可通过原平台歌单入口收听。

## 电影院

主题自动生成 `/cinema/` 页面，包含电影、电视剧、动漫分类、片名搜索和剧集切换。把自有视频文件放在博客根目录的 `source/videos/`，并新建 `source/_data/cinema.yml`：

```yaml
- title: 周末短片
  type: movie
  year: '2026'
  description: 一部适合周末观看的短片。
  cover: /images/weekend-poster.jpg
  url: /videos/weekend.mp4

- title: 我的剧集
  type: series
  year: '2026'
  cover: /images/series-poster.jpg
  episodes:
    - title: 第 1 集
      url: /videos/series-01.mp4
    - title: 第 2 集
      url: /videos/series-02.webm

- title: 动画短片
  type: anime
  episodes:
    - title: 正片
      url: https://video.example.com/anime.mp4
```

`movie`、`series`、`anime` 分别表示电影、电视剧和动漫。单片直接用 `url`；多集使用 `episodes`。也可在主题配置的 `cinema.items` 内填写同样的数据。站点数据文件优先。视频地址支持本站绝对路径或 HTTPS 地址，站点部署在子目录时会自动补上前缀。播放器使用浏览器原生视频控件，是否支持 MP4、WebM 或 HLS 由浏览器和视频编码决定；外部视频服务还需允许页面引用。未填写片单时显示配置提示。设置 `cinema.enable: false` 可关闭页面，关闭后应同时移除 `explore` 中的电影院链接。

## 页面动效

默认开启卡片滚动入场、首页装饰缓动、悬停反馈、按钮按压和弹窗入场。卡片只在首次进入视口时播放，异步加载的卡片同样适用。正文段落不逐段淡入，键盘聚焦会立即结束对应卡片的入场动画。无 JavaScript 或浏览器缺少动画支持时，内容正常显示。

```yaml
motion:
  enable: true  # false 关闭本次新增的页面动效
```

自动遵循系统“减少动态效果”，偏好变化时会取消正在运行的入场动画。首页装饰离开视口或页面进入后台时暂停，打印时关闭动效。音乐封面、空调和页脚爱心等功能原有动画仍遵循各自配置与系统设置。

## 开发与发布

主题仓库已提供独立演示站、CI、GitHub Release 草稿和可选 GitHub Pages 部署工作流。

```bash
# 在主题仓库根目录执行
npm ci
npm test
npm run build:demo
npm run audit:performance
npm run package:theme
```

`audit:performance` 会独立构建演示站，统计首页、归档、文章、相册、音乐馆和电影院的 HTML、CSS、JavaScript 与图片体积，以及首屏阻塞样式和请求数；超出 `tools/performance.cjs` 中的预算时 CI 失败。统计值是本地文件的未压缩大小，不等同于线上传输量或 LCP / INP / CLS；线上体验仍需用浏览器性能工具和真实访问数据核对。报告会标出超过 500 KiB 的示例图片。

创建版本标签、发布 GitHub Release 与 npm 包、提交 Hexo 主题目录的具体步骤见 [发布指南](docs/RELEASING.md)。当前正式版为 `1.0.0`，采用 MIT 许可证。

## 交互与回归验证

主题仓库的 `npm test` 覆盖独立 Hexo 站点在根路径和子目录的构建、页面与资源路径、音乐队列与搜索、歌词加载竞争和进度定位、悬浮胶囊、发布版本校验、ZIP 内容和 SHA256 校验。

作者博客工作区保留更多依赖真实文章的回归测试，两者用途不同。在线音乐、评论、天气和朋友圈的实际可用性仍需浏览器核对；独立构建不会请求这些外部服务。

### GitHub 贡献日历

首页第一页在内容推荐区下方显示贡献日历，无需旧 AnZhiYu 的 `recent-posts` 容器。主题配置示例：

```yaml
github_calendar:
  enable: true
  user: xichenx
  api: 'https://github-contributions-api.jogruber.de/v4/{user}?y=last'
```

未配置主题账号时可沿用站点 `githubcalendar.user`。原插件的 `layout`、`calendar_js`、`color` 由 Morii 的原生布局与样式替代；旧接口不自动沿用，因为返回格式可能不同。`api` 可替换为兼容 [GitHub Contributions API v4](https://github.com/grubersjoe/github-contributions-api) 的自建服务，需允许博客跨域读取，无需在主题中设置 GitHub Token。浏览器会将成功响应缓存一小时，展示数据的截止日期；接口失败时可重试，账号链接仍可访问。数字表示服务返回的贡献次数，不代表提交数量。关闭 `enable` 后不加载日历脚本。

### 页面布局配置

推荐在**博客根目录**创建或编辑 `_config.morii.yml`，通过 Hexo 的主题覆盖配置选择布局。这样升级 `themes/morii` 时可保留自己的设置；直接修改主题的 `_config.yml` 也支持。布局配置在生成站点时生效，修改后执行 `npx hexo clean && npx hexo generate`，本地预览服务需重新启动。

```yaml
appearance:
  layouts:
    home: featured
    categories: atlas
    category: list
    archives: timeline
```

| 配置项 | 可选值 | 默认值 |
| --- | --- | --- |
| `home` | `featured`：最新文章列表在奇数篇时突出首篇；`grid`：普通双列文章卡片 | `featured` |
| `categories` | `atlas`：双列主题导航；`directory`：左侧索引与近期文章目录；`cards`：独立分类卡片 | `atlas` |
| `category` | `list`：顶部主题切换和文章行列表；`cards`：文章卡片与侧栏 | `list` |
| `archives` | `timeline`：年份时间树；`grouped`：按年份分组的列表卡片 | `timeline` |

每项可独立选择。例如喜欢经典卡片时，将 `categories` 和 `category` 都设为 `cards`；喜欢目录时，只将 `categories` 设为 `directory`。未填写的项使用默认值，非法值会在构建日志提示并回退默认布局。配置值只从上述内置方案中选择，不加载任意模板。

布局选择不修改每页文章数量、文章顺序、路由或分页范围；每页数量仍由 Hexo 的 `index_generator`、`category_generator`、`archive_generator` 和全局 `per_page` 决定。此配置不会覆盖浏览器内保存的字号、专注阅读等阅读偏好。

### 视觉特效

在博客根目录 `_config.morii.yml` 中配置，与 `appearance.layouts` 放在同一个 `appearance` 下：

```yaml
appearance:
  effects:
    enable: true
    aurora: true
    particles: true
    density: 48
    glass: true
    spotlight: true
    tilt: true
    ripple: true
    theme_transition: true
```

- `aurora`：缓慢流动的渐变极光背景。
- `particles`：原生 Canvas 星尘、近邻连线与鼠标避让；`density` 限制在 12–80，手机最多 18 个，绘制频率约 30 fps，像素倍率最高 1.5。
- `glass`：导航与展示卡片毛玻璃，正文区域保留实色背景；浏览器不支持时沿用原样式，手机关闭卡片背景模糊。
- `spotlight`：精细指针设备上的卡片跟随光晕；首页主按钮悬停时有扫光。
- `tilt`：鼠标移动时卡片沿两个方向轻微倾斜（最多 3°），离开或滚动立即复位；触摸设备关闭。
- `ripple`：按钮点击波纹，支持键盘触发，保持原有点击行为。
- `theme_transition`：深浅色切换时从按钮位置圆形扩散，基于 [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using)；不支持、减少动态效果或节省流量时直接切换。
- `enable: false`：关闭整套新特效，不加载其样式与脚本。原有滚动入场等动画仍由 `motion.enable` 控制。

`motion.enable: false` 会同时停止新特效中的持续运动和指针光晕，但保留静态极光与毛玻璃。系统设置减少动态效果、高对比度或浏览器启用节省流量时不运行粒子；切入后台、打印、离开页面会暂停，返回后恢复。特效不依赖第三方动画库，不读取定位或发送网络请求。修改配置后重新生成站点并重启本地预览。

特效仅由网站所有者通过主题 `_config.yml` 或站点根目录 `_config.morii.yml` 配置。页面不提供访客特效开关，不读取或保存浏览器中的特效偏好；旧版本保存的特效偏好不再生效。深浅色切换和阅读字号等已有功能仍可正常使用。
