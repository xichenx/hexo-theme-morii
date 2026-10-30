'use strict';

const { forPage } = require('../scripts/lib/i18n.cjs');
hexo.extend.helper.register('morii_clock', function () {
  const t = (...args) => forPage(hexo, this).t(...args);
  const settings = hexo.theme.config.clock || {};
  const coordinate = (value, limit) => typeof value !== 'boolean' && value !== '' && value != null && Number.isFinite(Number(value)) && Math.abs(Number(value)) <= limit ? Number(value) : null;
  const latitude = coordinate(settings.latitude, 90), longitude = coordinate(settings.longitude, 180);
  let timezone = settings.timezone || hexo.config?.timezone || 'UTC';
  try { new Intl.DateTimeFormat('en', { timeZone: timezone }); } catch { timezone = 'UTC'; }
  const weather = latitude != null && longitude != null;
  return { enable: settings.enable === true, city: typeof settings.city === 'string' && settings.city.trim() ? settings.city.trim() : t('本地时间'), timezone, weather,
    endpoint: weather ? `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_direction_10m&timeformat=unixtime&timezone=${encodeURIComponent(timezone)}` : '' };
});
