# 初始化向导：按需创建页面

先安装主题和 `hexo-renderer-pug`，在博客根目录 `_config.yml` 设置 `theme: morii`。以下命令都在博客根目录运行，需要包含此功能的 Morii 版本。

站名、作者、语言、首页标题和介绍直接沿用 Hexo 的设置，不必再复制整份主题配置。评论、天气、贡献日历和在线歌单默认不启用。

## 交互选择

```bash
npx hexo morii:init
```

选择需要的页面；直接回车创建关于、分类、标签。选择评论页后可填写自己的 Twikoo 或 Waline 服务。选择音乐馆后可填写自己的歌单，留空则稍后配置自有音频。

## 命令行选择

先查看计划，确认路径和 YAML：

```bash
npx hexo morii:init --pages about,categories,tags,music,cinema,series --dry-run
```

去掉 `--dry-run` 即可创建。下面使用默认选择，不弹出问题：

```bash
npx hexo morii:init --yes
```

可选页面：`about`、`categories`、`tags`、`essay`、`album`、`link`、`music`、`cinema`、`comments`、`fcircle`、`series`。`--pages none` 跳过页面；重复选择会去重。电影院和专题页由主题生成器提供，不会重复创建 Markdown 页面。

| 参数 | 用法 |
| --- | --- |
| `--comments waline --server-url https://comments.example.com` | 启用自己的 Waline 服务，并添加留言板 |
| `--comments twikoo --server-url YOUR_ENV_ID` | 启用自己的 Twikoo 服务，并添加留言板 |
| `--github YOUR_USERNAME` | 启用指定用户的贡献日历 |
| `--music-id YOUR_PLAYLIST_ID --music-server netease` | 启用指定平台歌单，并添加音乐馆；不填平台时为 `tencent` |
| `--output _config.morii.review.yml` | 指定建议配置的文件名 |

表格中的地址、用户名和 ID 都应换成自己的资料。向导不会注册评论服务、获取凭证、安装插件或发布网站。

## 已有文件如何处理

- 已有页面正文、Front Matter、数据文件和个人配置保留原文。已有 `.yaml` 或 `.json` 数据不会再创建同名 `.yml`。
- `_config.morii.yml` 已存在且内容不同，会生成 `_config.morii.generated.yml` 供手动合并。建议文件不会自动生效，也不会替换菜单或删除你的未知字段和注释。
- 建议文件也存在且内容不同，命令会停止；使用新的 `--output` 文件名。相同参数重复执行会跳过内容相同的文件。
- 页面使用博客 `source_dir`，支持博客内的自定义目录。为避免写错位置，不通过符号链接写入，也不支持博客外的源目录。
- 识别已有页面的站内绝对 `permalink` 并用于建议菜单；已有页面的 `type` 不会自动修改，请自行确认与 Morii 对应。

## 生成和检查

新建配置需要重新启动 Hexo，让它读取文件：

```bash
npx hexo morii:check
npx hexo generate
```

关于、相册、片单等数据从空内容开始，按对应功能文档填写。归档、分类和标签仍需安装相应 Hexo 生成器。已有用户先阅读[升级与配置迁移](/guide/updating)。
