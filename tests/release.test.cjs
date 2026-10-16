'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { metadata, pack } = require('../tools/release.cjs');
const manifest = require('../package.json');
const root = path.resolve(__dirname, '..');

test('release tags must be SemVer and match the package version', () => {
  assert.equal(metadata('v0.1.0-alpha.1', '0.1.0-alpha.1').prerelease, true);
  assert.equal(metadata('v1.2.3', '1.2.3').prerelease, false);
  for (const tag of ['main', 'v01.1.0', 'v1.2.3-alpha.01', 'v1.2.3\narchive=oops', 'v1.2.3/../bad']) assert.throws(() => metadata(tag, tag.slice(1)));
  assert.throws(() => metadata('v1.0.0', '0.1.0-alpha.1'), /does not match/);
});

test('release archive contains installable theme files and an accurate checksum', () => {
  const info = pack(`v${manifest.version}`);
  const archive = path.join(root, 'dist', info.archive);
  const entries = execFileSync('unzip', ['-Z1', archive], { encoding: 'utf8' }).trim().split('\n');
  for (const file of ['morii/_config.yml', 'morii/layout/index.pug', 'morii/scripts/music.js', 'morii/source/js/music.js', 'morii/README.md', 'morii/LICENSE']) assert.ok(entries.includes(file), file);
  assert.ok(entries.every(entry => entry.startsWith('morii/') && !/(^|\/)(?:node_modules|\.git|\.github|\.cache|demo|tools|tests)(?:\/|$)/.test(entry)));
  const digest = crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex');
  assert.equal(fs.readFileSync(path.join(root, 'dist/SHA256SUMS.txt'), 'utf8'), `${digest}  ${info.archive}\n`);
  assert.ok(fs.readFileSync(path.join(root, 'dist/RELEASE_NOTES.md'), 'utf8').includes(manifest.version));
});
