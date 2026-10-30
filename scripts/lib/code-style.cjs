'use strict';
const styles = ['classic', 'mac', 'minimal'];
const themes = ['auto', 'light', 'dark'];
function resolveCode(config = {}, page = {}, warn = () => {}) {
  config ||= {};
  page ||= {};
  const choose = (value, allowed, fallback, field) => {
    if (value == null || value === '') return fallback;
    if (allowed.includes(value)) return value;
    warn(field, fallback);
    return fallback;
  };
  const style = choose(config.style, styles, 'classic', 'article.code.style');
  const theme = choose(config.theme, themes, 'dark', 'article.code.theme');
  return {
    style: choose(page.code_style, styles, style, 'code_style'),
    theme: choose(page.code_theme, themes, theme, 'code_theme')
  };
}
module.exports = { styles, themes, resolveCode };
