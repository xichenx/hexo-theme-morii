'use strict';
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { buildDemo } = require('./demo.cjs');
const { prefix, options } = require('./lib/browser-fixture.cjs');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const testAudio = Buffer.alloc(44 + 8000 * 2 * 8);
testAudio.write('RIFF', 0); testAudio.writeUInt32LE(testAudio.length - 8, 4);
testAudio.write('WAVEfmt ', 8); testAudio.writeUInt32LE(16, 16);
testAudio.writeUInt16LE(1, 20); testAudio.writeUInt16LE(1, 22);
testAudio.writeUInt32LE(8000, 24); testAudio.writeUInt32LE(16000, 28);
testAudio.writeUInt16LE(2, 32); testAudio.writeUInt16LE(16, 34);
testAudio.write('data', 36); testAudio.writeUInt32LE(testAudio.length - 44, 40);

function serveTestAudio(request, response) {
  const range = /^bytes=(\d+)-(\d*)$/.exec(request.headers.range || '');
  const start = range ? Number(range[1]) : 0;
  const end = Math.min(testAudio.length - 1, range?.[2] ? Number(range[2]) : testAudio.length - 1);
  if (start > end) { response.writeHead(416, { 'Content-Range': `bytes */${testAudio.length}` }).end(); return; }
  response.setHeader('Content-Type', 'audio/wav');
  response.setHeader('Accept-Ranges', 'bytes');
  response.setHeader('Content-Length', end - start + 1);
  if (range) response.setHeader('Content-Range', `bytes ${start}-${end}/${testAudio.length}`);
  response.writeHead(range ? 206 : 200).end(request.method === 'HEAD' ? undefined : testAudio.subarray(start, end + 1));
}
async function main() {
  const port = Number(process.env.MORII_BROWSER_PORT || 8792);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid MORII_BROWSER_PORT.');
  const root = await buildDemo(options);
  const server = http.createServer(async (request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    try {
      if (request.method !== 'GET' && request.method !== 'HEAD') { response.writeHead(405).end(); return; }
      const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
      if (pathname === '/__morii_layout_health') { response.writeHead(200, { 'Content-Type': 'text/plain' }).end('morii-browser-layout'); return; }
      if (pathname === prefix + 'test-audio/valid.wav') { serveTestAudio(request, response); return; }
      if (pathname === prefix + 'test-audio/empty.wav') { response.writeHead(200, { 'Content-Type': 'text/html', 'Content-Length': 0 }).end(); return; }
      if (!pathname.startsWith(prefix)) { response.writeHead(404).end(); return; }
      const relative = pathname.slice(prefix.length);
      const file = path.resolve(root, relative.endsWith('/') || !relative ? relative + 'index.html' : relative);
      if (!file.startsWith(root + path.sep) || relative.includes('\\')) { response.writeHead(403).end(); return; }
      const content = await fs.readFile(file);
      response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch (error) { response.writeHead(error.code === 'ENOENT' ? 404 : 400).end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  console.log(`Morii browser fixture: http://127.0.0.1:${port}${prefix}`);
  for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => server.close(() => process.exit(0)));
}
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
