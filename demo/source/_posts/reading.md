---
series: morii-guide
series_order: 2
title: 舒适的阅读体验
date: 2026-10-14 12:00:00
categories:
  - 主题使用
tags:
  - 排版
comments: false
code_style: mac
code_theme: auto
---

这是一篇用于展示 Morii 的示例文章，内容属于独立演示站。

<!-- more -->

## 从内容开始

让文字保持清晰，也给阅读留出呼吸的空间。访问 [Hexo](https://hexo.io/) 了解博客写作。

> 用卡片，收藏技术与生活。

### 一段代码

```javascript
const theme = 'Morii';
console.log(`Hello, ${theme}!`);
```

| 功能 | 说明 |
| --- | --- |
| 阅读 | 目录、进度和字号设置 |
| 音乐 | 歌单、歌词与连续播放 |

## 继续探索

![Morii 图标](/icons/brand/morii-logo.png)

{% folding 点击展开更多 %}
折叠内容也应在独立站点正常渲染。
{% endfolding %}

## 三种代码块外观

普通 Markdown 代码块使用本篇配置的 macOS 窗口外观，并跟随站点深浅模式。也可以单独指定每块代码的外观和配色：

{% codefile classic.js, javascript, 2, classic, dark %}
const theme = 'Morii';
console.log(theme);
{% endcodefile %}

{% codefile window.js, javascript, 2, mac, auto %}
const theme = 'Morii';
console.log(theme);
{% endcodefile %}

{% codefile minimal.js, javascript, 2, minimal, light %}
const theme = 'Morii';
console.log(theme);
{% endcodefile %}
