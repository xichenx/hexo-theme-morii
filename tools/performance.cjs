'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { buildDemo } = require('./demo.cjs');

const PAGES = [
  'index.html',
  'archives/index.html',
  'categories/index.html',
  'posts/welcome/index.html',
  'album/index.html',
  'album/morii/index.html',
  'music/index.html',
  'cinema/index.html',
  'series/index.html',
  'series/morii-guide/index.html',
  'posts/reading/index.html'
];
const KIB = 1024;
const BUDGET = {
  html: 48 * KIB,
  css: 140 * KIB,
  blockingCss: 130 * KIB,
  js: 120 * KIB,
  stylesheets: 9,
  scripts: 16,
  eagerImages: 1800 * KIB
};
const size = (root, file) => fs.statSync(path.join(root, file)).size;
const asset = (root, value) => {
  const url = new URL(value, 'https://example.test/');
  if (url.origin !== 'https://example.test') return null;
  const file = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  if (!file || file.split('/').includes('..') || !fs.existsSync(path.join(root, file))) throw new Error(`Missing local asset: ${value}`);
  return file;
};
const unique = values => [...new Set(values.filter(Boolean))];

function inspect(root, page) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const styles = [...document.querySelectorAll('link[rel="stylesheet"][href]')];
  const scripts = [...document.querySelectorAll('script[src]')];
  const images = [...document.querySelectorAll('img[src]')];
  const stylesheets = unique(styles.map(node => asset(root, node.getAttribute('href'))));
  const blocking = unique(styles.filter(node => node.media !== 'print').map(node => asset(root, node.getAttribute('href'))));
  const scriptFiles = unique(scripts.map(node => asset(root, node.getAttribute('src'))));
  const imageFiles = unique(images.map(node => asset(root, node.getAttribute('src'))));
  const eager = unique(images.filter(node => node.getAttribute('loading') !== 'lazy').map(node => asset(root, node.getAttribute('src'))));
  const total = files => files.reduce((sum, file) => sum + size(root, file), 0);
  const result = {
    page,
    html: Buffer.byteLength(html),
    css: total(stylesheets),
    blockingCss: total(blocking),
    js: total(scriptFiles),
    imageBytes: total(imageFiles),
    eagerImages: total(eager),
    largeImages: imageFiles.filter(file => size(root, file) > 500 * KIB).map(file => ({ file, bytes: size(root, file) })),
    stylesheets: styles.length,
    scripts: scripts.length,
    images: images.length
  };
  dom.window.close();
  return result;
}

function check(rows) {
  return rows.flatMap(row => Object.entries(BUDGET).filter(([key, limit]) => row[key] > limit).map(([key, limit]) => `${row.page}: ${key} ${row[key]} exceeds ${limit}`));
}

async function main() {
  const root = await buildDemo();
  const rows = PAGES.map(page => inspect(root, page));
  const kib = bytes => `${Math.round(bytes / KIB)} KiB`;
  console.log('Page                         HTML   CSS / blocking   JS    images / eager   CSS/JS requests');
  for (const row of rows) console.log(`${row.page.padEnd(28)} ${kib(row.html).padStart(6)}  ${`${kib(row.css)} / ${kib(row.blockingCss)}`.padEnd(16)} ${kib(row.js).padStart(7)}  ${`${kib(row.imageBytes)} / ${kib(row.eagerImages)}`.padEnd(18)} ${row.stylesheets}/${row.scripts}`);
  for (const row of rows) for (const image of row.largeImages) console.log(`Large image on ${row.page}: ${image.file} (${kib(image.bytes)})`);
  const failures = check(rows);
  if (failures.length) {
    console.error(`Performance budget exceeded:\n${failures.join('\n')}`);
    process.exitCode = 1;
  } else console.log('Performance budget passed. Values are uncompressed local assets, not field Web Vitals.');
}

module.exports = { PAGES, BUDGET, inspect, check };
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
