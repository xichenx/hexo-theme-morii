'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { parse } = require('postcss');
const fingerprint = (name, data) => name.replace(/\.(css|js)$/, `.${createHash('sha256').update(data).digest('hex').slice(0, 12)}.$1`);

function compactCSS(data, from) {
  const root = parse(data.toString('utf8'), { from });
  const removeFormatting = node => {
    // Keep whitespace inside selectors, values and at-rule parameters verbatim.
    for (const field of ['before', 'after']) {
      if (/^[ \t\n\r\f]+$/.test(node.raws[field] || '')) node.raws[field] = '';
    }
  };
  removeFormatting(root);
  root.walk(removeFormatting);
  return Buffer.from(root.toString());
}

function collect(directory) {
  const assets = new Map();
  for (const kind of ['css', 'js']) {
    const base = path.join(directory, kind);
    for (const name of fs.readdirSync(base).filter(name => /\.(?:css|js)$/.test(name))) {
      const file = path.join(base, name);
      const source = fs.readFileSync(file);
      const data = name.endsWith('.css') ? compactCSS(source, file) : source;
      const key = `${kind}/${name}`;
      assets.set(key, { path: fingerprint(key, data), data });
    }
  }
  return assets;
}
module.exports = { fingerprint, collect };
