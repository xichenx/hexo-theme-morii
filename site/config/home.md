# 首页内容与推荐设置

本页修改博客根目录的 `_config.morii.yml`。首页的介绍、推荐入口、精选文章、即刻速览与贡献日历是不同模块，可以分别配置。大部分首页展示模块只出现在第一页，翻到第二页后主要显示文章列表。

## 1. 首页首屏主卡与随手记

```yaml
hero:
  eyebrow: 技术与生活
  title: [你好，我是小林。, 欢迎来到我的笔记本。]
  intro: 分享编程、读书和生活中的小发现。
  signature: 小林的笔记
  primary:
    label: 浏览文章
    url: '#latest'
  secondary:
    label: 关于我
    url: /about/
  note: 今天也记录一点值得记住的事情。
```

| 字段 | 页面位置 |
| --- | --- |
| `hero.eyebrow` | 标题上方的标签 |
| `hero.title.0` | 首页大标题第一行 |
| `hero.title.1` | 首页大标题第二行，带强调样式 |
| `hero.intro` | 大标题下方的首页专用简介 |
| `hero.signature` | 主卡右下角的署名 |
| `hero.primary`、`hero.secondary` | 主按钮与次按钮，可分别设置 `label` 和 `url` |
| `hero.note` | 右侧“随手记”卡片的文字 |

未设置标题时，使用博客标题和副标题。`hero.title` 支持两项字符串列表、单个字符串和原来的 `0:`、`1:` 写法。首页简介默认沿用全站 `intro`，署名默认沿用品牌名。将 `eyebrow`、`intro`、`signature`、`primary` 或 `secondary` 设为 `false` 可隐藏对应内容。

按钮支持首页锚点、以 `/` 开头的站内路径和完整 HTTP(S) 链接。主按钮默认跳到首页文章列表。次按钮默认在关于页存在时显示，填写自定义地址后可链接到其他页面。「看看即刻」会在即刻页未创建时链接到文章归档。

### Morii 主题推广卡

首页第一页默认由主题推广卡独占首屏右侧，窄屏时推广卡排在主卡片下方。若想同时展示「随手记」和「博客手账」，可将 `journal_below` 设为 `true`，两张卡就会排在首屏卡片下方。关闭推广卡后，两张卡恢复到原来的首屏位置。

整张推广卡链接到 `docs_url`，源码按钮单独链接到 `repository_url`。只配置源码地址时，整张卡链接到源码。

| 想看到的首页布局 | 对应配置 |
| --- | --- |
| 推广卡独占首屏右侧 | `enable: true`、`journal_below: false`（默认） |
| 首屏展示推广卡，下方展示两张手账卡 | `enable: true`、`journal_below: true` |
| 随手记和博客手账回到首屏 | `enable: false` |

五彩字标首次进入视口时会沿笔画写出。手机端用更短的书写节奏，主标题和首页卡片直接呈现。关闭全站动效 `motion.enable` 或开启系统的减少动态效果时，直接显示完整字标。

```yaml
home:
  theme_promo:
    enable: true
    journal_below: false
    docs_url: 'https://github.com/xichenx/hexo-theme-morii#quick-start'
    repository_url: 'https://github.com/xichenx/hexo-theme-morii'
```

两个链接可填写完整 HTTP(S) 地址或以 `/` 开头的站内路径。将其中一个设为 `false` 可隐藏对应入口。

## 2. “从这里开始”三张入口卡片

默认不展示入口卡片。准备好目标页面后，可以添加任意数量的卡片，例如：

```yaml
featured:
  - title: 全部文章
    description: 按时间翻阅我的笔记
    path: /archives/
    icon: archive
    tone: blue
  - title: 分类阅读
    description: 找到自己感兴趣的话题
    path: /categories/
    icon: categories
    tone: violet
  - title: 生活随笔
    description: 留住日常的小片段
    path: /essay/
    icon: sun
    tone: orange
```

| 字段 | 作用 | 填写方法 |
| --- | --- | --- |
| `title` | 卡片标题 | 简短文字 |
| `description` | 标题下的说明 | 一句话 |
| `path` | 点击后的地址 | 真实页面路径或完整 HTTPS 地址 |
| `icon` | 图标 | 如 `code`、`book`、`sparkles`、`sun`、`archive`、`categories` |
| `tone` | 卡片色调 | 内置 `blue`、`violet`、`orange` |

使用 `featured: false` 隐藏全部卡片与区域标题。卡片单项没有 `enable` 开关；若个人覆盖文件中仍有旧列表，请删除不需要的条目。

## 3. “值得一读”精选文章

它与上面的三张入口卡片不同：这里展示的是已经发布的文章。

**新手推荐：在文章中标记。**保留起步配置中的：

```yaml
home:
  selected_posts: false
  selected_limit: 3
```

打开要推荐的文章，在顶部 Front Matter 内添加：

```yaml
featured: true
```

主题会优先选择被标记的文章；`selected_limit` 控制显示数量，范围为 **1–6**，默认 3。为文章填写 `cover` 可让精选卡片显示封面。

### 手动指定顺序

想固定文章顺序时，可将 `selected_posts: false` 替换为文章标题、生成路径或 slug 的列表。以下标题都是占位示例，需要换成你已经发布的文章：

```yaml
home:
  selected_limit: 3
  selected_posts:
    - 我的第一篇文章
    - 我的第二篇文章
    - 我的第三篇文章
```

匹配是精确的，标点、大小写、路径都要一致。字符串列表会与默认列表合并，默认指定的文章标题也可能保留；想避免这类名单合并，优先用前面的 `selected_posts: false` 加文章 `featured: true` 方案。

### 为什么取消名单后还有精选文章？

当前选择顺序是：

1. 匹配 `home.selected_posts` 中的文章。
2. 加入 Front Matter 标记 `featured: true` 的文章。
3. 如果前两步一篇都没选中，使用最新文章补充。

因此 `home.selected_posts: false` 是取消手动名单，**不是隐藏区块**。当前没有单独关闭“值得一读”的配置，`selected_limit: 0` 也不会关闭它。加密文章不会被选入。

## 4. 即刻速览和随机文章

在已有 `home:` 分组下合并以下字段：

```yaml
home:
  moments:
    enable: true
    limit: 5
  random:
    enable: true
    autoplay: true
```

| 字段 | 默认值 | 作用 |
| --- | --- | --- |
| `home.moments.enable` | `true` | 首页显示即刻速览 |
| `home.moments.limit` | `5` | 最多载入几条，范围 1–10 |
| `home.random.enable` | `true` | 显示“随便逛逛”文章推荐 |
| `home.random.autoplay` | `true` | 自动轮播文章，设为 `false` 后通过「换一篇」手动切换 |

即刻速览还需要 `source/_data/essay.yml` 中存在 `home_essay: true` 的分组；具体写法见[即刻页](/features/pages#_3-创建即刻页)。随机文章需要已有公开且未加密的文章；只有一篇时没有“换一篇”按钮。

启用自动轮播后，「随便逛逛」进入视口约每 7.5 秒切换一篇，标题、摘要和链接一起短距离滑动淡入淡出。悬停、键盘焦点进入卡片、卡片离开视口或切换标签页时会暂停。关闭主题动效或在系统中开启减少动态效果时，只能手动切换，内容立即更新。

## 5. 首页布局和贡献日历

- 想把最新文章改成等宽网格：设置 `appearance.layouts.home: grid`，见[外观与导航](/features/customization)。
- 想显示自己的 GitHub 贡献记录：设置 `github_calendar.user`，见[侧栏、小组件与页脚](/config/widgets)。
- 想调整一页显示几篇文章：修改 Hexo 的分页设置，不是 `home.selected_limit`；后者只控制精选区。

## 6. 检查清单

重新生成后打开首页第一页。检查两行标题是否正确、三张入口卡片能否打开、精选文章是否是自己的文章、即刻速览是否有数据。没有数据的模块可能不显示，这与开关未生效是两回事。

## 7. 归档月份索引

归档列表顶部的「按月份查找」按年份列出有文章的月份，并显示每月文章数。进入月归档后，索引会自动展开并标记当前月份。索引适用于时间树和分组归档布局，也能在禁用 JavaScript 时使用。

索引跟随 Hexo 博客根目录 `_config.yml` 的 `archive_generator.yearly` 和 `archive_generator.monthly`。两者开启时显示入口，关闭其中任一项时隐藏。归档地址沿用站点的 `archive_dir`。
