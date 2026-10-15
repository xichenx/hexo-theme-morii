(() => {
  const dialog = document.getElementById('image-dialog');
  const preview = document.getElementById('image-preview');
  const caption = document.getElementById('image-caption');
  const selector = '.article-body img, .photo-card img, .essay-images img';
  const previous = document.getElementById('image-previous');
  const next = document.getElementById('image-next');
  const counter = document.getElementById('image-counter');
  const status = document.getElementById('image-status');
  const retry = document.getElementById('image-retry');
  const original = document.getElementById('image-original');
  let images = [];
  let index = 0;
  const sourceFor = image => {
    const link = image.closest('a');
    return link && image.closest('.photo-card, .essay-images') ? link.href : image.currentSrc || image.src;
  };
  const render = () => {
    const image = images[index];
    if (!image || !preview) return;
    if (status) status.textContent = '正在加载图片…';
    if (retry) retry.hidden = true;
    preview.hidden = false;
    preview.src = sourceFor(image);
    preview.alt = image.alt || '图片预览';
    if (caption) caption.textContent = image.closest('[data-caption]')?.dataset.caption || image.alt || '';
    if (counter) counter.textContent = `${index + 1} / ${images.length}`;
    if (previous) previous.disabled = index === 0;
    if (next) next.disabled = index === images.length - 1;
    if (original) original.href = sourceFor(image);
  };
  const move = direction => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    index = target;
    render();
  };
  const openImage = image => {
    if (document.documentElement.dataset.printPreview === 'true') return;
    if (!dialog || !preview) return;
    const gallery = image.closest('[data-gallery], .article-body, .essay-images');
    images = gallery ? [...gallery.querySelectorAll('img')].filter(item => item.matches(selector) && (!item.closest('a') || item.closest('.photo-card, .essay-images') || item.closest('a').href === item.src)) : [image];
    index = images.indexOf(image);
    if (index < 0) { images = [image]; index = 0; }
    render();
    if (!dialog.open) dialog.showModal();
  };
  previous?.addEventListener('click', () => move(-1));
  next?.addEventListener('click', () => move(1));
  retry?.addEventListener('click', () => { preview.removeAttribute('src'); render(); });
  preview?.addEventListener('load', () => { if (status) status.textContent = ''; });
  preview?.addEventListener('error', () => {
    if (!dialog?.open) return;
    preview.hidden = true;
    if (status) status.textContent = '图片暂时无法加载，可以重试或打开原图。';
    if (retry) retry.hidden = false;
  });
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const image = event.target.matches(selector) ? event.target : event.target.closest('.photo-card, .essay-images a')?.querySelector('img');
    if (!image) return;
    const link = image.closest('a');
    if (link && !image.closest('.photo-card, .essay-images') && link.href !== image.src) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openImage(image);
  });
  const enhanceImages = () => {
    document.querySelectorAll('[data-image-fallback] img').forEach(image => {
      if (image.dataset.fallbackReady) return;
      image.dataset.fallbackReady = 'true';
      const update = failed => {
        const holder = image.closest('[data-image-fallback]');
        holder.classList.toggle('image-failed', failed);
        const placeholder = holder.querySelector('.image-placeholder');
        if (placeholder) placeholder.hidden = !failed;
      };
      image.addEventListener('error', () => update(true));
      image.addEventListener('load', () => update(false));
      if (image.complete && image.getAttribute('src')) update(image.naturalWidth === 0);
    });
    document.querySelectorAll(selector).forEach(image => {
      if (image.closest('a')) return;
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', `预览图片${image.alt ? `：${image.alt}` : ''}`);
    });
  };
  enhanceImages();
  window.addEventListener('hexo-blog-decrypt', enhanceImages);
  document.addEventListener('keydown', event => {
    if (dialog?.open && (event.key === 'ArrowLeft' || event.key === 'ArrowRight') && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
      return;
    }
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches?.(selector) && !event.target.closest('a')) {
      event.preventDefault();
      openImage(event.target);
    }
  });
  document.getElementById('image-close')?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog?.addEventListener('close', () => preview?.removeAttribute('src'));
  document.querySelectorAll('audio').forEach(audio => audio.addEventListener('play', () => {
    document.querySelectorAll('audio').forEach(other => { if (audio !== other) other.pause(); });
  }));
})();
