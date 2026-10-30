'use strict';

const { forPage } = require('../scripts/lib/i18n.cjs');
hexo.extend.helper.register('morii_runtime', function () {
  const t = (...args) => forPage(hexo, this).t(...args);
  const config = hexo.theme.config.footer?.runtime;
  if (!config || config.enable === false || typeof config.start !== 'string' || !/(?:Z|[+-]\d{2}:\d{2})$/i.test(config.start)) return null;
  const start = Date.parse(config.start);
  if (!Number.isFinite(start)) return null;
  const seconds = Math.floor((Date.now() - start) / 1000);
  const value = seconds < 0 ? t("尚未开始") : t("{0} 天 {1} 小时 {2} 分 {3} 秒", Math.floor(seconds / 86400), Math.floor(seconds % 86400 / 3600), Math.floor(seconds % 3600 / 60), seconds % 60);
  return { start: new Date(start).toISOString(), label: typeof config.label === 'string' && config.label.trim() ? config.label.trim() : t("本站已运行"), value };
});
