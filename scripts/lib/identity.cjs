'use strict';
function identity(site, theme, localized = value => value) {
  const text = value => typeof value === 'string' ? value.trim() : '';
  const inherit = (value, fallback) => value === false ? '' : text(localized(value)) || text(fallback);
  const brand = text(localized(theme.brand)) || text(site.title) || 'Morii';
  const tagline = inherit(theme.tagline, site.subtitle);
  const intro = inherit(theme.intro, site.description);
  const avatar = inherit(theme.avatar, site.avatar) || '/icons/brand/morii-logo-v2.png';
  const configured = localized(theme.hero?.title);
  let title = typeof configured === 'string' ? [configured] : configured && typeof configured === 'object' ? [configured[0], configured[1]] : [];
  title = title.map(value => text(localized(value)));
  if (!title.some(Boolean)) title = [text(site.title) || brand, text(site.subtitle)];
  return { brand, tagline, intro, avatar, title };
}
module.exports = { identity };
