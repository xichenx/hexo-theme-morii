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

此时仍能搜索标题等信息。未发布文章不会进入索引；加密文章不会把正文写进索引。若线上搜索失败，先尝试直接访问你博客域名下的 `/morii-search.json`，再检查站点的 `url` 和 `root`。

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

把“你的用户名”换成真实用户名。第二项 `enable: false` 用来关闭默认的 CSDN 入口；当前 npm 版本会合并列表，**删掉第二项反而会让旧入口出现**。以后要添加自己的第二个社交账号，再把第二项写成完整的 `name`、`icon`、`url`、`description`。`url` 必须是完整的 `https://` 或 `http://` 地址。需要二维码时，可把图片放在博客 `source/images/`，再给该项增加 `qrcode: /images/二维码文件名.png`。不需要社交入口就保留 `social: false`。

## 开启评论

Morii 支持 **Twikoo** 评论入口。评论需要你自己的 Twikoo 后端；不能沿用主题默认配置里的作者服务地址。先按 [Twikoo 官方部署指南](https://twikoo.js.org/quick-start.html)部署并验证后端，再把 `_config.morii.yml` 中的 `comments` 改为：

```yaml
comments:
  enable: true
  provider: twikoo
  env_id: https://twikoo.example.com
```

`env_id` 具体格式取决于你部署 Twikoo 的方式，按 [Twikoo 前端配置说明](https://twikoo.js.org/frontend.html)填写。Morii 的页面会显示“加载评论”按钮，由访客点击后加载评论脚本。若某篇文章不想显示评论，可在文章 Front Matter 添加 `comments: false`。如果还没准备好后端，保持 `comments.enable: false`。
