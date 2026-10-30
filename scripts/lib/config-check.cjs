'use strict';
function inspect(config, site = {}, knownKeys) {
  const issues = [];
  const add = (level, field, message) => issues.push({ level, field, message });
  const get = key => key.split('.').reduce((value, part) => value?.[part], config);
  const https = value => { try { const url = new URL(value); return /^https?:$/.test(url.protocol) && !url.username && !url.password; } catch { return false; } };
  if (knownKeys) for (const key of Object.keys(config)) if (!knownKeys.includes(key)) add('warning', key, '未知顶层配置，请检查是否拼写错误。');
  const language = Array.isArray(site.language) ? site.language[0] : site.language;
  if (language && !['en', 'zh-CN', 'zh-TW'].includes(language)) add('warning', 'language', '建议使用 en、zh-CN 或 zh-TW，其他语言会使用兼容或回退规则。');
  for (const field of ['motion.enable', 'performance.diagnostics', 'cinema.enable', 'music.meting.enable', 'comments.enable', 'article.enhancements.mermaid', 'article.enhancements.math']) {
    if (get(field) != null && typeof get(field) !== 'boolean') add('error', field, '必须为 true 或 false，不能使用带引号的字符串。');
  }
  for (const [field, allowed] of Object.entries({ 'appearance.layouts.home': ['featured', 'grid'], 'appearance.layouts.categories': ['atlas', 'directory', 'cards'], 'appearance.layouts.category': ['list', 'cards'], 'appearance.layouts.archives': ['timeline', 'grouped'], 'comments.provider': ['twikoo', 'waline'] })) {
    if (get(field) != null && !allowed.includes(get(field))) add('error', field, `可选值：${allowed.join(', ')}。`);
  }
  if (config.comments?.enable === true) {
    const field = config.comments.provider === 'waline' ? 'comments.server_url' : 'comments.env_id';
    const value = get(field);
    if (typeof value !== 'string' || !value.trim()) add('error', field, '启用评论后必须填写服务地址或环境 ID。');
    else if (config.comments.provider === 'waline' && !https(value)) add('error', field, '必须为完整 HTTP(S) 地址。');
    if (config.comments.script_url && !https(config.comments.script_url) && !/^\/(?!\/)/.test(config.comments.script_url)) add('error', 'comments.script_url', '必须为 HTTP(S) 地址或站内绝对路径。');
  }
  for (const field of ['friends_feed.endpoint', 'music.meting.api', 'github_calendar.api']) if (get(field) && !https(get(field))) add('error', field, '必须为完整 HTTP(S) 地址。');
  for (const field of ['accent', 'accent_dark']) if (get(field) != null && !/^#[\da-f]{6}$/i.test(get(field))) add('error', field, '使用六位十六进制颜色，如 #5568f6。');
  for (const field of ['search.page_size', 'search.shard_size']) if (get(field) != null && (!Number.isInteger(get(field)) || get(field) < 1)) add('error', field, '必须为正整数。');
  for (const field of ['menu', 'explore']) if (config[field] != null) {
    if (!Array.isArray(config[field])) add('error', field, '必须为导航列表。');
    else config[field].forEach((item, index) => { if (!item || typeof item.path !== 'string' || !item.path.trim() || /^(?:javascript:|data:|\/\/)/i.test(item.path) || /[\\\u0000-\u001f]/.test(item.path)) add('error', `${field}[${index}].path`, '填写站内路径或 HTTP(S) 链接。'); });
  }
  const start = config.footer?.runtime?.start;
  if (config.footer?.runtime?.enable && (!start || !Number.isFinite(Date.parse(start)) || !/(?:Z|[+-]\d{2}:\d{2})$/i.test(start))) add('error', 'footer.runtime.start', '填写包含时区的时间，如 2026-01-01T00:00:00+08:00。');
  for (const [field, value] of [['brand', '心灵涂鸦'], ['footer.filing.icp.number', '湘ICP备-2024053403号'], ['comments.env_id', 'https://martinleo-twikoo.hf.space'], ['music.meting.id', '1451608172']]) if (get(field) === value) add('warning', field, '仍使用主题作者的示例资料，请确认是否需要替换。');
  return issues;
}
module.exports = { inspect };
