'use strict';
hexo.extend.helper.register('morii_category_directory', categories => {
  const list = collection => Array.isArray(collection) ? [...collection] : collection?.toArray?.() || [];
  return list(categories).map(category => {
    const posts = list(category.posts).filter(post => post.published !== false).sort((a, b) => Number(b.date) - Number(a.date));
    const symbols = { android: '<>', flutter: '⌁', harmonyos: '◎', kmp: '⇄', tauri: '↗', ai: '✦', '实习': '✎', '编译原理': '{ }' };
    const tone = [...String(category.name)].reduce((total, character) => total + character.codePointAt(0), 0) % 4;
    return { name: category.name, path: category.path, count: posts.length, latest: posts.slice(0, 3), symbol: symbols[String(category.name).toLowerCase()] || '#', tone };
  }).filter(category => category.count).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
});
