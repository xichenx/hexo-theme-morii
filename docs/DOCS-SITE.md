# Morii 文档站

文档源文件位于 `site/`，使用 VitePress 构建。运行环境建议 Node.js 24。

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
