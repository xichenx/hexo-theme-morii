'use strict';
hexo.extend.helper.register('morii_comments', (page = {}) => {
  const config = hexo.theme.config.comments || {};
  const provider = config.provider === 'waline' ? 'waline' : 'twikoo';
  const modes = ['viewport', 'immediate', 'manual'];
  const loadMode = [page.comments_load, config.load_mode].find(mode => modes.includes(mode)) || 'viewport';
  const resource = (value, fallback) => {
    if (typeof value !== 'string' || !value.trim()) return fallback;
    if (/^\/(?!\/)/.test(value)) return value;
    try { const url = new URL(value); return /^https?:$/.test(url.protocol) ? url.href : fallback; } catch { return fallback; }
  };
  return {
    enable: config.enable === true, provider, loadMode, env: config.env_id,
    server: resource(config.server_url, ''),
    script: resource(config.script_url, provider === 'waline' ? 'https://cdn.jsdelivr.net/npm/@waline/client@3.16.1/dist/waline.umd.js' : 'https://cdn.jsdelivr.net/npm/twikoo@1.6.44/dist/twikoo.all.min.js'),
    css: resource(config.style_url, 'https://cdn.jsdelivr.net/npm/@waline/client@3.16.1/dist/waline.css'),
    recent: config.enable === true && provider === 'twikoo' && config.recent?.enable === true,
    recentLimit: Math.max(1, Math.min(10, Number(config.recent?.limit) || 5))
  };
});
