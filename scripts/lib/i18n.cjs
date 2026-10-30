'use strict';
const core = require('../../source/js/i18n.js');
const catalogs = {
  en: require('../../languages/en.json'),
  'zh-CN': require('../../languages/zh-CN.json'),
  'zh-TW': require('../../languages/zh-TW.json')
};
const forPage = (hexo, context) => {
  const language = core.locale(context?.page?.lang || context?.page?.language || hexo.config?.language);
  return core.create(language, catalogs[language]);
};
module.exports = { forPage, catalogs };
