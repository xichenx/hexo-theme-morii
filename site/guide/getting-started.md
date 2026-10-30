---
prev:
  text: 接入路线
  link: /guide/
next:
  text: '第 2 步：修改资料'
  link: /guide/first-config
---

# 第 1 步：安装并启用 Morii

**本页目标：**在自己的电脑上打开 Morii 首页。新建博客时按顺序往下做；教程统一把博客文件夹叫作 `my-blog`。完整学习顺序见[接入路线](/guide/)。

## 已有 Hexo 博客？ {#existing-blog}

先备份自己的博客配置和内容，然后在**原来的博客目录**运行 `hexo version`。已经是 Hexo 8 的读者，可以从本页[安装主题](#_3-安装-morii-主题)开始，不要再运行 `hexo init`。

如果旧博客不是 Hexo 8，先在备份或测试副本中确认升级和插件兼容性，再换主题。下面“创建博客文件夹”的步骤只针对新博客。

::: tip 先分清两个网站
你正在阅读的是 **Morii 主题文档站**。下面创建的是**你自己的博客**。文档站部署在 Cloudflare Pages，不会替你的博客自动上线。
:::

## 开始前准备

你需要一台能联网的电脑、一个文本编辑器，以及 [Node.js](https://nodejs.org/) 和 [Git](https://git-scm.com/downloads)。Windows 可以使用 PowerShell，macOS 使用“终端”，Linux 使用自己的终端。推荐安装 Node.js **24**；Morii 最低要求 Node.js **20.19.0**。

安装完后，**关闭并重新打开终端**，依次输入：

```bash
node --version
npm --version
git --version
```

每条命令都应显示版本号。如果提示“找不到命令”，说明软件未安装完成或终端还没有刷新；先解决这一点再继续。Node.js 安装程序会附带 npm。Hexo 官方也把 Node.js 和 Git 列为前置软件，参见 [Hexo 安装说明](https://hexo.io/zh-cn/docs/)。

## 1. 创建博客文件夹

打开终端，先进入你想保存博客的目录。下面以用户主目录为例：

```bash
cd ~
npm install -g hexo-cli
hexo init my-blog
cd my-blog
npm install
```

Windows PowerShell 中的 `cd ~` 同样表示进入用户主目录。`my-blog` 是**你自己博客的文件夹名**，可以改成喜欢的英文名字；后面的命令都要在这个文件夹中执行。

这里已经用 `npm install -g hexo-cli` 安装了全局命令，因此后续在自己电脑上直接输入 `hexo`。它会在博客目录使用该博客安装的 Hexo 版本。只有没有安装全局 CLI 时，才需要用 `npx hexo` 调用本地命令。[Hexo 官方安装说明](https://hexo.io/zh-cn/docs/#安装-Hexo)

完成后应能看到这些文件：

```text
my-blog/                 ← 博客根目录，以后说“在博客根目录运行”就是这里
├─ _config.yml           ← Hexo 站点配置
├─ package.json          ← 博客依赖
├─ source/
│  └─ _posts/            ← 文章
└─ themes/               ← 通过 Git 安装主题时使用
```

::: tip 命令到底在哪个目录执行？
建好博客文件夹后，后文的 `npm install`、`hexo ...` 都在**自己的博客根目录**执行，不是在 `hexo-theme-morii` 主题仓库中执行。
:::

## 2. 确认 Hexo 版本

在博客根目录运行：

```bash
hexo version
```

找到输出中的 `hexo` 版本。Morii 面向 **Hexo 8**；如果不是 8.x，先在博客根目录运行：

```bash
npm install hexo@^8
```

然后再运行一次 `hexo version` 确认版本。

## 3. 安装 Morii 主题

推荐使用 npm。仍在**博客根目录**运行：

```bash
npm install hexo-theme-morii@latest hexo-renderer-pug
```

`hexo-renderer-pug` 用来渲染主题页面，必须安装在博客里。安装完成后，可以运行 `npm list hexo-theme-morii hexo-renderer-pug` 核对两项依赖。

::: details 我更想用 Git 安装
在博客根目录执行下面两条命令，**不要再执行上面的 npm 主题安装命令**：

```bash
git clone https://github.com/xichenx/hexo-theme-morii.git themes/morii
npm install hexo-renderer-pug
```

Git 安装把主题放在 `themes/morii/`；npm 安装把主题放在 `node_modules/hexo-theme-morii/`。两种方式任选其一即可。
:::

## 4. 启用主题

用文本编辑器打开**博客根目录**的 `_config.yml`。找到原有的 `theme:` 一行，把它改成：

```yaml [_config.yml：修改已有字段]
theme: morii
language: zh-CN
```

如果文件中已有 `language:`，也修改**原有的那一行**，不要写出两个同名配置项。保存文件。此时先不用修改主题安装目录中的 `_config.yml`，个人设置会放在单独的 `_config.morii.yml` 中。

## 5. 生成并预览

回到博客根目录，依次运行：

```bash
hexo clean
hexo generate
hexo server
```

终端应显示本地预览地址，通常是 `http://localhost:4000/`。在浏览器打开它。如果看到 Morii 风格的首页，即表示安装成功。第一次建站时首页可能只有 Hexo 的示例文章，这是正常的。

`hexo server` 会持续运行。想停止预览时，在该终端按 **Ctrl+C**。以后修改配置后，建议停止服务、重新生成并再次启动。

**本页完成标志：**浏览器中能看到 Morii 首页，终端没有生成错误。站名与介绍沿用博客 `_config.yml`，未配置的外部服务保持关闭。

**下一步：**[第 2 步：换成自己的资料](/guide/first-config)。遇到报错可按[常见问题](/troubleshooting)逐项检查。
