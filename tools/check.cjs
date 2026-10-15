'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const yaml = require('js-yaml');
const root = path.resolve(__dirname, '..');
const files = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? files(file) : [file];
});
for (const directory of ['scripts', 'source/js', 'tools', 'tests']) {
  for (const file of files(path.join(root, directory)).filter(file => /\.(?:js|cjs)$/.test(file))) execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
}
for (const directory of ['.github/workflows', 'demo']) {
  for (const file of files(path.join(root, directory)).filter(file => /\.ya?ml$/.test(file))) {
    const data = yaml.load(fs.readFileSync(file, 'utf8'), { filename: file });
    if (directory === '.github/workflows') for (const job of Object.values(data.jobs || {})) {
      for (const step of job.steps || []) if (step.run) execFileSync('bash', ['-n'], { input: step.run, stdio: ['pipe', 'inherit', 'inherit'] });
    }
  }
}
console.log('JavaScript syntax and workflow/demo YAML and workflow shell checks passed.');
