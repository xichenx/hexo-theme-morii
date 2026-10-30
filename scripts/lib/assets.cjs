'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const fingerprint = (name, data) => name.replace(/\.(css|js)$/, `.${createHash('sha256').update(data).digest('hex').slice(0, 12)}.$1`);
function collect(directory) {
  const assets = new Map();
  for (const kind of ['css', 'js']) {
    const base = path.join(directory, kind);
    for (const name of fs.readdirSync(base).filter(name => /\.(?:css|js)$/.test(name))) {
      const data = fs.readFileSync(path.join(base, name));
      const key = `${kind}/${name}`;
      assets.set(key, { path: fingerprint(key, data), data });
    }
  }
  return assets;
}
module.exports = { fingerprint, collect };
