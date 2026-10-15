(() => {
  const root = document.documentElement;
  const themeButton = document.getElementById('theme-toggle');
  const syncThemeButton = () => themeButton?.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
  syncThemeButton();
  const brandLogo = document.querySelector('.brand__mark--image img');
  const restoreBrandMark = () => {
    const mark = brandLogo?.parentElement;
    if (!mark) return;
    mark.classList.remove('brand__mark--image');
    mark.textContent = '✦';
  };
  brandLogo?.addEventListener('error', restoreBrandMark, { once: true });
  if (brandLogo?.complete && brandLogo.naturalWidth === 0) restoreBrandMark();
  themeButton?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('morii-theme', root.dataset.theme); } catch { /* Keep the in-memory preference. */ }
    syncThemeButton();
  });

  const systemTheme = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
  systemTheme?.addEventListener('change', event => {
    let stored;
    try { stored = localStorage.getItem('morii-theme') || localStorage.getItem('mingzhi-theme'); } catch { /* Follow the system. */ }
    if (stored !== 'light' && stored !== 'dark') {
      root.dataset.theme = event.matches ? 'dark' : 'light';
      syncThemeButton();
    }
  });

  const menu = document.querySelector('.site-nav');
  const menuToggle = document.getElementById('menu-toggle');
  const closeMenu = () => {
    menu?.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  };
  menuToggle?.addEventListener('click', () => {
    const open = menu?.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(Boolean(open)));
  });
  document.addEventListener('click', event => {
    if (!menu?.contains(event.target) && !menuToggle?.contains(event.target)) closeMenu();
  });

  const dialog = document.getElementById('search-dialog');
  const input = document.getElementById('search-input');
  const results = [...document.querySelectorAll('#search-results li')];
  const status = document.getElementById('search-status');
  const empty = document.querySelector('.search-empty');
  const openSearch = () => {
    if (root.dataset.printPreview === 'true') return;
    if (!dialog || dialog.open) return;
    const navigation = document.getElementById('navigation-dialog');
    if (navigation?.open) navigation.close();
    closeMenu();
    dialog.showModal();
    input?.focus();
    dialog.dispatchEvent(new Event('morii:search-open'));
  };
  document.querySelectorAll('#search-open, [data-open-search]').forEach(button => button.addEventListener('click', openSearch));
  document.getElementById('search-close')?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  input?.addEventListener('input', () => {
    if (dialog?.dataset.searchReady === 'true') return;
    const keywords = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let count = 0;
    results.forEach(item => {
      item.hidden = !keywords.every(word => item.dataset.search.includes(word));
      if (!item.hidden) count += 1;
    });
    if (status) status.textContent = keywords.length ? `找到 ${count} 篇相关文章` : `搜索本站 ${results.length} 篇文章`;
    if (empty) empty.hidden = count > 0;
  });
  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      dialog?.open ? dialog.close() : openSearch();
    }
    if (event.key === 'Escape') closeMenu();
  });

  const fallbackImage = image => {
    if (!(image instanceof HTMLImageElement) || !image.closest('.post-card__media, .selected-card__media')) return;
    image.hidden = true;
    if (image.parentElement.querySelector('.post-card__placeholder')) return;
    const placeholder = document.createElement('span');
    placeholder.className = 'post-card__placeholder';
    placeholder.textContent = '✦';
    placeholder.setAttribute('aria-hidden', 'true');
    image.parentElement.append(placeholder);
  };
  document.addEventListener('error', event => fallbackImage(event.target), true);
  document.querySelectorAll('.post-card__media img, .selected-card__media img').forEach(image => {
    if (image.complete && image.naturalWidth === 0) fallbackImage(image);
  });

  const backToTop = document.getElementById('back-to-top');
  const updateBackToTop = () => { if (backToTop) backToTop.hidden = window.scrollY < 500; };
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  updateBackToTop();
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
})();
