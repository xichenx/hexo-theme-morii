# 搜索、社交与评论

这几项可以在博客基本页面正常之后逐个开启。**站内搜索不需要申请服务**；社交链接只需要你自己的主页地址；评论则需要单独部署服务。

## 站内搜索

Morii 构建博客时会生成 `morii-search.json`。打开博客后点击搜索按钮，或按 **Ctrl+K / ⌘K**，即可搜索标题、正文、分类和标签。先写好[第一篇文章](/guide/first-post)，搜索它的标题来验证。

如果不想把文章正文放进索引，在 `_config.morii.yml` 中设置：

```yaml
search:
  content: false
  page_size: 10
```

此时仍能搜索标题、描述、摘要和分类标签；`content: false` 只排除完整正文，不会自动排除文章描述或摘要。未发布文章不会进入索引；加密文章不会把正文写进索引。若线上搜索失败，先尝试直接访问你博客域名下的 `/morii-search.json`，再检查站点的 `url` 和 `root`。部署在子目录时，该地址也需要带上站点前缀。

| 字段 | 默认值 | 作用 |
| --- | --- | --- |
| `search.content` | `true` | 是否把完整文章正文加入搜索索引 |
| `search.page_size` | `10` | 每批展示的搜索结果数量，范围 5–30 |

普通页面内容不在当前文章索引范围内。搜索新文章前需要重新生成博客；不要手工修改 `public/morii-search.json`，下次构建会覆盖它。主题自带搜索不需要额外安装第三方搜索插件。

## 添加自己的社交入口

准备好自己的主页地址后，把首次配置中的 `social: false` **替换为**：

```yaml
social:
  - name: GitHub
    icon: github
    url: https://github.com/你的用户名
    description: 在 GitHub 找到我
  - enable: false
```

把“你的用户名”换成真实用户名。第二项 `enable: false` 用来关闭默认的 CSDN 入口；当前 npm 版本会合并列表，**删掉第二项反而会让旧入口出现**。以后要添加自己的第二个社交账号，再把第二项写成完整的 `name`、`icon`、`url`、`description`。`url` 必须是完整的 `https://` 或 `http://` 地址。不需要社交入口就保留 `social: false`。

### 字段说明

| 字段 | 必填情况 | 作用 |
| --- | --- | --- |
| `enable` | 可省略 | `false` 时隐藏这一项，重新启用时改为 `true` |
| `name` | 必填 | 平台或入口名称 |
| `icon` | 可选 | 使用内置平台图标 / 标记 |
| `url` | 与 `qrcode` 至少有一个 | 完整的个人主页网址 |
| `qrcode` | 与 `url` 至少有一个 | 二维码图片的站内路径或完整网址 |
| `account` | 可选 | 展示的账号文字 |
| `description` | 可选 | 对入口的说明 |

内置 `icon` 值包括 `github`、`csdn`、`bilibili`、`wechat`、`weibo`、`zhihu`、`douyin`、`xiaohongshu`、`telegram`。不认识的值会退回名称文字标记，并不会自动下载新平台图标。

### GitHub 加微信二维码示例

把二维码图片放到 `source/images/wechat-qr.png`，然后**替换整个已有社交列表**：

```yaml
social:
  - enable: true
    name: GitHub
    icon: github
    url: https://github.com/你的用户名
    qrcode: ''
    account: 你的用户名
    description: 查看我的开源项目
  - enable: true
    name: 微信
    icon: wechat
    url: ''
    qrcode: /images/wechat-qr.png
    account: 你的微信号
    description: 扫码联系我
```

第二项 `url: ''` 很重要：它清除该位置继承的默认 CSDN 地址，避免微信二维码入口还带着旧链接。替换已有项时，也要清空不再需要的 `qrcode`。本例同时写 `enable: true`，方便从先前关闭的项重新启用。

保存并生成后，在作者卡片检查两个入口；二维码先单独打开图片地址，再查看入口的展示效果。

## 开启评论

Morii 支持 **Twikoo** 评论入口。评论需要你自己的 Twikoo 后端；不能沿用主题默认配置里的作者服务地址。先按 [Twikoo 官方部署指南](https://twikoo.js.org/quick-start.html)部署并验证后端，再把 `_config.morii.yml` 中的 `comments` 改为：

```yaml
comments:
  enable: true
  provider: twikoo
  env_id: https://twikoo.example.com
```

`env_id` 具体格式取决于你部署 Twikoo 的方式，按 [Twikoo 前端配置说明](https://twikoo.js.org/frontend.html)填写。Morii 的页面会显示“加载评论”按钮，由访客点击后加载评论脚本。若某篇文章不想显示评论，可在文章 Front Matter 添加 `comments: false`。如果还没准备好后端，保持 `comments.enable: false`。

### 按这个顺序接入

1. 先完成自己的 Twikoo 后端部署，取得环境标识或服务地址。
2. 把示例的 `https://twikoo.example.com` 换成真实值。它是占位地址，不能直接使用。
3. 保持 `provider: twikoo`；当前主题没有其他评论提供方的适配。
4. 在一篇文章中删除 `comments: false` 或改为 `comments: true`。
5. 重新生成，打开**这篇文章**，点击“加载评论”，确认表单能正常出现。

不要把管理密码、访问密钥写进 `env_id`，该值会出现在网页里。评论区是按需加载的，没有点击按钮就没显示表单属于正常行为。

| 现象 | 检查方法 |
| --- | --- |
| 完全没有评论区域 | 全局开关、`provider`、文章 / 页面 `comments` 是否正确 |
| 首页没有评论 | 首页、归档、分类、标签等列表页面本来就不展示该评论区域 |
| 有按钮，点击后失败 | 浏览器能否访问评论脚本和后端，后端地址是否填错 |
| 新评论没出现 | 查看评论服务的审核设置和后端状态 |
| 修改后仍连接旧服务 | 检查生成页面、平台构建和浏览器缓存 |

## 留言板怎么创建？

在博客根目录运行：

```bash
hexo new page comments
```

将 `source/comments/index.md` 写成下面的内容，并确保全局评论服务已可用：

```markdown
---
title: 留言板
comments: true
---

欢迎留言，分享你的想法。
```

直接访问 `/comments/` 检查，确认正常后再把链接加入[菜单或探索入口](/features/customization)。创建文件和添加菜单是两个步骤。

新增的搜索分片、阅读中控台、Waline 与最新评论配置见[增强配置说明](/config/iteration)。
