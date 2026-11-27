(() => {
  const t = (...args) => window.MoriiI18n ? window.MoriiI18n.t(...args) : args[0].replace(/\{(\d+)\}/g, (_, i) => String(args[Number(i) + 1] ?? ''));
  'use strict';
  const root = document.querySelector('[data-cinema]');
  if (!root) return;
  const cards = [...root.querySelectorAll('[data-cinema-card]')];
  const entries = [...root.querySelectorAll('[data-cinema-card], [data-cinema-detail]')];
  const trailer = root.querySelector('[data-cinema-trailer]');
  const video = root.querySelector('[data-cinema-video]');
  const embedTemplate = root.querySelector('[data-cinema-embed]');
  const sourceLink = root.querySelector('[data-cinema-source]');
  const placeholder = root.querySelector('[data-cinema-placeholder]');
  const title = root.querySelector('[data-cinema-title]');
  const description = root.querySelector('[data-cinema-description]');
  const type = root.querySelector('[data-cinema-type]');
  const noResults = root.querySelector('[data-cinema-no-results]');
  const search = root.querySelector('[data-cinema-search]');
  const filters = [...root.querySelectorAll('[data-cinema-filter]')];
  const watchFilter = root.querySelector('[data-cinema-filter="watchlist"]');
  const watchCount = root.querySelector('[data-cinema-watch-count]');
  const watchButtons = new Map(entries.map(entry => [entry, entry.querySelector('[data-cinema-watch]')]));
  const stage = root.querySelector('[data-cinema-stage]');
  const close = root.querySelector('[data-cinema-close]');
  const episodeAnchor = root.querySelector('[data-cinema-episodes-anchor]');
  let activeFilter = 'all';
  let episodeList;
  let embed;
  let selectedButton;
  const selectButtons = [...root.querySelectorAll('[data-cinema-select]')];
  const scrollToStage = () => stage.scrollIntoView({
    behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ? 'instant' : 'smooth',
    block: 'start'
  });
  const watchStorageKey = `morii-cinema-watchlist:${root.dataset.cinema}`;
  const watchlist = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem(watchStorageKey));
    if (Array.isArray(saved)) saved.filter(id => typeof id === 'string').forEach(id => watchlist.add(id));
  } catch { /* The watchlist can still be used while the page is open. */ }

  function updateWatchlist() {
    let count = 0;
    for (const button of watchButtons.values()) {
      const saved = watchlist.has(button.dataset.cinemaWatch);
      button.setAttribute('aria-pressed', String(saved));
      if (saved) count++;
    }
    if (watchCount) watchCount.textContent = count;
  }

  function stop() {
    if (video?.hasAttribute('src')) {
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.hidden = true;
    }
    embed?.remove();
    embed = undefined;
    if (sourceLink) { sourceLink.hidden = true; sourceLink.removeAttribute('href'); }
    if (placeholder) placeholder.hidden = false;
  }

  function play(episode, button) {
    stop();
    episodeList?.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    placeholder.hidden = true;
    if (episode.dataset.kind === 'embed') {
      if (episode.dataset.watchUrl) {
        sourceLink.href = episode.dataset.watchUrl;
        sourceLink.hidden = false;
      }
      embed = embedTemplate.content.firstElementChild.cloneNode(true);
      embed.src = episode.dataset.url;
      embed.title = episode.dataset.title;
      embedTemplate.after(embed);
    } else {
      video.src = episode.dataset.url;
      video.hidden = false;
      video.play().catch(() => {});
    }
    document.getElementById('music-player')?.pause();
    scrollToStage();
  }

  function select(card, opener, preview) {
    stop();
    selectedButton = opener;
    selectButtons.forEach(button => button.setAttribute('aria-pressed', String(button === opener)));
    title.textContent = preview ? `${card.dataset.title} · ${preview.dataset.title}` : card.dataset.title;
    description.textContent = card.dataset.description || t("选一集，开始播放。");
    type.textContent = { movie: t("电影"), series: t("电视剧"), anime: t("动漫") }[card.dataset.type] || t("电影");
    episodeList?.remove();
    episodeList = undefined;
    stage.hidden = false;
    if (preview) { play(preview, opener); return; }
    episodeList = document.createElement('div');
    episodeList.className = 'cinema-episodes';
    episodeList.setAttribute('role', 'group');
    episodeList.setAttribute('aria-label', t("{0} 选集", card.dataset.title));
    const episodes = [...card.querySelectorAll('[data-cinema-episode]')];
    const label = document.createElement('span');
    label.className = 'cinema-episodes-title';
    label.textContent = episodes.length ? t("选择片源 / 选集") : t("片源状态");
    episodeList.append(label);
    if (!episodes.length) {
      const note = document.createElement('p');
      note.textContent = t("这部作品暂时没有可用片源。");
      episodeList.append(note);
    }
    episodes.forEach(episode => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = episode.dataset.title;
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => play(episode, button));
      episodeList.append(button);
    });
    episodeAnchor.append(episodeList);
    scrollToStage();
  }

  function filter() {
    if (!search) return;
    const query = search.value.trim().toLocaleLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const matchesFilter = activeFilter === 'watchlist'
        ? watchlist.has(watchButtons.get(card).dataset.cinemaWatch)
        : activeFilter === 'all' || card.dataset.type === activeFilter;
      const show = matchesFilter && card.dataset.title.toLocaleLowerCase().includes(query);
      card.hidden = !show;
      if (show) visible++;
    });
    if (noResults) {
      noResults.hidden = visible !== 0;
      if (!visible) noResults.textContent = activeFilter === 'watchlist' && watchCount.textContent === '0'
        ? t("想看片单还是空的。返回全部作品，点星标添加。")
        : t("没有找到符合条件的作品，试试别的关键词。");
    }
  }

  for (const [card, button] of watchButtons) {
    button.addEventListener('click', () => {
      const key = button.dataset.cinemaWatch;
      if (!watchlist.delete(key)) watchlist.add(key);
      try { localStorage.setItem(watchStorageKey, JSON.stringify([...watchlist])); } catch { /* Keep the current list in memory. */ }
      updateWatchlist();
      filter();
      if (card.hidden) watchFilter?.focus();
    });
    button.hidden = false;
  }
  updateWatchlist();
  if (watchFilter) watchFilter.hidden = false;
  const entrySelector = '[data-cinema-card], [data-cinema-detail]';
  selectButtons.forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => select(button.closest(entrySelector), button));
  });
  if (trailer) {
    trailer.hidden = false;
    trailer.addEventListener('click', () => select(trailer.closest(entrySelector), trailer, trailer));
  }
  close?.addEventListener('click', () => {
    stop();
    stage.hidden = true;
    selectButtons.forEach(button => button.setAttribute('aria-pressed', 'false'));
    if (selectedButton?.closest('[data-cinema-card]')?.hidden) filters.find(button => button.dataset.cinemaFilter === activeFilter)?.focus();
    else selectedButton?.focus();
  });
  filters.forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.cinemaFilter;
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    filter();
  }));
  search?.addEventListener('input', filter);
  window.addEventListener('pagehide', stop);
})();
