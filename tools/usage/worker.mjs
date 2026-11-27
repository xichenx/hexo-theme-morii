const encoder = new TextEncoder();
const idPattern = /^[a-f0-9]{64}$/;
const versionPattern = /^\d+\.\d+\.\d+(?:-[\w.-]+)?$/;

async function authorized(secret, id, token) {
  if (!secret || !idPattern.test(token)) return false;
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  const signature = Uint8Array.from(token.match(/../g), byte => Number.parseInt(byte, 16));
  return crypto.subtle.verify('HMAC', key, signature, encoder.encode(id));
}

const response = status => new Response(null, { status, headers: { 'cache-control': 'no-store' } });

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname !== '/v1/installations') return response(404);
    if (request.method !== 'POST') return response(405);
    const length = Number(request.headers.get('content-length'));
    if (!Number.isInteger(length) || length < 1 || length > 512) return response(400);
    if (request.headers.get('content-encoding')) return response(415);
    if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return response(415);

    let payload;
    try { payload = await request.json(); } catch { return response(400); }
    const { siteId, version } = payload || {};
    if (typeof siteId !== 'string' || !idPattern.test(siteId) || typeof version !== 'string'
        || version.length > 64 || !versionPattern.test(version)) return response(400);
    const token = (request.headers.get('authorization') || '').match(/^Bearer ([a-f0-9]{64})$/)?.[1];
    if (!token || !await authorized(env.MORII_USAGE_SIGNING_KEY, siteId, token)) return response(401);

    const receivedAt = Math.floor(Date.now() / 1000);
    await env.DB.prepare(`INSERT INTO sites (site_id, version, last_seen, first_seen) VALUES (?, ?, ?, ?)
      ON CONFLICT(site_id) DO UPDATE SET version = excluded.version, last_seen = excluded.last_seen
      WHERE excluded.last_seen >= sites.last_seen`)
      .bind(siteId, version, receivedAt, receivedAt).run();
    return response(204);
  }
};
