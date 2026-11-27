'use strict';

const assert = require('node:assert/strict');
const { createHmac } = require('node:crypto');
const { EventEmitter } = require('node:events');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const test = require('node:test');
const { reportUsage, siteId } = require('../scripts/lib/usage.cjs');

const url = 'https://blog.morii-docs.pages.dev/notes/';
const endpoint = 'https://collector.morii-docs.pages.dev/v1/installations';
const id = siteId(url);
const secret = 'test-signing-key';
const token = createHmac('sha256', secret).update(id).digest('hex');
const version = '1.2.0';

function sqlite() {
  try { return require('node:sqlite').DatabaseSync; } catch (error) {
    if (error.code === 'ERR_UNKNOWN_BUILTIN_MODULE') return null;
    throw error;
  }
}

function usageSql(file) {
  return readFileSync(require.resolve('../tools/usage/' + file), 'utf8');
}

async function sendReport(worker, env, site, version) {
  const body = JSON.stringify({ siteId: site, version });
  const signature = createHmac('sha256', secret).update(site).digest('hex');
  return worker.fetch(new Request(endpoint, {
    method: 'POST', body,
    headers: {
      authorization: 'Bearer ' + signature,
      'content-length': String(Buffer.byteLength(body)),
      'content-type': 'application/json'
    }
  }), env);
}

test('usage schedules automatic reporting only after a configured Hexo deployment', async () => {
  const hook = require.resolve('../scripts/usage.js');
  let beforeExit;
  let requests = 0;
  const hexo = new EventEmitter();
  hexo.config = { url, deploy: { type: 'git' } };
  hexo.log = { info() {}, warn() {} };
  hexo.extend = {
    console: { register() {} },
    deployer: { get: type => type === 'git' },
    filter: { register: (name, callback) => { assert.equal(name, 'before_exit'); beforeExit = callback; } }
  };
  runInNewContext(readFileSync(hook, 'utf8'), {
    hexo,
    process: { env: { MORII_USAGE_ENDPOINT: endpoint, MORII_USAGE_TOKEN: token } },
    require: name => name.endsWith('package.json') ? { version } : {
      reportUsage: async args => {
        assert.equal(args.url, url);
        assert.equal(args.endpoint, endpoint);
        assert.equal(args.token, token);
        requests++;
        return 'reported';
      }
    }
  });
  assert.equal(beforeExit, undefined);
  hexo.emit('deployAfter');
  assert.equal(requests, 0);
  await beforeExit();
  assert.equal(requests, 1);
});

test('usage IDs identify a site and its mount path, ignoring scheme and URL decorations', () => {
  assert.match(id, /^[a-f0-9]{64}$/);
  assert.equal(siteId('http://BLOG.MORII-DOCS.PAGES.DEV/notes?ref=home#intro'), id);
  assert.notEqual(siteId('https://blog.morii-docs.pages.dev/other/'), id);
  assert.equal(siteId('http://localhost:4000'), '');
  assert.equal(siteId('https://127.0.0.1'), '');
  assert.equal(siteId('https://example.com'), '');
});

test('incomplete usage configurations make no requests', async () => {
  let requests = 0;
  const fetcher = () => { requests++; };
  const args = { endpoint, url, version, token, fetcher };
  assert.equal(await reportUsage({ ...args, endpoint: '' }), 'unconfigured');
  assert.equal(await reportUsage({ ...args, endpoint: 'http://receiver.local' }), 'unconfigured');
  assert.equal(await reportUsage({ ...args, token: '' }), 'unconfigured');
  assert.equal(await reportUsage({ ...args, url: 'http://localhost:4000' }), 'unconfigured');
  assert.equal(requests, 0);
});

test('deployment usage reports send only the site ID and version and fail softly', async () => {
  const args = { endpoint, url, version, token };
  const fetcher = async (target, options) => {
    assert.equal(target, endpoint);
    assert.equal(options.headers.authorization, 'Bearer ' + token);
    assert.equal(options.redirect, 'error');
    assert.deepEqual(JSON.parse(options.body), { siteId: id, version });
    return new Response(null, { status: 204 });
  };
  assert.equal(await reportUsage({ ...args, fetcher }), 'reported');
  assert.equal(await reportUsage({ ...args, fetcher: async () => { throw new Error('Network unavailable'); } }), 'unavailable');
});

test('the receiver rejects a token from another site before writing to D1', async () => {
  const { default: worker } = await import('../tools/usage/worker.mjs');
  const writes = [];
  const env = {
    MORII_USAGE_SIGNING_KEY: secret,
    DB: { prepare: () => ({ bind: (...values) => ({ run: async () => writes.push(values) }) }) }
  };
  const send = (siteId, version) => reportUsage({
    endpoint, url, version, token, fetcher: (target, options) => {
      options.body = JSON.stringify({ siteId, version });
      options.headers['content-length'] = String(Buffer.byteLength(options.body));
      return worker.fetch(new Request(target, options), env);
    }
  });
  assert.equal(await send('f'.repeat(64), version), 'unavailable');
  assert.equal(writes.length, 0);
  assert.equal(await send(id, version), 'reported');
  assert.equal(await send(id, '1.2.1'), 'reported');
  assert.deepEqual(writes.map(values => values.slice(0, 2)), [[id, version], [id, '1.2.1']]);
});

const DatabaseSync = sqlite();
test('usage migration preserves unknown first reports and counts new sites by UTC week and month', { skip: !DatabaseSync }, async t => {
  const { default: worker } = await import('../tools/usage/worker.mjs');
  const db = new DatabaseSync(':memory:');
  t.after(() => db.close());
  const epoch = iso => Date.parse(iso) / 1000;
  const old = 'a'.repeat(64);
  const sunday = 'b'.repeat(64);
  const monday = 'c'.repeat(64);
  const december = 'd'.repeat(64);
  db.exec(usageSql('schema.sql'));
  db.prepare('INSERT INTO sites VALUES (?, ?, ?)').run(old, '1.1.3', epoch('2026-11-25T00:00:00Z'));
  db.exec(usageSql('migrations/0001_first_seen.sql'));
  const env = {
    MORII_USAGE_SIGNING_KEY: secret,
    DB: { prepare: sql => ({ bind: (...values) => ({ run: () => db.prepare(sql).run(...values) }) }) }
  };
  let clock;
  t.mock.method(Date, 'now', () => clock * 1000);
  const reportAt = async (site, time, version = '1.2.0') => {
    clock = epoch(time);
    assert.equal((await sendReport(worker, env, site, version)).status, 204);
  };
  const read = site => ({ ...db.prepare('SELECT version, first_seen, last_seen FROM sites WHERE site_id = ?').get(site) });
  await reportAt(old, '2026-11-29T23:59:59Z');
  assert.deepEqual(read(old), { version: '1.2.0', first_seen: null, last_seen: clock });
  await reportAt(sunday, '2026-11-29T23:59:59Z');
  await reportAt(monday, '2026-11-30T00:00:00Z');
  const firstMonday = clock;
  await reportAt(december, '2026-12-01T00:00:00Z');
  await reportAt(monday, '2026-12-02T00:00:00Z', '1.2.1');
  assert.deepEqual(read(monday), { version: '1.2.1', first_seen: firstMonday, last_seen: clock });
  await reportAt(monday, '2026-11-30T01:00:00Z', '1.2.0');
  assert.equal(read(monday).version, '1.2.1');

  const [summary, , weekly, monthly] = usageSql('stats.sql').trim().split(/;\s*(?:\n|$)/);
  const rows = sql => db.prepare(sql).all().map(row => ({ ...row }));
  assert.equal(rows(summary)[0].total_sites, 4);
  assert.equal(rows(summary)[0].unknown_first_seen_sites, 1);
  assert.deepEqual(rows(weekly), [
    { week_start_utc: '2026-11-30', new_sites: 2 },
    { week_start_utc: '2026-11-23', new_sites: 1 }
  ]);
  assert.deepEqual(rows(monthly), [
    { month_utc: '2026-12', new_sites: 1 },
    { month_utc: '2026-11', new_sites: 2 }
  ]);
});
