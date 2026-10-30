'use strict';
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const { inspect } = require('../scripts/lib/config-check.cjs');
const defaults = yaml.load(fs.readFileSync(path.join(hexo.theme_dir, '_config.yml'), 'utf8'));
const check = () => inspect(hexo.theme.config, hexo.config, Object.keys(defaults));
const print = issues => issues.forEach(issue => hexo.log.warn(`[Morii ${issue.level}] ${issue.field}: ${issue.message}`));
hexo.extend.filter.register('before_generate', () => print(check()));
hexo.extend.console.register('morii:check', 'Check Morii configuration', { options: [{ name: '--strict', desc: 'Fail on warnings as well as errors' }] }, args => {
  const issues = check(); print(issues);
  if (issues.some(issue => issue.level === 'error' || args.strict)) throw new Error('Morii configuration check failed.');
  hexo.log.info('Morii configuration check passed.');
});
