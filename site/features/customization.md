# 外观与导航

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

颜色用 `#RRGGBB` 格式，建议加引号。`hero.title` 下的 `0:`、`1:` 分别是首页标题的第一行和第二行；当前 npm 版本需要这种写法才能覆盖默认文字。修改后重新生成，并检查浅色、深色两种模式下的可读性。

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

| 字段 | 可选值 |
| --- | --- |
| `home` | `featured`、`grid` |
| `categories` | `atlas`、`directory`、`cards` |
| `category` | `list`、`cards` |
| `archives` | `timeline`、`grouped` |

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

以上代码展示的是**所在层级**，不是让你把已有 `appearance` 全部删除。修改前可备份 `_config.morii.yml`。更细的单项开关与默认值见[主题配置源码](https://github.com/xichenx/hexo-theme-morii/blob/main/_config.yml)。
