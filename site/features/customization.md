# 外观与导航

新站先按[第 4 步](/guide/complete-site)建好页面和菜单。下面是接入完成后调整导航、布局和特效的参考；菜单项可以根据已建页面选择，不必为了套用这里的相册入口而重做入门示例。

所有示例都写在**你的博客根目录**的 `_config.morii.yml`。先按[首次配置](/guide/first-config)创建这个文件，再在已有分组里修改，不要重复添加同名顶层字段。

## 修改顶部菜单

`menu` 控制顶部主要入口。首次配置用 `menu: false` 暂时隐藏它。先按[创建常用页面](/features/pages)和[相册与友链](/features/album-links)建好页面，确认 `/categories/`、`/essay/`、`/album/`、`/link/`、`/about/` 都能打开，然后把**原有的** `menu: false` 改成下面的完整列表：

```yaml
menu:
  - name: 首页
    path: /
  - name: 文章
    path: /archives/
  - name: 分类
    path: /categories/
  - name: 即刻
    path: /essay/
  - name: 相册
    path: /album/
  - name: 友链
    path: /link/
  - name: 关于
    path: /about/
```

这七项对应主题当前版本的七个默认菜单位置，可以逐项改名、改路径。**不要只写两三项**：当前 npm 版本会把短列表与默认菜单按位置合并，剩余默认项仍会出现。暂时不需要菜单时，继续使用 `menu: false`。`explore: false` 建议保持关闭；等你确实需要更多入口，再参考[默认配置](https://github.com/xichenx/hexo-theme-morii/blob/main/_config.yml)准备完整列表。导航出现却点开 404，通常是对应页面尚未创建。

## 调整首页文字与主题色

在已有配置中修改 `brand`、`tagline`、`intro` 和 `hero`：

```yaml
brand: 我的博客
tagline: 把每一天写成一页
intro: 关于技术、阅读和生活的记录。
accent: '#5568f6'
hero:
  title:
    0: 你好，欢迎来坐坐。
    1: 这是我的博客。
  note: 这里有我最近的文章和想法。
```

颜色用 `#RRGGBB` 格式，必须加引号，避免 `#` 被 YAML 当作注释。`hero.title` 下的 `0:`、`1:` 分别是首页标题的第一行和第二行；当前 npm 版本需要这种写法才能覆盖默认文字。修改后重新生成，并检查浅色、深色两种模式下的可读性。

深色模式可以设置单独的强调色：

```yaml
accent: '#5568f6'
accent_dark: '#8c9aff'
```

只支持六位十六进制颜色，不要写 `blue`、`#fff` 或 `rgb(...)`。`accent` 默认是 `#5568f6`，`accent_dark` 默认是 `#8c9aff`。访客可通过主题切换按钮选择明暗模式；偏好保存在当前浏览器，没有偏好时跟随系统。当前没有 `darkmode:` 这样的主题配置。

头像和 Logo 的路径详解见[基本信息与图片](/config/basic)，首页卡片详解见[首页内容](/config/home)。

## 探索链接和快捷导航

`explore` 是页脚探索入口列表，也会加入快捷导航面板。它不会自动创建页面。当前默认有六项，想开启时请完整覆盖六项；下面使用常用页面作为示例，请先确认每个页面都已存在：

```yaml
explore:
  - name: 文章归档
    path: /archives/
  - name: 分类目录
    path: /categories/
  - name: 标签索引
    path: /tags/
  - name: 即刻短文
    path: /essay/
  - name: 友情链接
    path: /link/
  - name: 关于本站
    path: /about/
quick_navigation:
  enable: true
```

启用 `quick_navigation` 后，顶部会出现导航面板入口。面板汇总菜单、标签、探索链接，以及启用后的稍后阅读入口；重复路径会去重。关闭面板用 `quick_navigation.enable: false`，关闭探索列表用 `explore: false`，两者互不替代。

菜单 / 探索项的 `name` 是显示文字，`path` 是地址。可以额外写 `icon` 和 `description`，用于快捷导航面板的展示，不会把顶部文字菜单自动变成图标菜单。例如：

```yaml
# 这是单个列表项示例，替换完整 menu / explore 列表中的一项。
- name: 我的开源项目
  path: https://github.com/你的用户名
  icon: code
  description: 看看我正在做的项目
```

内置图标名包括 `home`、`archive`、`categories`、`tags`、`essay`、`album`、`link`、`about`、`music`、`cinema`、`friends`、`comments`、`game`、`snowflake`、`bookmark`、`external`、`book`、`code`、`sparkles`、`sun`。

## 选择页面布局

Morii 为首页、分类和归档提供内置方案。先改一项看效果：

```yaml
appearance:
  layouts:
    home: featured
    categories: atlas
    category: list
    archives: timeline
```

| 字段 | 可选值与含义 | 默认值 |
| --- | --- | --- |
| `home` | `featured`：文章数为奇数时突出第一篇；`grid`：等宽网格 | `featured` |
| `categories` | `atlas`：双列主题导航；`directory`：分类目录；`cards`：分类卡片 | `atlas` |
| `category` | `list`：某个分类下的文章行列表；`cards`：文章卡片与侧栏 | `list` |
| `archives` | `timeline`：时间树；`grouped`：按年份分组的卡片 | `timeline` |

注意 `categories` 控制分类**总览页**，`category` 控制点击某个分类后进入的**文章列表页**。字段值拼写错误时主题会警告并回退默认布局。

如果你已经有 `appearance:` 分组，把 `layouts:` 放在这个分组内部，**不要再写第二个 `appearance:`**。页面布局更改后运行 `hexo clean && hexo generate` 并重启本地服务。

## 减少视觉特效

初次使用可保持默认。想关闭主题的极光、粒子和卡片特效，在已有 `appearance:` 下添加：

```yaml
appearance:
  effects:
    enable: false
```

滚动入场等动效由单独的 `motion.enable` 控制：

```yaml
motion:
  enable: false
```

以上代码展示的是**所在层级**，不是让你把已有 `appearance` 全部删除。修改前可备份 `_config.morii.yml`。

## 单独控制每种特效

下面展示布局与特效同时存在时的完整层级；合并到已有的 `appearance:` 中：

```yaml
appearance:
  layouts:
    home: featured
    categories: atlas
    category: list
    archives: timeline
  effects:
    enable: true
    aurora: true
    particles: true
    density: 48
    glass: true
    spotlight: true
    tilt: true
    ripple: true
    theme_transition: true
motion:
  enable: true
```

| 字段（位于 `appearance.effects` 下） | 默认值 | 作用 |
| --- | --- | --- |
| `enable` | `true` | 视觉特效总开关；不改变页面布局 |
| `aurora` | `true` | 页面渐变极光背景 |
| `particles` | `true` | 星尘粒子和近邻连线 |
| `density` | `48` | 桌面粒子数量，范围 12–80，手机最多 18 |
| `glass` | `true` | 导航和展示卡片的毛玻璃效果 |
| `spotlight` | `true` | 精细指针设备上的卡片跟随光晕 |
| `tilt` | `true` | 精细指针设备上的卡片轻微倾斜 |
| `ripple` | `true` | 按钮点击波纹 |
| `theme_transition` | `true` | 明暗切换圆形扩散；不支持时直接切换 |

想保留配色但减少动态效果，可把 `particles`、`spotlight`、`tilt`、`ripple`、`theme_transition` 设为 `false`，同时设 `motion.enable: false`。`density: 0` 不等于关闭粒子，关闭应使用 `particles: false`。

主题遵循系统的减少动态效果设置，触屏设备也不会呈现所有鼠标效果。因此电脑上有光晕、手机上没有，并不一定是配置失败。

## 检查修改结果

重新生成后，分别检查首页、分类总览、某个分类和归档页；再切换明暗模式、缩小浏览器宽度。菜单地址应逐个点击验证，颜色应保证文字可读。完整的配置文件组织方法见[配置手册](/config/)。
