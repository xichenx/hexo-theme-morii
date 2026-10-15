(() => {
  const key = 'morii-reading-list';
  const button = document.querySelector('[data-save-post]');
  const page = document.querySelector('[data-reading-list]');
  const message = document.getElementById('reading-list-message');
  const status = document.getElementById('reading-list-status');
  const grid = document.getElementById('reading-list-items');
  const retry = document.getElementById('reading-list-retry');
  let metadata;
  let pending;
  let storageError = '';
  let loadError = '';
  const pathFor = value => {
    if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u001f]/.test(value)) return '';
    try {
      const url = new URL(value, location.href);
      return url.origin === location.origin ? url.pathname.replace(/index\.html$/, '') : '';
    } catch { return ''; }
  };
  const read = () => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '[]');
      if (!Array.isArray(data)) throw new Error('Invalid list');
      storageError = '';
      return [...new Set(data.map(pathFor).filter(Boolean))].slice(0, 100);
    } catch {
      storageError = '无法读取本机收藏。请检查浏览器存储设置。';
      return [];
    }
  };
  const change = transform => {
    const current = read();
    const next = transform(current);
    if (!next) return false;
    try {
      localStorage.setItem(key, JSON.stringify(next));
      storageError = '';
      render();
      return true;
    } catch {
      const text = '无法保存收藏，请检查浏览器是否允许网站存储。';
      if (message) message.textContent = text;
      if (status) status.textContent = text;
      return false;
    }
  };
  const render = () => {
    const saved = read();
    if (button) {
      const active = saved.includes(pathFor(button.dataset.savePost));
      button.hidden = false;
      button.setAttribute('aria-pressed', String(active));
      button.textContent = active ? '已加入稍后阅读 ★' : '加入稍后阅读 ☆';
      if (storageError && message) message.textContent = storageError;
    }
    if (!page || !grid) return;
    document.getElementById('reading-list-empty').hidden = saved.length > 0 || Boolean(storageError);
    let missing = 0;
    grid.replaceChildren(...saved.map(path => {
      const entry = metadata?.get(path);
      if (!entry) missing += 1;
      const card = document.createElement('article');
      card.className = 'saved-card panel';
      const heading = document.createElement('h2');
      if (entry) {
        const link = document.createElement('a');
        link.href = path;
        link.textContent = entry.title;
        heading.append(link);
      } else heading.textContent = metadata ? '暂未找到这篇文章' : '正在等待文章信息';
      const description = document.createElement('p');
      description.textContent = entry ? `${entry.protected ? '加密文章 · ' : ''}${entry.date || '打开文章继续阅读'}` : path;
      const actions = document.createElement('div');
      actions.className = 'saved-card__actions';
      if (entry) {
        const link = document.createElement('a');
        link.className = 'text-link';
        link.href = path;
        link.textContent = '继续阅读 →';
        actions.append(link);
      }
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = '移除';
      remove.setAttribute('aria-label', `从稍后阅读移除${entry?.title || '此文章'}`);
      remove.addEventListener('click', () => { change(current => current.filter(item => item !== path)); });
      actions.append(remove);
      card.append(heading, description, actions);
      return card;
    }));
    if (status) status.textContent = storageError || loadError || `收藏了 ${saved.length} 篇文章${metadata && missing ? `，其中 ${missing} 篇暂未找到，记录仍保留。` : '。'}`;
  };
  const load = () => {
    if (!page || pending || !read().length) return pending;
    grid.setAttribute('aria-busy', 'true');
    if (retry) retry.hidden = true;
    loadError = '';
    pending = (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch(page.dataset.index, { signal: controller.signal });
        if (!response.ok) throw new Error('Index unavailable');
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid index');
        metadata = new Map(data.filter(entry => entry && pathFor(entry.url) && typeof entry.title === 'string').map(entry => [pathFor(entry.url), entry]));
      } catch {
        loadError = '文章信息暂时无法加载，收藏记录仍保留，可稍后重试。';
        if (retry) retry.hidden = false;
      } finally {
        clearTimeout(timeout);
        pending = null;
        grid.setAttribute('aria-busy', 'false');
        render();
      }
    })();
    return pending;
  };
  button?.addEventListener('click', () => {
    const path = pathFor(button.dataset.savePost);
    if (!path) return;
    let added;
    const changed = change(current => {
      added = !current.includes(path);
      if (added && current.length >= 100) {
        if (message) message.textContent = '收藏已达 100 篇，请先在稍后阅读中移除一些文章。';
        return null;
      }
      return added ? [path, ...current] : current.filter(item => item !== path);
    });
    if (changed && message) message.textContent = added ? '已收藏，可以在稍后阅读中找到。' : '已从稍后阅读移除。';
  });
  retry?.addEventListener('click', load);
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    render();
    if (!metadata) load();
  });
  render();
  load();
})();
