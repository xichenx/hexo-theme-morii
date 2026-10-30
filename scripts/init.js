'use strict';
const readline = require('node:readline/promises');
const process = require('node:process');
const { features, plan, write, selected } = require('../scripts/lib/init.cjs');
const { forPage } = require('../scripts/lib/i18n.cjs');
hexo.extend.console.register('morii:init', 'Create a minimal Morii config and optional pages without overwriting existing files', { options: [
  { name: '--yes', desc: 'Use defaults without interactive questions' },
  { name: '--pages', desc: `Comma-separated pages: ${Object.keys(features).join(', ')}; or none` },
  { name: '--comments', desc: 'none, twikoo or waline' }, { name: '--server-url', desc: 'Comment server URL or Twikoo envId' },
  { name: '--github', desc: 'GitHub username for the contribution calendar' },
  { name: '--music-id', desc: 'Your Meting playlist ID' }, { name: '--music-server', desc: 'Meting server (default: tencent)' },
  { name: '--dry-run', desc: 'Print the plan and configuration without writing files' }, { name: '--output', desc: 'Alternative configuration suggestion filename' }
] }, async args => {
  const options = { pages: args.pages, comments: args.comments, serverURL: args['server-url'], github: args.github, musicId: args['music-id'], musicServer: args['music-server'], output: args.output, sourceDir: hexo.source_dir };
  const flag = value => value === true || value === 'true';
  const dryRun = flag(args['dry-run']);
  const nonInteractive = flag(args.yes) || flag(args.y) || args.pages != null || args.comments != null || args.github || args['music-id'] || dryRun;
  if (!nonInteractive) {
    if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('非交互环境请使用 --yes、--pages 或 --dry-run。');
    const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
      hexo.log.info('站名、作者、语言和简介沿用博客 _config.yml。直接回车使用默认值。');
      const pages = await prompt.question(`添加页面（${Object.keys(features).join(', ')}；默认 about,categories,tags；none 表示跳过）：`);
      options.pages = pages.trim() || 'about,categories,tags';
      const choices = selected(options.pages);
      if (choices.includes('comments')) {
        options.comments = (await prompt.question('评论服务（none / twikoo / waline，默认 none）：')).trim() || 'none';
        if (options.comments !== 'none') options.serverURL = (await prompt.question('填写自己的评论服务地址或 Twikoo envId：')).trim();
      }
      if (choices.includes('music')) options.musicId = (await prompt.question('自己的 Meting 歌单 ID（留空稍后配置自有音频）：')).trim();
    } finally { prompt.close(); }
  }
  const result = plan(hexo.base_dir, options, forPage(hexo).t);
  if (!dryRun) write(result);
  for (const file of result.files) hexo.log.info(`[Morii ${dryRun ? 'plan' : file.state}] ${file.path}${file.state === 'existing' ? ' (preserved)' : ''}`);
  if (dryRun) hexo.log.info('\n' + result.files.find(file => file.kind === 'config').content);
  if (result.preservesConfig) hexo.log.info(`已有 _config.morii.yml 已保留；请按需合并 ${result.output} 中的选项。`);
  hexo.log.info(dryRun ? '预览完成，未写入文件。' : '初始化完成。请重新运行 hexo morii:check 和 hexo generate。');
  return result;
});
