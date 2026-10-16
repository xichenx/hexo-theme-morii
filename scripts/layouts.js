'use strict';
const variants = {
  home: ['featured', 'grid'],
  categories: ['atlas', 'directory', 'cards'],
  category: ['list', 'cards'],
  archives: ['timeline', 'grouped']
};
const warned = new Set();
hexo.extend.helper.register('morii_layout', name => {
  if (!Object.hasOwn(variants, name)) return '';
  const value = hexo.theme.config.appearance?.layouts?.[name];
  if (variants[name].includes(value)) return value;
  if (value !== undefined && !warned.has(name)) {
    warned.add(name);
    hexo.log.warn(`[Morii] appearance.layouts.${name} 配置无效，已回退为 ${variants[name][0]}。`);
  }
  return variants[name][0];
});
