# 首页内容与推荐设置

本页修改博客根目录的 `_config.morii.yml`。首页的介绍、推荐入口、精选文章、即刻速览与贡献日历是不同模块，可以分别配置。大部分首页展示模块只出现在第一页，翻到第二页后主要显示文章列表。

## 1. 首页大标题与随手记

```yaml
hero:
  title:
    0: 你好，我是小林。
    1: 欢迎来到我的笔记本。
  note: 今天也记录一点值得记住的事情。
intro: 分享编程、读书和生活中的小发现。
```

| 字段 | 页面位置 |
| --- | --- |
| `hero.title.0` | 首页大标题第一行 |
| `hero.title.1` | 首页大标题第二行，带强调样式 |
| `hero.note` | 右侧“随手记”卡片的文字 |
| `intro` | 大标题下方的介绍 |

这里的 `0:`、`1:` 是为覆盖当前版本的默认标题而使用的写法，不要改成带两个字符串的列表。首页“关于我”和“看看即刻”入口分别指向 `/about/`、`/essay/`，记得[创建对应页面](/features/pages)。

## 2. “从这里开始”三张入口卡片

首次配置用 `featured: false` 隐藏默认卡片。准备好目标页面后，将它替换为下面完整的三项：

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

当前默认有三项，短列表可能保留剩余默认项；请完整覆盖三项，或使用 `featured: false` 隐藏所有卡片。这个开关会清空卡片，当前模板仍会保留“从这里开始”标题区域。卡片单项没有 `enable` 开关。

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
```

| 字段 | 默认值 | 作用 |
| --- | --- | --- |
| `home.moments.enable` | `true` | 首页显示即刻速览 |
| `home.moments.limit` | `5` | 最多载入几条，范围 1–10 |
| `home.random.enable` | `true` | 显示“随便逛逛”文章推荐 |

即刻速览还需要 `source/_data/essay.yml` 中存在 `home_essay: true` 的分组；具体写法见[即刻页](/features/pages#_3-创建即刻页)。随机文章需要已有公开且未加密的文章；只有一篇时没有“换一篇”按钮。

## 5. 首页布局和贡献日历

- 想把最新文章改成等宽网格：设置 `appearance.layouts.home: grid`，见[外观与导航](/features/customization)。
- 想显示自己的 GitHub 贡献记录：设置 `github_calendar.user`，见[侧栏、小组件与页脚](/config/widgets)。
- 想调整一页显示几篇文章：修改 Hexo 的分页设置，不是 `home.selected_limit`；后者只控制精选区。

## 6. 检查清单

重新生成后打开首页第一页。检查两行标题是否正确、三张入口卡片能否打开、精选文章是否是自己的文章、即刻速览是否有数据。没有数据的模块可能不显示，这与开关未生效是两回事。
