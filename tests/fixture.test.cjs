'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { buildDemo } = require('../tools/demo.cjs');
const pages = ['index.html', 'page/2/index.html', 'posts/welcome/index.html', 'archives/index.html', 'categories/index.html', 'categories/主题使用/index.html', 'tags/index.html', 'about/index.html', 'link/index.html', 'album/index.html', 'album/morii/index.html', 'music/index.html', 'cinema/index.html', 'reading-list/index.html', '404.html'];

test('theme builds independently at both domain root and a Pages subdirectory', async t => {
  for (const prefix of ['/', '/hexo-theme-morii/']) await t.test(prefix, async () => {
    const output = await buildDemo({ root: prefix, url: 'https://example.test' });
    for (const file of pages) {
      assert.ok(fs.existsSync(path.join(output, file)), `Generated ${file}`);
      const dom = new JSDOM(fs.readFileSync(path.join(output, file), 'utf8'), { url: `https://example.test${prefix}${file}` });
      const document = dom.window.document;
      assert.equal(document.querySelectorAll('main h1').length, 1, `${file}: one page heading`);
      const introTones = {
        'page/2/index.html': 'archive',
        'archives/index.html': 'archive',
        'categories/index.html': 'categories',
        'categories/主题使用/index.html': 'taxonomy',
        'tags/index.html': 'tags',
        'about/index.html': 'about',
        'link/index.html': 'link',
        'album/index.html': 'album',
        'album/morii/index.html': 'album_detail',
        'music/index.html': 'music',
        'cinema/index.html': 'cinema',
        'reading-list/index.html': 'reading'
      };
      if (introTones[file]) {
        const intro = document.querySelector('main .page-intro');
        assert.equal(intro?.dataset.introTone, introTones[file], `${file}: page-specific intro tone`);
        assert.ok(intro?.dataset.introWord, `${file}: decorative intro label`);
      }
      assert.ok(document.querySelector('#morii-audio-hub'), `${file}: shared music player`);
      assert.ok(document.querySelector('.morii-atmosphere[aria-hidden="true"] #morii-particles'), `${file}: decorative particles`);
      assert.equal(document.documentElement.dataset.glass, 'on');
      assert.equal(document.querySelector('#effects-dialog, [data-open-effects], [data-effect-option]'), null, `${file}: effects are owner-configured only`);
      assert.equal(document.documentElement.dataset.themeTransition, 'on');
      assert.equal(document.querySelectorAll('#comment-service').length, 0, 'Demo must not use a personal comment service');
      if (file === 'index.html' || file === 'page/2/index.html') {
        const cards = [...document.querySelectorAll('#latest .post-grid > .post-card')];
        assert.equal(cards.length, file === 'index.html' ? 5 : 2);
        const covers = [...document.querySelectorAll('#latest .post-card__media img')].map(image => image.getAttribute('src'));
        assert.deepEqual(covers, file === 'index.html' ? [
          `${prefix}images/covers/welcome.jpg`,
          `${prefix}images/covers/cards.jpg`,
          `${prefix}images/covers/music.jpg`
        ] : [], 'Demo uses new article covers, not the app icon');
        assert.equal(document.querySelectorAll('#latest .post-card__placeholder').length, 2, 'Articles without covers use the star fallback');
        const featured = cards.filter(card => card.classList.contains('post-card--featured'));
        assert.equal(featured.length, cards.length % 2, `${file}: only odd lists need a leading wide card`);
        if (featured.length) assert.equal(featured[0], cards[0]);
        assert.ok(!cards.at(-1).classList.contains('post-card--featured'), `${file}: final card must remain paired`);
        if (file === 'index.html') assert.ok([...document.querySelectorAll('#latest .post-card__media img')].every(image => image.getAttribute('loading') === 'lazy'), 'Images below the home hero stay lazy');
      }
      if (file === 'album/morii/index.html') {
        const photos = [...document.querySelectorAll('.photo-card img')];
        assert.deepEqual(photos.map(image => image.getAttribute('loading')), ['eager', 'eager']);
        assert.deepEqual(photos.map(image => image.getAttribute('fetchpriority')), ['high', 'high']);
      }
      for (const node of document.querySelectorAll('script[src],link[rel="stylesheet"],img[src]')) {
        const raw = node.getAttribute('src') || node.getAttribute('href');
        const url = new URL(raw, dom.window.location.href);
        if (url.origin !== 'https://example.test') continue;
        assert.ok(url.pathname.startsWith(prefix), `${file}: ${raw} must stay within deployment root`);
        const local = decodeURIComponent(url.pathname.slice(prefix.length));
        assert.ok(fs.existsSync(path.join(output, local)), `${file}: missing asset ${local}`);
      }
      for (const link of document.querySelectorAll('.site-nav a, .footer-explore a')) {
        const url = new URL(link.href);
        assert.ok(url.pathname.startsWith(prefix), `${file}: navigation root`);
        const local = decodeURIComponent(url.pathname.slice(prefix.length));
        assert.ok(fs.existsSync(path.join(output, local, 'index.html')), `${file}: navigation ${local}`);
      }
      const music = JSON.parse(document.querySelector('#morii-audio-hub').dataset.musicConfig);
      assert.ok(music.remote && music.remote.api.startsWith('https://'));
      const musicStyle = document.querySelector('link[href*="music.css"]');
      assert.match(musicStyle.href, /music\.css\?v=full-stage-2$/);
      assert.equal(musicStyle.media, file === 'music/index.html' ? '' : 'print', `${file}: inactive music styles must not block first paint`);
      for (const name of ['search', 'motion']) assert.equal(document.querySelector(`link[href$="/css/${name}.css"]`)?.media, 'print');
      dom.window.close();
    }
    const index = JSON.parse(fs.readFileSync(path.join(output, 'morii-search.json'), 'utf8'));
    const cinemaDom = new JSDOM(fs.readFileSync(path.join(output, 'cinema/index.html'), 'utf8'), { url: `https://example.test${prefix}cinema/`, runScripts: 'outside-only' });
    const cinema = cinemaDom.window.document;
    assert.match(cinema.querySelector('link[href*="cinema.css"]').href, /cinema\.css\?v=wide-catalog-1$/);
    assert.match(cinema.querySelector('script[src*="cinema.js"]').src, /cinema\.js\?v=wide-catalog-1$/);
    const cinemaVideo = cinema.querySelector('[data-cinema-video]');
    cinemaVideo.load = () => {};
    cinemaVideo.pause = () => {};
    cinemaVideo.play = () => Promise.resolve();
    cinema.querySelector('#music-player').pause = () => {};
    cinemaDom.window.HTMLElement.prototype.scrollIntoView = () => {};
    cinemaDom.window.eval(fs.readFileSync(path.join(__dirname, '../source/js/cinema.js'), 'utf8'));
    assert.equal(cinema.querySelectorAll('[data-cinema-card]').length, 3);
    assert.equal(cinema.querySelector('[data-cinema-stage]').hidden, true);
    cinema.querySelector('[data-cinema-card] [data-cinema-select]').click();
    assert.equal(cinema.querySelector('[data-cinema-stage]').hidden, false);
    assert.equal(cinema.querySelector('[data-cinema-title]').textContent, '花朵 · 播放示例');
    assert.equal(cinema.querySelector('[data-cinema-card] [data-cinema-select]').getAttribute('aria-pressed'), 'true');
    assert.equal(cinema.querySelector('.cinema-episodes').parentElement.className, 'cinema-episodes-anchor');
    cinema.querySelector('.cinema-episodes button').click();
    assert.equal(cinemaVideo.src, 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4');
    cinema.querySelector('[data-cinema-close]').click();
    assert.equal(cinema.querySelector('[data-cinema-stage]').hidden, true);
    assert.equal(cinemaVideo.hasAttribute('src'), false);
    cinema.querySelector('[data-cinema-filter="anime"]').click();
    assert.equal(cinema.querySelectorAll('[data-cinema-card]:not([hidden])').length, 1);
    cinema.querySelector('[data-cinema-search]').value = '无结果';
    cinema.querySelector('[data-cinema-search]').dispatchEvent(new cinemaDom.window.Event('input'));
    assert.equal(cinema.querySelector('[data-cinema-no-results]').hidden, false);
    cinemaDom.window.close();
    for (const route of ['archives/', 'archives/2026/', 'archives/2026/10/']) {
      const read = suffix => new JSDOM(fs.readFileSync(path.join(output, route, suffix, 'index.html'), 'utf8'));
      const first = read('');
      const second = read('page/2');
      const entries = first.window.document.querySelectorAll('.archive-tree-list .archive-entry');
      assert.equal(entries.length, 4, `${route}: first page keeps archive page size`);
      assert.equal(second.window.document.querySelectorAll('.archive-entry').length, 3);
      const dates = [...entries].map(entry => entry.querySelector('time').dateTime);
      assert.deepEqual(dates, [...dates].sort().reverse(), `${route}: newest first`);
      assert.ok(dates.every(date => date.startsWith('2026-10')));
      assert.equal(first.window.document.querySelector('.archive-year h2').textContent, '2026');
      assert.equal(first.window.document.querySelector('.pagination a[rel="next"]').getAttribute('href'), `${prefix}${route}page/2/`);
      assert.equal(second.window.document.querySelector('.pagination a[rel="prev"]').getAttribute('href'), `${prefix}${route}`);
      first.window.close();
      second.window.close();
    }
    const category = new JSDOM(fs.readFileSync(path.join(output, 'categories/主题使用/index.html'), 'utf8'));
    assert.ok(category.window.document.querySelector('.category-post-list .category-post-row'), 'Category details use article rows');
    assert.ok(category.window.document.querySelector('.category-index a[aria-current="page"]'));
    assert.equal(category.window.document.querySelector('.post-grid, .archive-tree'), null, 'Categories use the directory layout');
    category.window.close();
    const directory = new JSDOM(fs.readFileSync(path.join(output, 'categories/index.html'), 'utf8'));
    const topicLinks = directory.window.document.querySelectorAll('.category-atlas .category-topic-link');
    assert.ok(topicLinks.length > 0);
    for (const link of topicLinks) {
      const href = link.getAttribute('href');
      assert.ok(href.startsWith(`${prefix}categories/`), 'Topic links stay within deployment root');
      assert.ok(fs.existsSync(path.join(output, decodeURIComponent(href.slice(prefix.length)), 'index.html')), 'Topic links point to generated categories');
    }
    assert.ok(directory.window.document.querySelector('.category-topic-updated time'));
    assert.equal(directory.window.document.querySelector('.taxonomy-card'), null);
    directory.window.close();
    assert.ok(JSON.stringify(index).includes('欢迎使用 Morii'));
    const article = fs.readFileSync(path.join(output, 'posts/welcome/index.html'), 'utf8');
    assert.ok(article.includes('folding-tag'), 'Compatibility tags render without the old theme');
    assert.ok(fs.existsSync(path.join(output, '.nojekyll')));
  });
  for (const layouts of [
    { home: 'grid', categories: 'cards', category: 'cards', archives: 'grouped' },
    { home: 'featured', categories: 'directory', category: 'list', archives: 'timeline' }
  ]) await t.test(`configurable layouts: ${layouts.categories}`, async () => {
    const output = await buildDemo({ root: '/theme/', url: 'https://example.test', themeOverrides: { appearance: { layouts, effects: { enable: false } } } });
    const documentFor = file => new JSDOM(fs.readFileSync(path.join(output, file, 'index.html'), 'utf8')).window.document;
    const home = documentFor('');
    assert.equal(home.querySelector('.morii-atmosphere'), null);
    assert.equal(home.querySelector('script[src$="/js/effects.js"], link[href$="/css/effects.css"]'), null);
    assert.equal(home.documentElement.hasAttribute('data-glass'), false);
    assert.equal(home.querySelector('#effects-dialog, [data-open-effects]'), null);
    const overview = documentFor('categories');
    const category = documentFor('categories/主题使用');
    const archive = documentFor('archives');
    assert.equal(home.querySelectorAll('#latest .post-card--featured').length, layouts.home === 'grid' ? 0 : 1);
    assert.ok(overview.querySelector(layouts.categories === 'cards' ? '.taxonomy-grid .taxonomy-card' : '.category-directory-variant .category-directory-row'));
    assert.ok(category.querySelector(layouts.category === 'cards' ? '.post-grid .post-card' : '.category-post-list .category-post-row'));
    assert.ok(archive.querySelector(layouts.archives === 'grouped' ? '.archive-groups .archive-year' : '.archive-tree'));
    assert.equal(archive.querySelectorAll('.archive-entry').length, 4, 'Changing layout must not change archive page size');
    for (const document of [home, overview, category, archive]) {
      assert.equal(document.querySelectorAll('main h1').length, 1);
      for (const link of document.querySelectorAll('main a[href]')) {
        const href = link.getAttribute('href');
        if (href.startsWith('/') && !href.startsWith('//')) assert.ok(href.startsWith('/theme/'), `Layout link stays within deployment root: ${href}`);
      }
      document.defaultView.close();
    }
  });
});

test('English and Traditional Chinese build at a subpath with cached locale assets and original articles', async () => {
  for (const language of ['en', 'zh-TW']) {
    const output = await buildDemo({ root: '/theme/', language, themeOverrides: { menu: [{ name: '首页', path: '/' }, { name: { en: 'My notes', 'zh-CN': '我的笔记', 'zh-TW': '我的筆記' }, path: '/archives/' }] } });
    const translations = require(`../languages/${language}.json`);
    for (const file of pages) {
      const dom = new JSDOM(fs.readFileSync(path.join(output, file), 'utf8'), { url: `https://example.test/theme/${file}`, runScripts: 'outside-only' });
      const document = dom.window.document;
      assert.equal(document.documentElement.lang, language);
      assert.equal(document.querySelector('#search-open').getAttribute('aria-label'), translations['搜索文章']);
      assert.equal(document.querySelector('.site-nav a').textContent, translations['首页']);
      assert.equal(document.querySelectorAll('.site-nav a')[1].textContent, language === 'en' ? 'My notes' : '我的筆記');
      assert.equal(document.querySelector('.navigation-card strong').textContent, translations['首页']);
      const localeScript = document.querySelector('script[src*="/js/locales/"]');
      assert.ok(localeScript, `${file}: locale asset`);
      const relative = localeScript.getAttribute('src').replace(/^\/theme\//, '');
      assert.match(relative, new RegExp(`^js/locales/${language}\\.[a-f0-9]+\\.js$`));
      dom.window.eval(fs.readFileSync(path.join(output, relative), 'utf8'));
      dom.window.eval(fs.readFileSync(path.join(output, 'js/i18n.js'), 'utf8'));
      assert.equal(dom.window.MoriiI18n.t('切换浅色模式'), translations['切换浅色模式']);
      if (file === 'posts/welcome/index.html') assert.match(document.querySelector('.article-body').textContent, /这是一篇用于展示 Morii 的示例文章/);
      dom.window.close();
    }
  }
});
