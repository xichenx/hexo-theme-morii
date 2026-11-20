# 侧栏、小组件与页脚

以下主题配置都位于博客根目录的 `_config.morii.yml`。沿用[首次配置](/guide/first-config)的读者，可以在准备好自己的资料后逐项开启。

## 1. 侧栏公告、标签和统计

```yaml
sidebar:
  announcement:
    enable: true
    title: 小站公告
    content: 欢迎来坐坐，最近正在整理学习笔记。
  tags:
    enable: true
    limit: 12
  stats:
    enable: true
```

| 字段 | 默认值 | 作用 |
| --- | --- | --- |
| `sidebar.announcement.enable` | `false` | 是否显示公告；还需要非空 `content` |
| `sidebar.announcement.title` | 空 | 留空时使用内置公告标题 |
| `sidebar.announcement.content` | 空 | 请换成自己的文字，按普通文本显示 |
| `sidebar.tags.enable` | `true` | 显示标签漫游，需要文章有标签 |
| `sidebar.tags.limit` | `12` | 最多展示的标签数，范围 1–40 |
| `sidebar.stats.enable` | `true` | 显示文章数、公开内容字数、最早文章日期 |

“小站档案”是静态内容统计，**不是访问量统计**。作者卡片姓名和简介分别来自 Hexo `_config.yml` 的 `author` 和 `description`。当前没有一个开关能关闭整个侧栏；上面的开关只控制对应模块。

## 2. 时钟和天气

下面以北京的坐标为示例，请按自己的城市修改：

```yaml
clock:
  enable: true
  city: 北京市
  latitude: 39.90
  longitude: 116.40
  timezone: Asia/Shanghai
```

| 字段 | 作用 | 注意 |
| --- | --- | --- |
| `enable` | 显示时钟 / 天气卡片 | 不需要就设 `false` |
| `city` | 卡片显示的城市名 | 仅改名称不会改变天气位置 |
| `latitude` | 天气查询的纬度 | 数值，范围 -90 到 90 |
| `longitude` | 天气查询的经度 | 数值，范围 -180 到 180 |
| `timezone` | 时钟使用的时区 | 如 `Asia/Shanghai`，不要写城市中文名 |

默认关闭且不预填经纬度。只设置 `enable: true` 时显示时钟，时区沿用博客 `_config.yml`。完整填写经纬度后才请求 Open-Meteo，`city` 文本不参与坐标查询。

天气由访客浏览器联网获取。构建成功并不代表天气请求一定成功；天气失败时检查网络和浏览器控制台。经纬度无效时不请求天气；时区无效时回退 UTC，配置检查会提示。`clock.timezone` 可单独覆盖组件时区。

## 3. GitHub 贡献日历

把 `user` 改为自己的 GitHub 登录用户名，而不是个人主页上的显示昵称：

```yaml
github_calendar:
  enable: true
  user: your-github-username
```

主题会在首页请求贡献数据。无需填写 GitHub Token。当前默认接口模板是：

```yaml
github_calendar:
  enable: true
  user: your-github-username
  api: 'https://github-contributions-api.jogruber.de/v4/{user}?y=last'
```

`{user}` 会自动替换为上面的用户名。保留默认接口即可尝试使用，但第三方服务可用性需在实际浏览器中验证。更换为自建接口时，响应需兼容该贡献数据格式；普通 GitHub 主页地址不能填到 `api`。

**检查方法：**打开首页，确认日历链接指向自己的 GitHub 主页。无数据时检查用户名是否正确、接口是否可访问；尚未准备好时用 `enable: false` 隐藏。

## 4. 页脚运行时间

```yaml
footer:
  runtime:
    enable: true
    start: '2026-10-21T00:00:00+08:00'
    label: 本站已运行
```

把 `start` 改成你真实希望开始计时的时间。格式中的 `T` 连接日期和时间，`+08:00` 表示北京时间，不能省略时区。也可以使用以 `Z` 结尾的 UTC 时间。

| 情况 | 结果 |
| --- | --- |
| 时间格式正确且早于当前时间 | 显示已运行的天、时、分、秒 |
| 开始时间在未来 | 显示“尚未开始” |
| 时间缺少时区或无法解析 | 不显示运行时间 |
| `enable: false` | 隐藏运行时间 |

## 5. 页脚备案文字

只填写你自己的真实备案资料。没有需要展示的资料时，保持：

```yaml
footer:
  filing:
    enable: false
```

有自己的备案信息后，在**已有的 `footer:` 中**配置：

```yaml
footer:
  filing:
    enable: true
    icp:
      number: '替换成你自己的 ICP 备案号'
      url: https://beian.miit.gov.cn/
    police:
      number: ''
      url: ''
```

`icp.number`、`police.number` 是显示文字；`url` 是点击后的查询地址。没有公安备案资料就保留空字符串。单项也支持 `enable: false`；空编号不会显示。主题只负责展示这些字段。

运行时间与备案同时使用时，两者必须在同一个分组下：

```yaml
footer:
  runtime:
    enable: true
    start: '2026-10-21T00:00:00+08:00'
    label: 本站已运行
  filing:
    enable: false
```

## 6. 页脚分组导航

在博客的 `_config.morii.yml` 中，把 `nav` 添加到已有的 `footer:` 分组：

```yaml
footer:
  nav:
    - title: { zh-CN: 阅读, zh-TW: 閱讀, en: Reading }
      links:
        - { name: 文章, path: /archives/ }
        - { name: 专题与系列, path: /series/ }
    - title: 关于
      links:
        - { name: 友链, path: /link/ }
        - { name: 项目文档, path: 'https://example.com/docs/' }
```

每组使用 `title` 和 `links`，链接使用 `name` 和 `path`。名称可以是纯文本或多语言映射，站内路径以 `/` 开头，由 Hexo 补上部署前缀。请填写实际存在的页面。

有可用分组时，分组导航会替换页脚原有的 `explore` 链接行。若需要保留「稍后阅读」等入口，可把它加进分组。将 `nav` 留空或设为 `false` 可恢复原有页脚链接。备案和运行时长仍可单独配置。

## 7. 返回顶部按钮

在 `_config.morii.yml` 中开启滚动百分比。

```yaml
appearance:
  back_to_top_percent: true
```

按钮在向下滚动后显示，百分比按当前页面从顶部到可滚动底部的距离计算。点击按钮可返回顶部。默认关闭，按钮显示上箭头。

## 8. 发布前核对

打开首页和任意文章页，分别查看侧栏、天气城市、GitHub 账号和页脚。确认没有出现作者的账号、城市、上线日期和备案号。首次配置关闭的服务，只有在自己的资料准备好后再开启。
