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
  const historySection = root.querySelector('[data-cinema-recent]');
  const historyList = root.querySelector('[data-cinema-history]');
  const resumeButton = root.querySelector('[data-cinema-resume]');
  const historyEntries = new Map([...watchButtons].map(([entry, button]) => [button.dataset.cinemaWatch, entry]));
  const stage = root.querySelector('[data-cinema-stage]');
  const close = root.querySelector('[data-cinema-close]');
  const episodeAnchor = root.querySelector('[data-cinema-episodes-anchor]');
  const episodeNav = root.querySelector('[data-cinema-episode-nav]');
  const episodeStatus = root.querySelector('[data-cinema-episode-status]');
  const previous = root.querySelector('[data-cinema-prev]');
  const next = root.querySelector('[data-cinema-next]');
  let activeFilter = 'all';
  let episodeList;
  let episodeControls = [];
  let activeEpisode = -1;
  let embed;
  let selectedButton;
  const selectButtons = [...root.querySelectorAll('[data-cinema-select]')];
  const scrollToStage = () => stage.scrollIntoView({
    behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ? 'instant' : 'smooth',
    block: 'start'
  });
  const watchStorageKey = `morii-cinema-watchlist:${root.dataset.cinema}`;
  const historyKey = `morii-cinema-history:${root.dataset.cinema}`;
  const historyLimit = 6;
  let history = [];
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

  function updateEpisodeNav() {
    episodeNav.hidden = activeEpisode < 0 || episodeControls.length < 2;
    if (episodeNav.hidden) return;
    previous.setAttribute('aria-disabled', String(activeEpisode === 0));
    next.setAttribute('aria-disabled', String(activeEpisode === episodeControls.length - 1));
    episodeStatus.textContent = t("{0}（{1}/{2}）", episodeControls[activeEpisode].textContent, activeEpisode + 1, episodeControls.length);
  }

  function renderHistory() {
    const valid = history.flatMap(({ film, episode }) => {
      const entry = historyEntries.get(film);
      const match = [...(entry?.querySelectorAll('[data-cinema-episode]') || [])]
        .find(item => item.dataset.cinemaEpisode === episode);
      return match ? [{ entry, episode: match }] : [];
    });
    if (historyList) {
      historyList.replaceChildren(...valid.map(({ entry, episode }) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = entry.querySelector('.cinema-card-link').href;
        const name = document.createElement('strong');
        name.textContent = entry.dataset.title;
        const detail = document.createElement('span');
        detail.textContent = episode.dataset.title;
        link.append(name, detail);
        item.append(link);
        return item;
      }));
      historySection.hidden = !valid.length;
    }
    if (resumeButton) {
      resumeButton.hidden = !valid.length;
      resumeButton.textContent = valid.length ? t("继续观看 · {0}", valid[0].episode.dataset.title) : '';
    }
    return valid[0];
  }

  function readHistory() {
    try {
      const saved = JSON.parse(localStorage.getItem(historyKey));
      history = Array.isArray(saved) ? saved.filter(record =>
        typeof record?.film === 'string' && typeof record.episode === 'string').slice(0, historyLimit) : [];
    } catch { /* Continue with the in-memory history. */ }
  }

  function saveHistory(records) {
    history = records;
    try { localStorage.setItem(historyKey, JSON.stringify(history)); } catch { /* Keep the history in memory. */ }
    renderHistory();
  }

  function play(episode, button, card, { keepPosition = false } = {}) {
    stop();
    if (episode.hasAttribute('data-cinema-episode')) {
      readHistory();
      const film = watchButtons.get(card).dataset.cinemaWatch;
      saveHistory([{ film, episode: episode.dataset.cinemaEpisode }, ...history.filter(item => item.film !== film)].slice(0, historyLimit));
    }
    activeEpisode = episodeControls.indexOf(button);
    episodeControls.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    updateEpisodeNav();
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
    if (!keepPosition) scrollToStage();
  }

  function select(card, opener, { preview, resume } = {}) {
    stop();
    selectedButton = opener;
    selectButtons.forEach(button => button.setAttribute('aria-pressed', String(button === opener)));
    title.textContent = preview ? `${card.dataset.title} · ${preview.dataset.title}` : card.dataset.title;
    description.textContent = card.dataset.description;
    type.textContent = { movie: t("电影"), series: t("电视剧"), anime: t("动漫") }[card.dataset.type] || t("电影");
    episodeList?.remove();
    episodeList = undefined;
    episodeControls = [];
    activeEpisode = -1;
    updateEpisodeNav();
    stage.hidden = false;
    if (preview) { play(preview, opener, card); return; }
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
    let resumeControl;
    episodeControls = episodes.map(episode => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = episode.dataset.title;
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => play(episode, button, card));
      if (episode === resume) resumeControl = button;
      episodeList.append(button);
      return button;
    });
    previous.onclick = () => {
      if (activeEpisode > 0) play(episodes[activeEpisode - 1], episodeControls[activeEpisode - 1], card, { keepPosition: true });
    };
    next.onclick = () => {
      if (activeEpisode >= 0 && activeEpisode < episodes.length - 1) {
        play(episodes[activeEpisode + 1], episodeControls[activeEpisode + 1], card, { keepPosition: true });
      }
    };
    episodeAnchor.append(episodeList);
    if (resumeControl) play(resume, resumeControl, card);
    else scrollToStage();
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
    trailer.addEventListener('click', () => select(trailer.closest(entrySelector), trailer, { preview: trailer }));
  }
  resumeButton?.addEventListener('click', () => {
    readHistory();
    const recent = renderHistory();
    if (recent) select(recent.entry, resumeButton, { resume: recent.episode });
  });
  root.querySelector('[data-cinema-clear-history]')?.addEventListener('click', () => {
    saveHistory([]);
    search?.focus({ preventScroll: true });
  });
  const refreshHistory = () => {
    readHistory();
    renderHistory();
  };
  refreshHistory();
  window.addEventListener('pageshow', event => { if (event.persisted) refreshHistory(); });
  window.addEventListener('storage', event => { if (!event.key || event.key === historyKey) refreshHistory(); });
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
