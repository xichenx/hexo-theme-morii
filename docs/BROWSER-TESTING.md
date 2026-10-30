# 浏览器布局回归

这是主题开发者的检查工具。博客使用者可以继续手动复制配置，或使用可选的 `hexo morii:init`，不需要安装浏览器测试依赖。

## 本地运行

在主题仓库根目录安装开发依赖和测试浏览器：

```bash
npm ci
npx playwright install chromium webkit
npm run test:browser
```

Linux 缺少浏览器系统库时，使用 Playwright 官方的 `npx playwright install --with-deps chromium webkit` 安装方式。浏览器只需首次安装或升级 Playwright 后重新安装；版本由 `package-lock.json` 固定。

只检查一个场景：

```bash
npm run test:browser -- --project=narrow-dark
```

端口默认 `8792`，服务器仅监听 `127.0.0.1`。需要换端口时，设置环境变量 `MORII_BROWSER_PORT`。占用的端口会导致测试停止，不会复用可能过时的预览服务。

## 检查范围

| 场景 | 引擎 | 视口 |
| --- | --- | --- |
| desktop | Chromium | 1440 × 900 |
| narrow | Chromium | 1024 × 700 |
| short | Chromium | 1280 × 520 |
| mobile-chromium | Chromium 手机模拟 | 390 × 844 |
| mobile-webkit | WebKit 手机模拟 | 390 × 844 |

每个场景分别运行浅色和深色模式。WebKit 手机模拟用于补充引擎差异检查，实际手机仍需按需要验证。

- 首页、归档、分类、关于、相册、音乐馆、电影院、专题与文章页的横向溢出。
- 包含连续英文的长标题、最近更新链接的换行。
- 长目录独立滚动、时钟卡片完整高度、数字边界和刷新操作。
- 短窗口下侧栏恢复自然布局，以及搜索、快捷导航和手机目录弹窗的边界。
- 临时重现旧版目录挤压样式，确认检测器能发现历史裁切问题，再恢复当前样式验证。
- 三种代码块外观、固定与自动配色、长文件名、复制折叠、打印，以及无 JavaScript 的可读性。

测试使用独立的 `.cache/browser-layout/` Hexo 站点，通过 `/layout/` 子目录提供页面。不会读取或修改真实博客的个人配置、文章和账号；与默认 `.cache/demo/` 构建相互独立。

天气响应使用固定测试数据，其他外站请求被阻止；普通布局检查使用减少动态效果模式，避免动画中间状态造成误报。这些检查不评估第三方服务的真实可用性，也不代替现有动效行为测试。

## 查看结果

```bash
npm run test:browser:report
```

HTML 报告位于 `.cache/browser-layout-report/`；原始结果位于 `.cache/browser-layout-results/`，每次运行会更新。通过的用例附带视口截图，失败会保留截图、断言信息和 Playwright Trace。使用边界断言检查裁切，截图用于人工复核配色与视觉效果，不做依赖系统字体的逐像素比对。

CI 中的 `browser-layout` 作业独立运行；报告与结果保存 7 天，方便从失败的构建下载查看。测试相关文件和浏览器均不进入主题运行时资源。

Playwright 用法参考：[测试服务器](https://playwright.dev/docs/test-webserver)、[测试项目](https://playwright.dev/docs/test-projects)、[测试选项](https://playwright.dev/docs/api/class-testoptions)。
