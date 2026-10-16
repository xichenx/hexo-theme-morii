# Morii 发布与演示站

当前版本候选：`v0.1.0-alpha.4`。配置好工作流不等于已经发布版本。

## 工作流

| 文件 | 触发 | 行为 |
| --- | --- | --- |
| `.github/workflows/ci.yml` | main 提交、PR、手动 | Node 22 / 24 安装锁定依赖，语法检查、独立站点和音乐交互测试、发布包验证 |
| `.github/workflows/release.yml` | 推送 `v*` 标签 | 校验版本号，测试，生成 ZIP、SHA256 校验文件和 GitHub Release 草稿 |
| `.github/workflows/demo.yml` | main 提交、手动 | 启用后测试并部署独立演示站到 GitHub Pages |

工作流使用 GitHub 自带的 `GITHUB_TOKEN`，无需额外 PAT。npm 发布由维护者在本机登录后执行，预发布版本使用 `alpha` 标签。是否同步更新 `latest` 以当前 npm 标签状态为准。

## 本地验证

在**主题仓库根目录**执行，不是在博客根目录执行：

```bash
npm ci
npm test
npm run build:demo
npm run package:theme
```

- 演示站输出：`.cache/demo/public/`。
- 发布包：`dist/hexo-theme-morii-v0.1.0-alpha.4.zip`。
- 解压后只有 `morii/` 主题目录，不包含博客文章、开发测试、node_modules 或 Git 配置。
- ZIP 打包需要 `zip`；发布包测试需要 `unzip`。GitHub Ubuntu runner 已提供这两个命令。
- 本地 Node.js 至少为 20.19.0，CI 验证 Node 22 / 24。

查看生成的演示站，可在输出目录启动任意静态服务器。构建阶段不请求音乐、天气、评论服务；浏览器打开音乐馆后才会获取公开演示歌单。

模拟项目子目录部署：

```bash
MORII_DEMO_ROOT=/hexo-theme-morii/ \
MORII_DEMO_URL=https://xichenx.github.io \
npm run build:demo
```

## 首次启用演示站

1. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
2. 在 **Settings → Secrets and variables → Actions → Variables** 创建仓库变量：
   - `MORII_DEMO_PAGES`：`true`。
3. 在 **Actions → Demo Pages → Run workflow** 手动运行一次。
4. 部署成功后，查看工作流输出的 Pages 地址。

本仓库默认演示地址为 `https://xichenx.github.io/hexo-theme-morii/`，实际是否可访问以成功的部署结果为准。

未设置 `MORII_DEMO_PAGES=true` 时，演示站工作流会跳过，普通 CI 和 Release 不受影响。工作流不会自动修改 Pages 设置。

如果使用自定义域名，可将完整地址写入仓库变量 `MORII_DEMO_URL`，例如 `https://morii.example.com/`，必须以 `/` 结尾。同时在 Pages 设置里完成域名和 DNS 配置。

演示站使用 `demo/theme.yml` 覆盖个人品牌、社交账号、备案信息、评论和天气设置；`demo/source/` 只有公开示例文章，不会读取作者博客数据。请不要在这些演示文件里填写私密信息。

## 创建一个版本

### 1. 准备提交

- 检查主题默认配置中的作者个人账号、备案信息和第三方服务地址；发布说明应提醒新用户替换这些示例值。
- 在 `package.json` 更新 `version`，并同步锁文件：

  ```bash
  npm install --package-lock-only --ignore-scripts
  ```

- 在 `CHANGELOG.md` 添加对应的 `## [版本号]` 小节。
- 执行 `npm test` 和 `npm run package:theme`，检查 ZIP 与说明。
- 提交并推送上述修改到 main，等待 CI 成功。

### 2. 创建并推送标签

候选版本示例：

```bash
git tag -a v0.1.0-alpha.4 -m "Morii v0.1.0-alpha.4"
git push origin v0.1.0-alpha.4
```

标签版本必须与 `package.json` 完全一致。标签推送后 Release 工作流才会运行；推送普通提交不会创建 Release。

### 3. 审阅草稿并发布

打开仓库 Releases，检查新生成的草稿：

- 标题、版本号及更新日志。
- `hexo-theme-morii-v版本号.zip` 和 `SHA256SUMS.txt`。
- 开源许可证、安装说明和已知限制。
- 带 `-alpha`、`-beta`、`-rc` 等后缀的标签会标记为预发布；正式版本不带后缀。

确认后点击 **Publish release**。工作流始终创建草稿，公开发布由维护者完成。

同一标签的失败任务可通过 Re-run jobs 重跑：已有草稿会更新附件，已公开的 Release 不会被工作流覆盖。不要移动已发布的标签，修复后发布下一个版本。

## npm 发布

在 npm 官方注册表完成账号登录后，执行 `npm pack --dry-run` 并检查文件清单，再发布预览版：

```bash
npm publish --tag alpha --registry https://registry.npmjs.org/
```

`package.json` 的 `files` 只收录主题运行所需的模板、脚本、资源、配置、README、更新日志和许可证。`hexo-util` 是运行时依赖；Hexo 8 与 Pug 渲染器由站点安装。发布后检查 `npm view hexo-theme-morii@alpha version` 和安装生成结果。

## Hexo 主题目录

按照 [Hexo 官方主题发布说明](https://hexo.io/docs/themes) 向 `hexojs/site` 提交 PR：在 `source/_data/themes/morii.yml` 填写仓库、公开演示链接与标签，并在 `source/themes/screenshots/morii.png` 提供 800 × 500 PNG 截图。演示链接必须实际可访问；PR 需等待 Hexo 维护者审阅和合并。

## 发布渠道

- GitHub Releases：当前自动化的版本分发渠道。
- GitHub Pages：独立演示站。
- Hexo 主题目录：通过上游 PR 收录。
- npm：通过本机 npm 登录发布 `alpha` 标签；后续可设置 Trusted Publishing。

官方参考：

- [GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
- [Hexo 主题提交](https://hexo.io/docs/themes)
