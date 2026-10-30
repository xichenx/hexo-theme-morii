(async () => {
  const script = document.currentScript;
  const article = document.querySelector('.article-body');
  if (!article || !script) return;
  const t = (...args) => window.MoriiI18n ? window.MoriiI18n.t(...args) : args[0];
  const scriptLoad = url => new Promise((resolve, reject) => {
    const node = document.createElement('script'); node.src = url; node.async = true;
    const timer = setTimeout(() => { node.remove(); reject(new Error('Timeout')); }, 15000);
    node.onload = () => { clearTimeout(timer); resolve(); }; node.onerror = () => { clearTimeout(timer); node.remove(); reject(new Error('Unavailable')); };
    document.head.append(node);
  });
  const error = (element, retry) => {
    let button = element.parentElement.querySelector('.enhancement-retry');
    if (button) return;
    button = document.createElement('button'); button.className = 'enhancement-retry'; button.type = 'button'; button.textContent = t("渲染失败，点击重试");
    button.addEventListener('click', () => { button.remove(); retry(); }); element.after(button);
  };
  let mermaid;
  let diagramSerial = 0;
  let diagramPending = false;
  const renderDiagrams = async () => {
    if (diagramPending) return;
    const sources = [...article.querySelectorAll('.morii-diagram-source, figure.highlight.mermaid .code pre, pre code.language-mermaid')].filter(node => !node.dataset.rendered);
    if (!sources.length) return;
    diagramPending = true;
    try {
      mermaid = window.mermaid || mermaid || (await import(script.dataset.mermaid)).default;
      mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', suppressErrorRendering: true, theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'default' });
      for (const node of sources) {
        try {
          const code = node.textContent;
          const { svg } = await mermaid.render(`morii-diagram-${++diagramSerial}`, code);
          const figure = document.createElement('figure'); figure.className = 'article-diagram';
          const image = document.createElement('div'); image.className = 'article-diagram-image'; image.innerHTML = svg;
          const source = document.createElement('details'); const summary = document.createElement('summary'); summary.textContent = t("查看图表源码");
          const pre = document.createElement('pre'); pre.textContent = code; source.append(summary, pre); figure.append(image, source);
          const container = node.closest('.code-shell') || node.closest('figure.highlight') || (node.matches('code') ? node.parentElement : node);
          container.replaceWith(figure); node.dataset.rendered = 'true';
        } catch { error(node, renderDiagrams); }
      }
    } catch { sources.forEach(node => error(node, renderDiagrams)); }
    finally { diagramPending = false; }
  };
  const renderMath = async () => {
    const formulas = [...article.querySelectorAll('.morii-math:not([data-rendered])')];
    if (!formulas.length) return;
    try {
      if (!window.katex?.render) {
        if (!document.querySelector('[data-morii-math-style]')) { const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = script.dataset.mathCss; css.dataset.moriiMathStyle = ''; document.head.append(css); }
        await scriptLoad(script.dataset.math);
      }
      for (const element of formulas) {
        try { window.katex.render(element.textContent, element, { displayMode: element.dataset.display !== 'false', throwOnError: true, trust: false, maxExpand: 1000 }); element.dataset.rendered = 'true'; }
        catch { error(element, renderMath); }
      }
    } catch { formulas.forEach(element => error(element, renderMath)); }
  };
  const render = () => { if (script.dataset.mermaid) renderDiagrams(); if (script.dataset.math) renderMath(); };
  render();
  window.addEventListener('hexo-blog-decrypt', render);
})();
