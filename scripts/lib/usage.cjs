'use strict';

const { createHash } = require('node:crypto');
const { isIP } = require('node:net');

function webUrl(value) {
  try {
    const url = new URL(value);
    if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password) return url;
  } catch { /* A missing or invalid URL cannot identify a deployment. */ }
  return null;
}

function siteId(value) {
  const url = webUrl(value);
  if (!url) return '';
  const host = url.hostname.replace(/\.$/, '');
  if (!host.includes('.') || isIP(host) || /\.(?:test|invalid|example|localhost|local|lan|internal)$/.test(host)
      || /(?:^|\.)example\.(?:com|net|org)$/.test(host)) return '';
  const port = url.port ? ':' + url.port : '';
  const path = url.pathname.replace(/\/+$/, '');
  return createHash('sha256').update(host + port + path).digest('hex');
}

async function reportUsage({ endpoint, url, version, token, fetcher = globalThis.fetch }) {
  const receiver = webUrl(endpoint);
  const id = siteId(url);
  if (!id || receiver?.protocol !== 'https:' || receiver.search || receiver.hash
      || !/^[a-f0-9]{64}$/.test(token || '') || !/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version || '')
      || version.length > 64) return 'unconfigured';

  try {
    const response = await fetcher(receiver.href, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token },
      body: JSON.stringify({ siteId: id, version }),
      redirect: 'error',
      signal: AbortSignal.timeout(1500)
    });
    await response.body?.cancel();
    return response.ok ? 'reported' : 'unavailable';
  } catch {
    return 'unavailable';
  }
}

module.exports = { siteId, reportUsage };
