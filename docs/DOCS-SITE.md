# Morii 文档站

线上地址：[morii-docs.pages.dev](https://morii-docs.pages.dev/)。Cloudflare Pages 已连接 `main` 分支，推送后自动构建和部署。

文档源文件位于 `site/`，使用 VitePress 构建。运行环境建议 Node.js 24。

## 内容组织与示例维护

- `site/guide/index.md` 是接入路线，5 个步骤只负责让读者完成基础博客。
- `site/config/` 是字段参考；`site/features/` 是按需接入的功能，不重复展开入门主线。
- `site/examples/index.md` 汇总完整文件和修改前后对照。
- `site/public/examples/minimal/` 是第 2 步配置；`starter/` 是第 4 步结束时的配置和内容文件。
- 文档使用 VitePress `<<<` 导入上述真实文件，避免展示代码与下载文件不一致。两个阶段的配置仅菜单不同，修改时应同步核对。
- 不要把可下载的示例 Markdown 当成文档页面构建；它们在 `public/` 下作为静态文件发布。
- 侧栏按路径分组，入门页面不展示全部配置字段和平台教程。原有文档 URL 保留，新增页面通过导航接入。

编辑后先运行文档构建，核对内部链接、锚点和静态下载文件。涉及可复制示例时，在独立 Hexo 测试目录中生成并检查示例菜单和页面。

## 本地开发

```bash
npm ci
npm run docs:dev
npm run docs:build
npm run docs:preview
```

## Cloudflare Pages

将此 GitHub 仓库连接到 Cloudflare Pages，设置：

| 项目 | 值 |
| --- | --- |
| 生产分支 | `main` |
| 构建命令 | `npm run docs:build` |
| 构建输出目录 | `site/.vitepress/dist` |
| 环境变量 | `NODE_VERSION=24` |

使用 Pages 提供的 `*.pages.dev` 域名时无需设置 `base`。若绑定专用文档域名，仍保持根路径 `/`。只有部署到子路径时才需要在 VitePress 配置中设置 `base`。

现有 GitHub Pages 工作流继续部署主题演示站。文档站部署到 Cloudflare Pages，两者互不覆盖。

文档在仓库内维护，但不进入 npm 包或 Release ZIP：npm 包由 `package.json` 的 `files` 清单决定，Release ZIP 由 `tools/release.cjs` 的清单决定。
