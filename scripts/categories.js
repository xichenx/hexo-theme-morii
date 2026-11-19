'use strict';

const categoryPath = path => String(path || '').replace(/^\/+|\/+$/g, '');
const matchesCategory = (page, category) => page.base
  ? categoryPath(page.base) === categoryPath(category.path)
  : page.category === category.name;

hexo.extend.helper.register('morii_is_current_category', matchesCategory);

hexo.extend.helper.register('morii_category_directory', categories => {
  const list = collection => Array.isArray(collection) ? [...collection] : collection?.toArray?.() || [];
  return list(categories).map(category => {
    const posts = list(category.posts).filter(post => post.published !== false).sort((a, b) => Number(b.date) - Number(a.date));
    const symbols = { android: '<>', flutter: '⌁', harmonyos: '◎', kmp: '⇄', tauri: '↗', ai: '✦', '实习': '✎', '编译原理': '{ }' };
    const tone = [...String(category.name)].reduce((total, character) => total + character.codePointAt(0), 0) % 4;
    return { id: category._id, parent: category.parent, name: category.name, path: category.path, count: posts.length, latest: posts.slice(0, 3), symbol: symbols[String(category.name).toLowerCase()] || '#', tone };
  }).filter(category => category.count).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
});

hexo.extend.helper.register('morii_category_hierarchy', (topics, page) => {
  const matches = topics.filter(topic => matchesCategory(page, topic));
  if (matches.length !== 1) return { ancestors: [], children: [] };
  const [current] = matches;
  const byId = new Map(topics.map(topic => [topic.id, topic]));
  const ancestors = [];
  const visited = new Set([current.id]);
  let parentId = current.parent;
  while (parentId && !visited.has(parentId)) {
    const parent = byId.get(parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    visited.add(parentId);
    parentId = parent.parent;
  }
  return {
    current,
    ancestors,
    children: current.id ? topics.filter(topic => topic.parent === current.id) : []
  };
});
