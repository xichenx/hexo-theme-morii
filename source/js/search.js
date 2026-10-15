(() => {
  const dialog = document.getElementById('search-dialog');
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const service = document.getElementById('search-service-status');
  const retry = document.getElementById('search-retry');
  const more = document.getElementById('search-more');
  if (!dialog || !input || !results) return;
  const status = document.getElementById('search-status');
  const empty = dialog.querySelector('.search-empty');
  const pageSize = Math.max(5, Math.min(30, Number(dialog.dataset.pageSize) || 10));
  let entries;
  let loading;
  let visible = pageSize;
  const words = () => [...new Set(input.value.trim().toLowerCase().split(/\s+/).filter(Boolean))].slice(0, 20);
  const highlight = (element, text, keywords) => {
    const lower = text.toLowerCase();
    let position = 0;
    while (position < text.length) {
      let start = text.length;
      let length = 0;
      keywords.forEach(word => {
        const found = lower.indexOf(word, position);
        if (found >= 0 && (found < start || (found === start && word.length > length))) { start = found; length = word.length; }
      });
      if (start > position) element.append(document.createTextNode(text.slice(position, start)));
      if (!length) break;
      const mark = document.createElement('mark');
      mark.textContent = text.slice(start, start + length);
      element.append(mark);
      position = start + length;
    }
  };
  const render = () => {
    if (!entries) return;
    const keywords = words();
    const matches = entries.map((entry, index) => {
      const title = entry.title.toLowerCase();
      const haystack = `${title} ${entry.content.toLowerCase()} ${entry.topics.toLowerCase()}`;
      return { entry, index, match: keywords.every(word => haystack.includes(word)), score: keywords.reduce((sum, word) => sum + (title.includes(word) ? 3 : entry.topics.toLowerCase().includes(word) ? 1 : 0), 0) };
    }).filter(item => item.match).sort((a, b) => b.score - a.score || a.index - b.index);
    results.replaceChildren(...matches.slice(0, visible).map(({ entry }) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = entry.url;
      const title = document.createElement('strong');
      highlight(title, entry.title, keywords);
      const summary = document.createElement('p');
      summary.className = 'search-result-summary';
      if (entry.protected) summary.textContent = '加密文章 · 输入密码后阅读全文';
      else {
        const lower = entry.content.toLowerCase();
        const offsets = keywords.map(word => lower.indexOf(word)).filter(index => index >= 0);
        const start = offsets.length ? Math.max(0, Math.min(...offsets) - 32) : 0;
        const text = entry.content.slice(start, start + 150);
        highlight(summary, `${start ? '…' : ''}${text}${start + 150 < entry.content.length ? '…' : ''}`, keywords);
      }
      const meta = document.createElement('small');
      meta.textContent = entry.date;
      link.append(title, summary, meta);
      item.append(link);
      return item;
    }));
    if (status) status.textContent = `${keywords.length ? '找到' : '共'} ${matches.length} 篇文章 · 已展示 ${Math.min(visible, matches.length)} 篇`;
    if (empty) empty.hidden = matches.length > 0;
    if (more) more.hidden = matches.length <= visible;
  };
  const load = () => {
    if (entries || loading || !dialog.dataset.searchIndex) return loading;
    if (service) service.textContent = '正在加载正文搜索…';
    if (retry) retry.hidden = true;
    results.setAttribute('aria-busy', 'true');
    loading = (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch(dialog.dataset.searchIndex, { signal: controller.signal });
        if (!response.ok) throw new Error('Index unavailable');
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid index');
        const seen = new Set();
        entries = data.filter(entry => {
          if (!entry || typeof entry.title !== 'string' || typeof entry.url !== 'string') return false;
          try {
            const url = new URL(entry.url, location.href);
            if (url.origin !== location.origin || !/^https?:$/.test(url.protocol) || seen.has(url.href)) return false;
            seen.add(url.href);
            entry.url = url.href;
            entry.content = entry.protected ? '' : String(entry.content || '');
            entry.topics = entry.protected ? '' : String(entry.topics || '');
            entry.date = String(entry.date || '');
            return true;
          } catch { return false; }
        });
        dialog.dataset.searchReady = 'true';
        if (service) service.textContent = '支持标题、正文和标签搜索 · 多个关键词用空格分隔';
        render();
      } catch {
        if (service) service.textContent = '正文搜索暂不可用，仍可按标题或摘要搜索。';
        if (retry) retry.hidden = false;
      } finally {
        clearTimeout(timeout);
        loading = null;
        results.setAttribute('aria-busy', 'false');
      }
    })();
    return loading;
  };
  dialog.addEventListener('morii:search-open', load);
  input.addEventListener('input', () => { visible = pageSize; render(); });
  retry?.addEventListener('click', load);
  more?.addEventListener('click', () => { visible += pageSize; render(); });
  document.getElementById('search-clear')?.addEventListener('click', () => {
    input.value = '';
    input.dispatchEvent(new Event('input'));
    input.focus();
  });
})();
