'use strict';

const locales = ['zh-CN', 'zh-TW', 'en'];
const text = value => typeof value === 'string' ? value.trim() : '';
const label = value => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return text(value);
  const entries = locales.flatMap(locale => text(value[locale]) ? [[locale, text(value[locale])]] : []);
  return entries.length ? Object.fromEntries(entries) : '';
};

function destination(value) {
  const path = text(value);
  if (/[\\\u0000-\u001f\u007f]/.test(path)) return;
  if (/^\/(?!\/)/.test(path)) {
    const pathname = path.split(/[?#]/, 1)[0];
    // Reject dot segments so configured links cannot escape Hexo's deployment root.
    if (!pathname.split('/').some(segment => /^\.{1,2}$/.test(segment.replace(/%2e/gi, '.')))) {
      return { path, local: true };
    }
    return;
  }
  if (!/^https?:\/\//i.test(path) || !URL.canParse(path)) return;
  const url = new URL(path);
  if (!url.username && !url.password) return { path: url.href, local: false };
}

function footerNav(groups, issue = () => {}) {
  if (groups == null || groups === false) return [];
  if (!Array.isArray(groups)) {
    issue('footer.nav', '填写导航分组列表，或用 false 关闭。');
    return [];
  }
  return groups.flatMap((group, index) => {
    const key = `footer.nav[${index}]`;
    const title = label(group?.title);
    if (!title) issue(key + '.title', '填写分组名称或多语言名称。');
    if (!Array.isArray(group?.links)) {
      issue(key + '.links', '填写链接列表。');
      return [];
    }
    const links = group.links.flatMap((entry, linkIndex) => {
      const name = label(entry?.name);
      const target = destination(entry?.path);
      const linkKey = `${key}.links[${linkIndex}]`;
      if (!name) issue(linkKey + '.name', '填写链接名称或多语言名称。');
      if (!target) issue(linkKey + '.path', '填写以 / 开头的站内路径或不含凭据的 HTTP(S) 链接。');
      return name && target ? [{ name, ...target }] : [];
    });
    return title && links.length ? [{ title, links }] : [];
  });
}

module.exports = { footerNav };
