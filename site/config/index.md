# 配置手册：从哪里改，怎么确认生效

::: tip 这是按需查阅的手册
第一次接入，先按[5 步教程](/guide/)完成基础博客；想直接照抄文件，看[完整示例](/examples/)。本手册用于完成接入后查询字段和默认行为，不需要从头到尾配置一遍。
:::

这份手册讲的是 **Morii 博客主题的设置**。你正在阅读的文档站用 VitePress 构建；给自己的 Hexo 博客换头像、菜单和配色时，修改的是博客文件，不是文档站的 `site/.vitepress/config.mts`。

## 按你想做的事情查找

| 我想…… | 打开这页 | 主要配置 |
| --- | --- | --- |
| 改站名、作者、头像、Logo 和网址 | [基本信息与图片](/config/basic) | `brand`、`avatar`、`logo`、`favicon` |
| 改菜单、主题色、布局和动画 | [外观与导航](/features/customization) | `menu`、`explore`、`appearance`、`motion` |
| 改首页大标题、推荐卡片、精选文章 | [首页内容](/config/home) | `hero`、`featured`、`home` |
| 改文章封面、阅读工具和相关文章 | [文章与阅读](/config/article) | Front Matter、`article`、`reading_list` |
| 改公告、天气、贡献日历、页脚 | [侧栏、小组件与页脚](/config/widgets) | `sidebar`、`clock`、`github_calendar`、`footer` |
| 改搜索、社交账号、二维码、评论 | [搜索、社交与评论](/features/interaction) | `search`、`social`、`comments` |
| 配置歌单、歌词、视频和剧集 | [音乐馆与电影院](/features/media) | `music`、`cinema` |
| 添加关于、即刻、分类和标签页 | [创建常用页面](/features/pages) | 页面 `type`、`source/_data/` |
| 添加相册、友链和朋友圈 | [相册与友链](/features/album-links) | 数据文件、`friends_feed` |

## 1. 找到正确的文件

在 VS Code 中选择“文件 → 打开文件夹”，打开执行过 `hexo init` 的博客文件夹。它一般长这样：

```text
my-blog/
├── _config.yml             # Hexo 基本信息：标题、作者、网址
├── _config.morii.yml       # 你创建的 Morii 主题设置
├── package.json
├── source/
│   ├── _posts/             # 文章 Markdown 文件
│   ├── _data/              # 相册、友链、关于等 YAML 数据
│   └── images/             # 你自己的头像、封面和 Logo
└── themes/ 或 node_modules/ # 主题安装位置
```

| 文件 | 什么时候修改 | 例子 |
| --- | --- | --- |
| 博客根目录 `_config.yml` | 配置 Hexo 站点 | `title`、`author`、`url`、`root`、`theme` |
| 博客根目录 `_config.morii.yml` | 配置 Morii 外观和功能 | `avatar`、`menu`、`article` |
| `source/_posts/文章.md` 顶部两条 `---` 之间 | 仅设置这一篇文章 | `cover`、`comments`、`featured` |
| `source/_data/名称.yml` | 修改某个页面的数据 | 相册照片、友链列表、片单 |

除非特别说明，手册中的主题 YAML 示例都写入 `_config.morii.yml`。不需要在外面包一层 `theme_config:`，也不要把它们写到 Hexo 的 `_config.yml` 里。

## 2. 没有配置文件时，从模板开始

第一次安装可直接运行[初始化向导](/guide/initialization)，或使用[第 2 步的最小配置](/guide/first-config)。完成接入后，想查阅更多常用开关，可以下载 [详细配置模板](/examples/_config.morii.yml)，按需合并到博客根目录的 `_config.morii.yml`。

详细模板关闭未填写的外部服务，保留常用阅读功能；它与入门最小配置的用途不同，不需要在做完入门后再整体覆盖一次。已经配好的菜单应继续保留。模板不会替你创建页面、注册服务或上传图片。

已有配置时先备份，再按需要合并模板里的字段。**不要直接覆盖已经填好的账号、评论服务和个人设置。**

## 3. 学会合并一个小片段

例如你已经有：

```yaml
home:
  selected_posts: false
```

现在想关闭首页“随便逛逛”，应改成：

```yaml
home:
  selected_posts: false
  random:
    enable: false
```

不要在文件末尾再添加第二个 `home:`。同一层级的同名键应该只出现一次。`article.reading_settings` 这种带点的写法表示字段层级，实际 YAML 应写成：

```yaml
article:
  reading_settings: true
```

### YAML 的六条实用规则

1. 每层缩进用 **2 个空格**，不要按 Tab。
2. 使用英文冒号 `:`，后面加空格；不要用中文冒号 `：`。
3. 开关写 `true` 或 `false`，不要写成带引号的 `'false'`。
4. 颜色和日期建议加引号，例如 `'#5568f6'`、`'2026-10-21T00:00:00+08:00'`。
5. 文本中包含 `: ` 或 `#` 时用引号包住整句；多行文字使用 `|`。
6. 网页里的 ```yaml 和结尾 ``` 是代码块标记，不要复制进文件。

## 4. 理解默认值和列表合并

未填写的主题字段会使用主题默认值。**删除一行不等于关闭功能**：例如删除 `motion` 分组会使用默认开启的入场动画，关闭应写 `motion.enable: false`。评论等外部服务默认关闭。

::: warning 当前版本的列表合并行为
Hexo 8 合并博客主题配置时，列表可能与默认值合并。空列表 `[]` 不会清除默认列表；对象列表按位置合并，短列表可能保留剩下的默认项，字符串列表也可能保留默认文字。

- 关闭整个菜单、探索链接、社交或首页推荐卡片：分别用 `menu: false`、`explore: false`、`social: false`、`featured: false`。
- 开启菜单、探索链接、首页推荐卡片：使用对应教程里的完整列表，默认菜单仅首页、文章两项，探索和推荐卡片默认为空。已有覆盖文件的列表仍需注意合并。
- 社交链接支持单项 `enable: false`；菜单和推荐卡片没有这个单项开关。
- 首页标题支持字符串、两项列表及原来的 `0:` / `1:`；留空沿用站点标题和副标题。
- `home.selected_posts: false` 只取消指定文章名单，**不会关闭“值得一读”区块**，详见[首页内容](/config/home)。
:::

本文按当前仓库实现说明。通过 npm 安装的版本可能落后于仓库，新增图片或功能需确认已包含在你的安装版本中。升级步骤见[更新主题](/guide/updating)。

## 5. 保存、生成、检查

在正在运行 `hexo server` 的终端按 **Ctrl+C** 停止服务。确认终端位于博客根目录，然后依次运行：

```bash
hexo clean
hexo generate
hexo server
```

打开终端显示的本地网址，通常是 `http://localhost:4000/`。先确认生成没有报错，再检查刚修改的区域。更换图标后浏览器可能保留旧图标，可以用无痕窗口确认。

本地正确后，按[发布博客](/guide/publishing)中你使用的平台教程上传变更。修改本地文件不会自动改变已上线页面，在线平台也需要完成一次新构建。

## 6. 按症状排查

| 现象 | 优先检查 |
| --- | --- |
| 报 `duplicated mapping key` | 同一层级重复写了 `home:`、`music:` 等字段 |
| 报缩进或 YAML 解析错误 | Tab、中文冒号、漏写引号、列表项没对齐 |
| 页面仍有作者的信息 | 是否复制了旧配置中的示例、遗留站点数据、修改错文件 |
| 菜单有了，点击后 404 | 是否真正创建了页面；配置菜单不会生成页面 |
| 图片不显示 | 文件是否在博客 `source/` 下，路径是否误写 `source`，大小写是否一致 |
| 本地正常，线上没变化 | 是否提交文件、平台构建是否成功、是否查看了正确域名 |
| 部分模块开关为 `true` 却没内容 | 模块是否还需要文章、数据文件或外部接口 |

更多问题见[常见问题](/troubleshooting)。
