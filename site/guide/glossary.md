# 新手术语表

第一次接触 Hexo 时，可以把这页当成随时查看的小抄。

| 词语 | 在这份教程中的意思 |
| --- | --- |
| 博客根目录 | 你运行 `hexo init` 后得到的 `my-blog/` 文件夹；里面有 `_config.yml` 和 `package.json` |
| 主题目录 | npm 安装的 `node_modules/hexo-theme-morii/`，或 Git 安装的 `themes/morii/` |
| 文档站 | 你正在阅读的 Morii 使用说明网站；与自己的博客分开 |
| `_config.yml` | 博客的 Hexo 配置，例如站名、作者、网址和主题名 |
| `_config.morii.yml` | 博客根目录里的 Morii 个人配置，可覆盖主题默认值 |
| `source/_posts/` | 文章 Markdown 文件存放处 |
| `source/_data/` | 相册、友链、即刻等 YAML 数据文件存放处 |
| `source/album/index.md` | `/album/` 对应的页面文件；相册内容仍需 `source/_data/album.yml` |
| Front Matter | Markdown 开头两条 `---` 之间的标题、日期、`type` 等设置 |
| `type` | Morii 判断页面样式的字段，例如 `type: album` |
| `public/` | 在博客运行 `npx hexo generate` 后得到的静态网站文件 |
| YAML | 配置和数据文件使用的格式；依靠空格缩进表示层级 |

看到文档中的 `my-blog/`、`你的用户名` 或 `你的服务地址`，它们是**示例占位文字**，需要替换为你自己的值。以 `/` 开头的地址（如 `/images/avatar.png`）是网站路径；以 `source/` 开头的是电脑上的文件路径。
