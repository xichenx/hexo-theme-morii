'use strict';

function navigationTarget(value) {
  const path = typeof value === 'string' ? value.trim() : '';
  if (/[\\\u0000-\u001f\u007f]/.test(path)) return;
  if (/^\/(?!\/)/.test(path)) {
    const pathname = path.split(/[?#]/, 1)[0];
    // Reject dot segments so configured links cannot escape Hexo's deployment root.
    if (!pathname.split('/').some(segment => /^\.{1,2}$/.test(segment.replace(/%2e/gi, '.')))) {
      return { path, local: true };
    }
    return;
  }
  if (!/^https?:\/\//i.test(path) || !URL.canParse(path)) return;
  const url = new URL(path);
  if (!url.username && !url.password) return { path: url.href, local: false };
}

function heroTarget(value) {
  const input = typeof value === 'string' ? value.trim() : '';
  return /^#[^\s\\\u0000-\u001f\u007f]+$/.test(input) ? { path: input, local: false } : navigationTarget(input);
}

module.exports = { navigationTarget, heroTarget };
