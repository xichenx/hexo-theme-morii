'use strict';

const { forPage } = require('../scripts/lib/i18n.cjs');
const { stripInlineAnswers } = require('../scripts/lib/inline-answer.cjs');
const { parseDocument, DomUtils } = require('htmlparser2');
const { stripHTML, unescapeHTML, truncate } = require('hexo-util')

const proseMarkup = source => stripInlineAnswers(source)
  .replace(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi, ' ')
  .replace(/<(pre|script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<\/(?:p|div|h[1-6]|li|section|blockquote)>/gi, ' ');

hexo.extend.helper.register('morii_excerpt', function (post, length = 100) {
  const t = (...args) => forPage(hexo, this).t(...args);
  if (post.password) return t("这是一篇加密文章，输入密码后可以继续阅读。")
  const source = post.description || post.excerpt || post.content || ''
  const plain = unescapeHTML(stripHTML(proseMarkup(source))).replace(/\s+/g, ' ').trim()
  if (!plain) return /<(?:pre|figure)\b/i.test(String(source)) ? t("代码笔记 · 打开全文查看完整示例。") : t("暂未提供摘要，点击查看文章。")
  return truncate(plain, { length })

})

hexo.extend.helper.register('morii_article_word_count', function (post) {
  if (post.password) return '';
  const markup = proseMarkup(post.content || '').replace(/<br\b[^>]*>/gi, ' ');
  const text = DomUtils.textContent(parseDocument(markup));
  const han = text.match(/\p{Script=Han}/gu)?.length || 0;
  const words = text.replace(/\p{Script=Han}/gu, ' ').match(/[\p{L}\p{N}][\p{L}\p{M}\p{N}]*/gu)?.length || 0;
  const count = han + words;
  if (!count) return '';
  const { locale, t } = forPage(hexo, this);
  return t('字数 {0}', new Intl.NumberFormat(locale).format(count));
});

hexo.extend.helper.register('morii_search_text', post => {
  const source = `${post.title || ''} ${post.password ? '' : post.description || post.excerpt || ''}`
  return unescapeHTML(stripHTML(stripInlineAnswers(source))).replace(/\s+/g, ' ').slice(0, 400).toLowerCase()
})
