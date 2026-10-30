'use strict';

const { forPage } = require('../scripts/lib/i18n.cjs');
const { stripHTML, unescapeHTML, truncate } = require('hexo-util')

hexo.extend.helper.register('morii_excerpt', function (post, length = 100) {
  const t = (...args) => forPage(hexo, this).t(...args);
  if (post.password) return t("这是一篇加密文章，输入密码后可以继续阅读。")
  const source = post.description || post.excerpt || post.content || ''
  const text = String(source)
    .replace(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi, ' ')
    .replace(/<(pre|script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(?:p|div|h[1-6]|li|section|blockquote)>/gi, ' ')
  const plain = unescapeHTML(stripHTML(text)).replace(/\s+/g, ' ').trim()
  if (!plain) return /<(?:pre|figure)\b/i.test(String(source)) ? t("代码笔记 · 打开全文查看完整示例。") : t("暂未提供摘要，点击查看文章。")
  return truncate(plain, { length })

})

hexo.extend.helper.register('morii_search_text', post => {
  const source = `${post.title || ''} ${post.password ? '' : post.description || post.excerpt || ''}`
  return unescapeHTML(stripHTML(source)).replace(/\s+/g, ' ').slice(0, 400).toLowerCase()
})
