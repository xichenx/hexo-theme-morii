'use strict';

const { reportUsage } = require('../scripts/lib/usage.cjs');

async function report() {
  const { version } = require('../package.json');
  const result = await reportUsage({
    endpoint: process.env.MORII_USAGE_ENDPOINT,
    token: process.env.MORII_USAGE_TOKEN,
    url: hexo.config.url,
    version
  });
  if (result === 'reported') hexo.log.info('[Morii usage] Deployment report accepted.');
  else hexo.log.warn('[Morii usage] Deployment report skipped. Check the site URL, HTTPS receiver and report token.');
}

hexo.extend.console.register('morii:report-usage', 'Send a Morii deployment usage report', report);

hexo.once('deployAfter', () => {
  if (!process.env.MORII_USAGE_ENDPOINT || !process.env.MORII_USAGE_TOKEN) return;
  const deployers = [].concat(hexo.config.deploy || []);
  if (!deployers.some(item => item?.type && hexo.extend.deployer.get(item.type))) return;
  hexo.extend.filter.register('before_exit', report);
});
