'use strict';
hexo.extend.helper.register('morii_github_calendar', () => {
  const options = hexo.theme.config.github_calendar || {};
  const legacy = hexo.config.githubcalendar || {};
  const user = String(options.user || legacy.user || '').trim();
  if ((options.enable ?? legacy.enable) !== true || !/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(user)) return null;
  try {
    const api = new URL(String(options.api || 'https://github-contributions-api.jogruber.de/v4/{user}?y=last').replaceAll('{user}', encodeURIComponent(user)));
    if (!['http:', 'https:'].includes(api.protocol) || api.username || api.password) return null;
    return { user, api: api.href, profile: `https://github.com/${user}` };
  } catch { return null; }
});
