'use strict'

// Keep the few tags used by existing posts while the presentation is rewritten.
const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char])

hexo.extend.tag.register('label', args => {
  const [text, tone] = args.join(' ').split(/\s+/)
  return `<span class="inline-label inline-label--${escapeHtml(tone || 'default')}">${escapeHtml(text)}</span>`
})

hexo.extend.tag.register('p', args => {
  const [modifiers, ...content] = args.join(' ').split(',')
  return `<p class="tag-paragraph ${escapeHtml(modifiers.trim().replace(/\s+/g, ' '))}">${escapeHtml(content.join(',').trim())}</p>`
})

hexo.extend.tag.register('link', args => {
  const [title, description, href] = args.join(' ').split(',')
  const safeHref = /^(https?:\/\/|\/)/i.test((href || '').trim()) ? href.trim() : '#'
  return `<a class="inline-link-card" href="${escapeHtml(safeHref)}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(title)}</strong><small>${escapeHtml(description)}</small><span>↗</span></a>`
})

hexo.extend.tag.register('folding', (args, content) => {
  const title = args.join(' ').split(',').pop().trim()
  const body = hexo.render.renderSync({ text: content, engine: 'markdown' })
  return `<details class="folding-tag"><summary>${escapeHtml(title)}</summary><div>${body}</div></details>`
}, { ends: true })

hexo.extend.tag.register('tabs', (args, content) => {
  const pattern = /<!--\s*tab\s+(.+?)\s*-->\s*([\s\S]*?)\s*<!--\s*endtab\s*-->/g
  const panels = [...content.matchAll(pattern)]
  if (!panels.length) return hexo.render.renderSync({ text: content, engine: 'markdown' })
  return `<div class="content-tabs">${panels.map((panel, index) => `<details ${index === 0 ? 'open' : ''}><summary>${escapeHtml(panel[1].split('@')[0])}</summary>${hexo.render.renderSync({ text: panel[2], engine: 'markdown' })}</details>`).join('')}</div>`
}, { ends: true })
