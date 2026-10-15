'use strict';

hexo.extend.helper.register('morii_runtime', () => {
  const config = hexo.theme.config.footer?.runtime;
  if (!config || config.enable === false || typeof config.start !== 'string' || !/(?:Z|[+-]\d{2}:\d{2})$/i.test(config.start)) return null;
  const start = Date.parse(config.start);
  if (!Number.isFinite(start)) return null;
  const seconds = Math.floor((Date.now() - start) / 1000);
  const value = seconds < 0 ? '尚未开始' : `${Math.floor(seconds / 86400)} 天 ${Math.floor(seconds % 86400 / 3600)} 小时 ${Math.floor(seconds % 3600 / 60)} 分 ${seconds % 60} 秒`;
  return { start: new Date(start).toISOString(), label: typeof config.label === 'string' && config.label.trim() ? config.label.trim() : '本站已运行', value };
});
