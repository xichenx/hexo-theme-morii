# 首次配置

Morii 有两类配置文件，修改前先确认所在目录：

| 文件 | 用途 |
| --- | --- |
| 博客根目录 `_config.yml` | Hexo 站点设置，例如标题、网址和 `theme: morii` |
| 博客根目录 `_config.morii.yml` | Morii 的个人设置；推荐在这里覆盖主题默认值 |

## 换成自己的站点资料

在博客根目录创建 `_config.morii.yml`，先填入属于你的信息：

```yaml
brand: 我的博客
tagline: 记录想法与生活
intro: 欢迎来到我的博客。
avatar: /images/avatar.png
social: []
footer:
  runtime:
    enable: false
  filing:
    enable: false
github_calendar:
  enable: false
music:
  meting:
    enable: false
```

这里的头像示例要求你把图片放在**博客根目录**的 `source/images/avatar.png`。首次使用时请换成自己的头像地址；仅删除这一行仍会沿用主题默认头像。准备好自己的账号、建站时间、备案信息和歌单后，再逐项开启对应功能。

::: warning 上线前检查示例值
主题默认配置包含作者的头像、社交账号、备案、GitHub 账号、城市及音乐歌单等示例。请对照[完整默认配置](https://github.com/xichenx/hexo-theme-morii/blob/main/_config.yml)检查，并替换或关闭不属于你的内容。
:::

## 理解资源和数据目录

博客内容和个人数据放在**博客根目录**：

```text
my-blog/
├─ _config.yml
├─ _config.morii.yml
└─ source/
   ├─ images/
   └─ _data/
```

主题自带的 `source/` 是主题资源目录，更新主题时可能被替换。相册、友链等个人数据请放在博客的 `source/_data/`，详见[页面与数据文件](/features/pages)。

修改配置后重新运行 `npx hexo clean && npx hexo generate`；本地预览服务也建议重启。
