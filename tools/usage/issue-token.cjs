'use strict';

const { createHmac } = require('node:crypto');
const { siteId } = require('../../scripts/lib/usage.cjs');

const id = siteId(process.argv[2]);
const secret = process.env.MORII_USAGE_SIGNING_KEY;
if (!id || !secret) {
  console.error('Set MORII_USAGE_SIGNING_KEY and pass the canonical public blog URL.');
  process.exitCode = 1;
} else {
  console.log(createHmac('sha256', secret).update(id).digest('hex'));
}
