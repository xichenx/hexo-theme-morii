'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { inspect, check, BUDGET } = require('../tools/performance.cjs');

test('performance audit deduplicates assets and catches real budget regressions', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'morii-performance-'));
  try {
    fs.mkdirSync(path.join(root, 'css'));
    fs.mkdirSync(path.join(root, 'js'));
    fs.writeFileSync(path.join(root, 'css', 'main.css'), 'body{}');
    fs.writeFileSync(path.join(root, 'css', 'dialog.css'), 'dialog{}');
    fs.writeFileSync(path.join(root, 'js', 'app.js'), 'x'.repeat(BUDGET.js + 1));
    fs.writeFileSync(path.join(root, 'index.html'), '<link rel="stylesheet" href="/css/main.css"><link rel="stylesheet" href="/css/dialog.css" media="print"><script src="/js/app.js"></script><script src="/js/app.js"></script>');
    const row = inspect(root, 'index.html');
    assert.equal(row.css, 14);
    assert.equal(row.blockingCss, 6);
    assert.equal(row.js, BUDGET.js + 1);
    assert.deepEqual(check([row]), [`index.html: js ${BUDGET.js + 1} exceeds ${BUDGET.js}`]);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
