# 文章封面与阅读功能

文章有两类配置：**只影响一篇文章的设置**写在该文章顶部；**所有文章共用的阅读功能**写在博客 `_config.morii.yml`。

## 1. 一篇文章的完整示例

打开 `source/_posts/我的第一篇文章.md`，将字段合并到已有的两条 `---` 之间，不要在正文中再加第二组 Front Matter：

```markdown
---
title: 我的第一篇文章
date: 2026-10-21 10:00:00
updated: 2026-10-21 10:00:00
description: 记录我搭建博客的第一天。
cover: /images/posts/first-post.jpg
categories:
  - 生活记录
tags:
  - 博客
  - Hexo
featured: true
comments: false
outdated: false
---

## 今天做了什么

这是我的正文。
```

请把时间换成自己的时间；封面需要真实放在 `source/images/posts/first-post.jpg`，还没准备图片时删掉 `cover` 行。

| 字段 | 作用 | 不填时 |
| --- | --- | --- |
| `title` | 文章标题 | 建议始终填写 |
| `date` / `updated` | 发布 / 更新时间 | 由 Hexo 处理；主动填写便于控制 |
| `description` | 文章介绍、摘要来源之一 | 使用正文摘要等备用内容 |
| `cover` | 卡片封面、文章顶部封面的备用来源 | 使用无封面布局 |
| `top_img` | 单独指定文章顶部封面 | 使用 `cover`；设为 `false` 可关闭顶部封面 |
| `categories` / `tags` | 分类与标签 | 不显示相应分类、标签 |
| `featured` | `true` 时参与首页精选 | 不主动标记为精选 |
| `comments` | `false` 仅关闭本篇评论 | 遵循主题评论设置 |
| `outdated` | `false` 仅关闭本篇过时提示 | 遵循主题过时提示设置 |
| `outdated_days` | 设置本篇提醒天数，填写 1–36500 的整数 | 使用全站阈值 |
| `outdated_position` | `top` 放在正文前，`bottom` 放在正文后 | 使用全站位置 |
| `related_date_type` | 相关文章日期口径，可填 `created` 或 `updated` | 使用全站日期口径 |
| `navigation_order` | 相邻文章翻页方向，可填 `newest_first` 或 `oldest_first` | 使用全站翻页方向 |
| `sidebar_position` | 桌面阅读侧栏位置，可填 `left` 或 `right` | 使用全站侧栏位置 |
| `meta_date_type` | 文章页头部日期，可填 `created`、`updated` 或 `both` | 使用全站头部日期设置 |
| `meta_word_count` | 设为 `true` 或 `false`，显示或隐藏本篇字数 | 使用全站字数显示设置 |
| `meta_reading_time` | 设为 `true` 或 `false`，显示或隐藏本篇预计阅读时间 | 使用全站阅读时间显示设置 |
| `code_copy` / `code_language` | 分别控制本篇代码工具栏的复制按钮和语言标签，接受 `true` 或 `false` | 使用各自的全站设置 |
| `code_viewer` / `code_start_collapsed` | 分别控制本篇代码工具栏的「放大查看」入口和长代码的初始折叠状态，接受 `true` 或 `false` | 使用各自的全站设置 |
| `code_height_limit` | 用正整数指定本篇代码折叠高度，单位为 px。设为 `false` 恢复按行数判断 | 使用全站折叠高度设置 |

例如要保留列表封面但隐藏文章顶部大图，可以同时写 `cover: /images/posts/first-post.jpg` 和 `top_img: false`。文章 `comments: true` 不会绕过全站 `comments.enable: false`。

## 2. 所有文章共用的阅读设置

以下代码写到 **`_config.morii.yml`** 的同一个 `article:` 分组中：

```yaml
article:
  nav_title: false
  sidebar_position: right
  meta:
    date_type: both
    word_count: false
    reading_time: true
  resume:
    enable: true
  share:
    enable: true
  print:
    enable: true
  reading_settings: true
  navigation: true
  navigation_order: newest_first
  outdated:
    enable: true
    days: 365
    position: top
  related:
    enable: true
    limit: 3
    date_type: created
  code:
    style: classic
    theme: dark
    copy: true
    language: true
    viewer: true
    collapse: true
    start_collapsed: true
    height_limit: false
    lines: 18
```

| 字段 | 默认值 | 功能与使用提示 |
| --- | --- | --- |
| `article.nav_title` | `false` | 设为 `true` 后，滚过正文标题时在顶部导航显示文章名，滚回后恢复站点名称 |
| `article.sidebar_position` | `right` | 桌面阅读侧栏位置，设为 `left` 时放在正文左侧 |
| `article.meta.date_type` | `both` | 文章页头部日期。 `created` 显示发布日期，`updated` 显示更新时间，`both` 同时显示两个日期 |
| `article.meta.word_count` | `false` | 在文章页头部显示正文字数 |
| `article.meta.reading_time` | `true` | 在文章页头部显示预计阅读时间 |
| `article.resume.enable` | `true` | 记录阅读位置，再次打开文章时可继续阅读 |
| `article.share.enable` | `true` | 显示文章分享功能；关闭后仍保留“复制文章链接”按钮 |
| `article.print.enable` | `true` | 显示打印 / 导出 PDF 工具，通过浏览器打印流程保存 |
| `article.reading_settings` | `true` | 允许访客调整字号和专注阅读模式 |
| `article.navigation` | `true` | 显示上一篇、下一篇；需要存在相邻文章 |
| `article.navigation_order` | `newest_first` | `newest_first` 的下一篇指向较旧文章，`oldest_first` 的下一篇指向较新文章 |
| `article.outdated.enable` | `true` | 根据文章更新时间显示内容可能过时的提示 |
| `article.outdated.days` | `365` | 过时提示天数阈值，使用正整数 |
| `article.outdated.position` | `top` | 提醒位置，`top` 在正文前，`bottom` 在正文后 |
| `article.related.enable` | `true` | 显示相关文章 |
| `article.related.limit` | `3` | 相关文章数量，范围 1–6 |
| `article.related.date_type` | `created` | 显示发布日期或更新时间，可填 `created` 或 `updated` |
| `article.code.collapse` | `true` | 为超过行数阈值的代码块提供折叠按钮 |
| `article.code.start_collapsed` | `true` | 开启折叠时决定长代码的初始状态。设为 `false` 时默认展开，访客仍可手动折叠 |
| `article.code.height_limit` | `false` | 设为正整数后按实际渲染高度折叠，单位为 px。默认按行数判断 |
| `article.code.style` | `classic` | 外观：`classic`、`mac`、`minimal` |
| `article.code.theme` | `dark` | 配色：`dark`、`light`、`auto`；`auto` 跟随站点深浅模式 |
| `article.code.lines` | `18` | 代码折叠行数阈值，范围 5–100，建议从默认值开始 |
| `article.code.word_wrap` | `false` | 默认自动换行；访客仍可按代码块切换 |
| `article.code.copy` | `true` | 显示代码块和放大窗口里的复制按钮 |
| `article.code.language` | `true` | 显示代码工具栏的语言标签 |
| `article.code.viewer` | `true` | 在支持原生弹窗的浏览器中显示「放大查看」 |

例如只想关闭打印功能，修改 `article.print.enable` 即可，不需要关闭全部阅读工具。`reading_settings` 和 `navigation` 直接接受布尔值，**不要在它们下面再套一层 `enable`**。

`article.navigation_order` 控制按发布日期生成的相邻文章链接。单篇可在 Front Matter 使用 `navigation_order` 覆盖，系列内的前后篇仍按系列章节顺序排列。

`article.sidebar_position` 用于桌面文章页。单篇可在 Front Matter 使用 `sidebar_position` 覆盖。手机和专注阅读继续使用单栏布局。

单篇文章可在 Front Matter 使用 `meta_date_type` 覆盖头部日期设置，例如 `meta_date_type: updated`。如果 Hexo 未提供更新时间，头部的更新日期使用发布日期。

正文字数在生成站点时计算，汉字按字计，其余文字和数字按连续词计。代码块、图注和通过 `hideInline` 隐藏的答案不计入字数。加密文章省略字数和预计阅读时间。

## 3. 稍后阅读

```yaml
reading_list:
  enable: true
```

开启后主题会生成 `/reading-list/`，并在文章页提供“加入稍后阅读”入口。无需自己创建同名页面。访客可以在清单页搜索、导入和导出收藏。

开启文章续读后，「稍后阅读」会显示收藏文章上次读到的百分比，也可以勾选「仅显示有阅读进度的文章」并配合关键词筛选。打开文章后，可通过文章页的「继续上次阅读」回到对应位置。文章更新、进度过期或清除后，清单会保留收藏并去掉旧进度。

阅读清单、阅读进度和字号偏好保存在**访客当前浏览器的本地存储**，不会自动同步到手机或另一台电脑。清理站点数据后记录可能消失；迁移收藏可先导出清单。浏览器禁止存储时，相应功能会受影响。

## 4. 相关文章为什么没有出现？

相关文章按共同标签和分类匹配，共同标签的权重更高；没有匹配文章就不显示。建议先给至少两篇公开文章设置一个相同标签，再查看文章底部。加密文章不参与推荐。

同等相关性下，较新的文章排在前面。设置 `article.related.date_type: updated` 后，卡片显示更新时间，并按该时间排序。缺少有效更新时间时使用发布日期。单篇可通过 `related_date_type` 覆盖全站设置。

## 5. 目录如何设置？

目录从正文标题生成。正文使用 `## 二级标题`、`### 三级标题`，不要只是加粗文字。文章标题已经由 Front Matter 的 `title` 提供，正文一般从 `##` 开始。

在 `_config.morii.yml` 的 `article` 下设置 `toc.enable` 和 `toc.scroll_percent`。两项默认开启，分别控制文章目录和目录旁的阅读百分比。文章顶部进度条独立显示。

单篇文章可在 Front Matter 中用 `toc: false` 隐藏目录，或用 `toc_scroll_percent: false` 仅隐藏目录旁的百分比。也可以用 `true` 覆盖全站的关闭设置。桌面侧栏、移动端目录和无 JavaScript 时的折叠目录使用相同配置。

设置 `article.toc.style_simple: true` 后，桌面文章侧栏只显示目录，适合长教程。它默认关闭，单篇可用 `toc_style_simple: true` 或 `false` 覆盖。目录关闭时使用常规侧栏。手机继续使用弹出的章节目录。

文章有 10 个及以上章节时，目录会显示“筛选章节”输入框。输入标题里的关键词即可缩小范围，多个关键词用空格隔开。点击结果跳转到正文，也可以在输入框按向下方向键选中首个结果，再按回车跳转。清空输入恢复完整目录。

## 6. 支持作者

在 `_config.morii.yml` 的 `article.reward` 中开启文末的「支持作者」。每个方法填一个 `label`，再填二维码 `qr`、跳转地址 `url`，或同时填写两者。

```yaml
article:
  reward:
    enable: true
    text: 感谢你支持我继续写作。
    methods:
      - label: 微信赞赏
        qr: /images/wechat-reward.png
      - label: 赞助页面
        url: /support/
```

`qr` 和 `url` 支持 HTTP(S) 地址和 `/` 开头的站内路径。只填写 `qr` 时，按钮会打开二维码原图。入口默认关闭，也可在单篇文章的 Front Matter 写 `reward: false` 隐藏。

## 7. 怎么验证这些功能？

1. 生成博客，打开一篇包含多个标题、长代码块和封面的文章。
2. 检查封面和目录，点击目录跳转，展开代码。
3. 滚动阅读一段内容后离开再返回，检查继续阅读提示。
4. 点击“加入稍后阅读”，打开 `/reading-list/` 确认记录存在。
5. 打开打印预览，检查标题、正文和来源网址；分享网址错误时回到 `_config.yml` 检查 `url`。

过时提示不出现时，先看文章的 `updated` 和 `outdated`，不要只看全局开关。

## 技术写作增强

### 代码块外观与配色

在博客 `_config.morii.yml` 中选择默认外观，原有 Markdown 围栏代码块无需修改：

```yaml
article:
  code:
    style: mac
    theme: auto
    collapse: true
    lines: 18
```

| 外观 | 效果 |
| --- | --- |
| `classic` | 经典工具栏，默认显示语言和复制按钮 |
| `mac` | 带三色装饰圆点的窗口标题栏与轻阴影 |
| `minimal` | 简洁边框和透明工具栏背景 |

默认仍是 `classic` + `dark`。需要跟随站点的浅色 / 深色切换时，使用 `theme: auto`；固定 `light` 或 `dark` 则保持对应配色。文件名、行号、行高亮、复制和长代码折叠在三种样式中均可使用。

单篇文章可在原有 Front Matter 中覆盖：

```yaml
code_style: minimal
code_theme: auto
```

单个代码块可使用 `codefile` 的第 4、5 个参数：

```text
{% codefile app.js, javascript, 2, mac, auto %}
const theme = 'Morii';
console.log(theme);
{% endcodefile %}
```

前三个参数依次是文件名、代码语言、高亮行；不需要行高亮时保留空位，例如 `app.js, javascript, , mac, auto`。第 4、5 个参数可省略，继承文章或全站设置。

优先级为：单个代码块 > 单篇文章 > 全站配置。非法文章设置会提示并继承全站设置，非法全站字段回退对应默认值；代码块中的非法值忽略并继承文章设置。样式只接受表格中的名称，不执行自定义 CSS 或外部脚本。

代码样式使用本地 CSS，只在文章页加载。无 JavaScript 时保留代码与配色；复制和折叠按钮需要 JavaScript。打印时隐藏工具栏并展开全部代码。

### 代码自动换行

设置 `article.code.word_wrap: true` 可默认开启自动换行；单篇文章可用 Front Matter 的 `code_word_wrap: true` 或 `false` 覆盖。工具栏的“自动换行”按钮只影响当前代码块，支持键盘操作，不会改变复制得到的原始代码。换行时暂时隐藏行号，避免折行后行号错位；关闭换行后恢复。换行和折叠可同时使用，折叠高度仍按预览行数限制；按钮中的总行数按原始代码计算。无 JavaScript 时保留原始代码展示。

### 放大查看代码

代码工具栏的「放大查看」会打开独立阅读窗口，完整显示当前代码块，并提供自动换行和已启用的复制功能。按 Esc 或使用关闭按钮可返回原来的代码块。可设置 `article.code.viewer: false` 隐藏入口，或在单篇 Front Matter 中用 `code_viewer` 覆盖。

### 长代码的初始状态

长代码默认折叠。设置 `article.code.start_collapsed: false` 后，代码默认展开，读者仍可手动折叠。单篇可用 `code_start_collapsed` 覆盖。若关闭 `article.code.collapse`，代码始终展开，折叠按钮也会隐藏。

例如设置 `article.code.height_limit: 280`，渲染高度超过 280 px 的代码块才会提供折叠按钮，折叠预览最多显示 280 px。自动换行和窗口尺寸变化会重新判断是否超限。单篇可用 `code_height_limit` 覆盖，设为 `false` 后按 `article.code.lines` 判断。

## 文章版权与源文件编辑

参考 Butterfly 的文章归属与编辑入口设计，Morii 提供以下可选设置。合并到博客 `_config.morii.yml` 的同一个 `article:` 下：

```yaml
article:
  copyright:
    enable: true
    author_url: https://example.com/about/
    license: '你的许可协议名称'
    license_url: https://example.com/license/
  edit:
    enable: true
    url: https://github.com/your-name/blog/edit/main/source/{path}
```

两项默认关闭。请自行决定许可协议并填写自己的地址。版权卡片显示作者、原文链接和已填写的协议；协议地址留空时显示纯文本。作者优先使用文章 `author`，否则使用博客 `_config.yml` 的 `author`。原文链接使用站点 `url`、`root` 和文章固定链接，请先正确配置站点地址。卡片在无 JavaScript 和打印时也可显示。

编辑地址中的 `{path}` 自动替换为 `source/` 下的真实文件路径（如 `_posts/中文文章.md`），各路径片段会进行 URL 编码，不受文章 `permalink` 影响。请将示例中的账号、仓库和分支替换为实际博客源码仓库；点击后跳转仓库平台，由平台处理登录与编辑权限。未配置占位符、源文件路径缺失或地址无效时隐藏入口。运行 `hexo morii:check` 可检查全局配置。

单篇文章可关闭相应功能：

```yaml
copyright: false
edit: false
```

转载或特约文章可覆盖版权卡片字段：

```yaml
author: 特约作者
copyright:
  author: 原作者
  author_url: https://example.com/author/
  license: 单篇许可名称
  license_url: https://example.com/license/
```

单篇覆盖不会开启全局已关闭的版权卡片。以上文本均作为纯文本输出；作者、许可和编辑链接仅接受不含凭据的完整 HTTP(S) 地址。

提示块、代码文件名与行高亮、Mermaid 及数学公式的用法见[技术文章增强](/config/iteration#技术文章)。

## 系列与响应式封面

文章系列、专题资料和封面候选图见[系列、响应式封面与大型站点搜索](/config/content)。
