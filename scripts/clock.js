'use strict';

const { forPage } = require('../scripts/lib/i18n.cjs');
hexo.extend.helper.register('morii_clock', function () {
  const t = (...args) => forPage(hexo, this).t(...args);
  const settings = hexo.theme.config.clock || {};
  const coordinate = (value, fallback, limit) => Number.isFinite(Number(value)) && value !== '' && value != null && Math.abs(Number(value)) <= limit ? Number(value) : fallback;
  const latitude = coordinate(settings.latitude, 28.19, 90);
  const longitude = coordinate(settings.longitude, 112.98, 180);
  let timezone = typeof settings.timezone === 'string' ? settings.timezone : 'Asia/Shanghai';
  try { new Intl.DateTimeFormat('en', { timeZone: timezone }); } catch { timezone = 'Asia/Shanghai'; }
  return { enable: settings.enable !== false, city: typeof settings.city === 'string' && settings.city.trim() ? settings.city.trim() : t("长沙市"), timezone,
    endpoint: `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_direction_10m&timeformat=unixtime&timezone=${encodeURIComponent(timezone)}` };
});
