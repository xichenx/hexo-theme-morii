'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { buildDemo } = require('../tools/demo.cjs');
const pages = ['index.html', 'page/2/index.html', 'posts/welcome/index.html', 'archives/index.html', 'categories/index.html', 'categories/主题使用/index.html', 'tags/index.html', 'tags/开始写作/index.html', 'about/index.html', 'link/index.html', 'essay/index.html', 'album/index.html', 'album/morii/index.html', 'music/index.html', 'cinema/index.html', 'game/index.html', 'comments/index.html', 'series/index.html', 'series/morii-guide/index.html', 'reading-list/index.html', '404.html'];

function readSitemap(output) {
  const dom = new JSDOM(fs.readFileSync(path.join(output, 'sitemap.xml'), 'utf8'), { contentType: 'application/xml' });
  const { document } = dom.window;
  assert.equal(document.documentElement.namespaceURI, 'http://www.sitemaps.org/schemas/sitemap/0.9');
  const locations = [...document.querySelectorAll('urlset > url > loc')].map(node => node.textContent);
  assert.equal(new Set(locations).size, locations.length);
  dom.window.close();
  return locations;
}

test('theme builds independently at both domain root and a Pages subdirectory', async t => {
  for (const prefix of ['/', '/hexo-theme-morii/']) await t.test(prefix, async () => {
    const output = await buildDemo({ root: prefix, url: 'https://example.test' });
    const locations = new Set(readSitemap(output));
    assert.equal(fs.readFileSync(path.join(output, 'robots.txt'), 'utf8'),
      `User-agent: *\nDisallow:\n\nSitemap: https://example.test${prefix}sitemap.xml\n`);
    for (const location of locations) {
      assert.ok(location.startsWith(`https://example.test${prefix}`));
      const route = decodeURIComponent(new URL(location).pathname.slice(prefix.length));
      assert.ok(fs.existsSync(path.join(output, route, 'index.html')), `Sitemap lists a generated page: ${location}`);
    }
    assert.ok(!locations.has(`https://example.test${prefix}404`));
    assert.ok(!locations.has(`https://example.test${prefix}404.html`));
    for (const file of pages) {
      assert.ok(fs.existsSync(path.join(output, file)), `Generated ${file}`);
      const dom = new JSDOM(fs.readFileSync(path.join(output, file), 'utf8'), { url: `https://example.test${prefix}${file}` });
      const document = dom.window.document;
      assert.equal(document.body.hasAttribute('data-wallpaper'), false);
      const noindex = ['404.html', 'reading-list/index.html'].includes(file);
      const canonical = file === '404.html' ? undefined : new URL(file.replace(/(^|\/)index\.html$/, '$1'), `https://example.test${prefix}`).href;
      assert.equal(document.querySelector('link[rel="canonical"]')?.href, canonical, `${file}: canonical URL`);
      assert.equal(document.querySelector('meta[property="og:url"]')?.content, canonical);
      assert.equal(document.querySelector('meta[name="robots"]')?.content, noindex ? 'noindex' : undefined);
      assert.equal(!!document.querySelector('script[type="application/ld+json"]'), !noindex);
      assert.equal(locations.has(canonical), !noindex, `${file}: sitemap agrees with indexing metadata`);
      if (file === 'index.html') {
        const backToTop = document.querySelector('#back-to-top');
        assert.equal(backToTop.textContent.trim(), '↑');
        assert.equal(backToTop.hasAttribute('data-back-top-percent'), false);
        const promo = document.querySelector('.theme-promo');
        const wordmark = promo.querySelector('h2 img');
        assert.equal(wordmark.alt, 'Morii');
        assert.equal(wordmark.getAttribute('src'), `${prefix}icons/brand/morii-promo-wordmark.webp`);
        assert.equal(promo.querySelector('.theme-promo__cover').getAttribute('href'), 'https://github.com/xichenx/hexo-theme-morii#quick-start');
        assert.equal(promo.querySelector('.theme-promo__secondary').getAttribute('href'), 'https://github.com/xichenx/hexo-theme-morii');
        assert.equal(document.querySelector('[data-random]').dataset.randomAutoplay, 'on');
        assert.equal(document.querySelectorAll('[data-random] button').length, 1);
        assert.equal(document.querySelector('.hero-mini--quote, .hero-mini--stats'), null);
      }
      if (file === 'page/2/index.html') assert.equal(document.querySelector('.theme-promo'), null);
      if (file === 'essay/index.html') {
        assert.equal(document.querySelector('[data-moment-filter]').hidden, true);
        const cards = [...document.querySelectorAll('.essay-card')];
        assert.deepEqual(cards.map(card => [card.id, card.dataset.momentMonth, card.hidden]), [
          ['moment-1-1', '2026-10', false], ['moment-1-2', '2026-09', false]
        ]);
      }
      const codeStyle = document.querySelector('link[href*="/css/code."]');
      assert.equal(!!codeStyle, file.startsWith('posts/'), `${file}: code styles load only on article pages`);
      const gameHall = file === 'game/index.html';
      assert.equal(!!document.querySelector('link[href*="/css/arcade."]'), gameHall);
      if (gameHall) {
        assert.equal(document.querySelector('main h1').textContent, '游戏厅');
        assert.deepEqual([...document.querySelectorAll('.arcade a')].map(link => link.getAttribute('href')),
          ['2048', 'mf', 'sl', 'wzq', 'txz'].map(game => `${prefix}game/${game}/`));
      }
      if (file === 'posts/welcome/index.html') {
        assert.deepEqual([...document.querySelectorAll('.article-header .article-meta time[datetime]')].map(time => time.parentElement.textContent.split(' ')[0]), ['发布于', '更新于']);
        assert.match(document.querySelector('.article-header .article-meta').textContent, /分钟阅读/);
        assert.doesNotMatch(document.querySelector('.article-header .article-meta').textContent, /字数/);
        assert.equal(document.querySelector('.reading-layout--left'), null);
        assert.equal(document.querySelector('.header-post-title'), null);
        assert.equal(document.querySelector('.article-reward'), null);
        assert.ok(document.querySelector('.related-card time[datetime]'));
        assert.doesNotMatch(document.querySelector('.related-card__date').textContent, /更新于/);
        assert.equal(document.querySelector('.article-navigation [rel="prev"]'), null);
        assert.equal(document.querySelector('.article-navigation [rel="next"]').getAttribute('href'), `${prefix}posts/reading/`);
        assert.equal(document.querySelector('.article-copyright, .article-edit'), null);
        assert.equal(document.querySelector('.article-body').dataset.codeStyle, 'classic');
        assert.equal(document.querySelector('.article-body').dataset.codeTheme, 'dark');
        assert.equal(document.querySelector('.article-body').hasAttribute('data-code-copy'), false);
        assert.equal(document.querySelector('.article-body').hasAttribute('data-code-language'), false);
        assert.equal(document.querySelector('.article-body').hasAttribute('data-code-viewer'), false);
        assert.equal(document.querySelector('.article-body').hasAttribute('data-code-start-collapsed'), false);
      }
      assert.equal(document.querySelectorAll('main h1').length, 1, `${file}: one page heading`);
      assert.equal(!!document.querySelector('script[src*="/js/tag-order."]'), file === 'tags/index.html');
      if (file === 'tags/index.html') {
        const links = [...document.querySelectorAll('.taxonomy-tags a')];
        assert.equal(decodeURIComponent(links[0].getAttribute('href')), `${prefix}tags/开始写作/`);
        assert.equal(links[0].querySelector('small').textContent, '2');
        assert.ok(document.querySelector('.tag-order').hidden);
        assert.equal(new Set(links.map(link => link.href)).size, links.length);
        for (const link of links) {
          const localPath = decodeURIComponent(new URL(link.href).pathname.slice(prefix.length));
          assert.ok(fs.existsSync(path.join(output, localPath, 'index.html')));
        }
      }
      assert.equal(document.querySelector('main .intro-atmosphere, main [data-intro-word], main [data-intro-tone]'), null, `${file}: no decorative banner`);
      assert.equal(document.querySelector('main .page-intro, main .series-intro'), null, `${file}: no standalone title area`);
      const heading = document.querySelector('main h1');
      const visibleTitle = gameHall || ['index.html', 'posts/welcome/index.html', '404.html'].includes(file);
      assert.ok(heading.textContent.trim(), `${file}: accessible heading has a name`);
      assert.equal(heading.classList.contains('sr-only'), !visibleTitle, `${file}: heading visibility`);
      if (file === 'link/index.html') assert.ok(document.querySelector('.friend-toolbar-footer a[href="#friend-connect"]'));
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
        assert.deepEqual(photos.map(image => image.getAttribute('fetchpriority')), ['high', 'auto']);
        assert.deepEqual(photos.map(image => image.getAttribute('width')), [null, '128']);
        assert.deepEqual(photos.map(image => image.getAttribute('height')), [null, '128']);
        assert.deepEqual(photos.map(image => image.parentElement.style.getPropertyValue('--photo-ratio')), ['', '128/128']);
        assert.equal(photos[0].closest('a').getAttribute('href'), `${prefix}icons/brand/morii-logo-v2.png`);
        assert.equal(photos[1].getAttribute('src'), `${prefix}icons/brand/morii-logo.png`);
      }
      if (['album/index.html', 'album/morii/index.html'].includes(file)) {
        const img = document.querySelector('.album-card img, .photo-card img');
        if (img.hasAttribute('srcset')) {
          assert.match(img.getAttribute('src'), /\/images\/morii\/[\da-f]+-\d+\.webp$/);
          for (const entry of img.getAttribute('srcset').split(', ')) {
            const url = entry.split(' ')[0];
            assert.ok(url.startsWith(`${prefix}images/morii/`));
            assert.ok(fs.existsSync(path.join(output, url.slice(prefix.length))));
          }
        } else assert.equal(img.getAttribute('src'), `${prefix}icons/brand/morii-logo-v2.png`);
      }
      for (const node of document.querySelectorAll('script[src],link[rel="stylesheet"],img[src]')) {
        const raw = node.getAttribute('src') || node.getAttribute('href');
        const url = new URL(raw, dom.window.location.href);
        if (url.origin !== 'https://example.test') continue;
        assert.ok(url.pathname.startsWith(prefix), `${file}: ${raw} must stay within deployment root`);
        const local = decodeURIComponent(url.pathname.slice(prefix.length));
        assert.ok(fs.existsSync(path.join(output, local)), `${file}: missing asset ${local}`);
      }
      for (const link of document.querySelectorAll('.site-nav a, .footer-explore a, .footer-nav a')) {
        const url = new URL(link.href);
        if (url.origin !== 'https://example.test') continue;
        assert.ok(url.pathname.startsWith(prefix), `${file}: navigation root`);
        const local = decodeURIComponent(url.pathname.slice(prefix.length));
        assert.ok(fs.existsSync(path.join(output, local, 'index.html')), `${file}: navigation ${local}`);
      }
      assert.equal(document.querySelectorAll('.footer-nav__group').length, 3);
      if (file === 'archives/index.html') {
        assert.equal(document.querySelector('.footer-nav a[aria-current="page"]').getAttribute('href'), `${prefix}archives/`);
      }
      const music = JSON.parse(document.querySelector('#morii-audio-hub').dataset.musicConfig);
      assert.ok(music.remote && music.remote.api.startsWith('https://'));
      const musicStyle = document.querySelector('link[href*="/css/music."]');
      const musicScript = document.querySelector('script[src*="/js/music."]');
      const musicRoom = file === 'music/index.html';
      assert.equal(Boolean(musicStyle), musicRoom, `${file}: no idle player stylesheet download`);
      assert.equal(Boolean(musicScript), musicRoom, `${file}: no idle player script download`);
      const navigation = document.querySelector('#navigation-dialog');
      const styleUrl = musicStyle?.getAttribute('href') || navigation.dataset.musicStyle;
      const scriptUrl = musicScript?.getAttribute('src') || navigation.dataset.musicScript;
      assert.ok(styleUrl.startsWith(`${prefix}css/music.`) && fs.existsSync(path.join(output, styleUrl.slice(prefix.length))));
      assert.ok(scriptUrl.startsWith(`${prefix}js/music.`) && fs.existsSync(path.join(output, scriptUrl.slice(prefix.length))));
      for (const name of ['search', 'motion']) assert.equal(document.querySelector(`link[href*="/css/${name}."]`)?.media, 'print');
      dom.window.close();
    }
    const index = JSON.parse(fs.readFileSync(path.join(output, 'morii-search.json'), 'utf8'));
    const reading = index.find(entry => entry.url === `${prefix}posts/reading/`);
    assert.match(reading.content, /查看答案/);
    assert.doesNotMatch(reading.content, /hexo generate/);
    const cinemaDom = new JSDOM(fs.readFileSync(path.join(output, 'cinema/index.html'), 'utf8'), { url: `https://example.test${prefix}cinema/`, runScripts: 'outside-only' });
    const cinema = cinemaDom.window.document;
    assert.match(cinema.querySelector('link[href*="/css/cinema."]').href, /cinema\.[a-f0-9]{12}\.css$/);
    assert.match(cinema.querySelector('script[src*="/js/cinema."]').src, /cinema\.[a-f0-9]{12}\.js$/);
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
      const monthIndex = first.window.document.querySelector('.archive-months');
      assert.equal(monthIndex.querySelector('a').getAttribute('href'), `${prefix}archives/2026/10/`);
      assert.equal(monthIndex.querySelector('small').textContent, '7 篇文章');
      const isMonth = route === 'archives/2026/10/';
      assert.equal(monthIndex.open, isMonth);
      assert.equal(!!monthIndex.querySelector('[aria-current="date"]'), isMonth);
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
    const monthly = layouts.archives === 'grouped';
    const themePromo = monthly ? { enable: false, journal_below: true } : {
      docs_url: '/about/', repository_url: 'javascript:invalid', journal_below: true
    };
    const hero = monthly ? { eyebrow: false, intro: false, signature: false, primary: false, secondary: false } : {
      title: ['My homepage', 'Welcome back'],
      eyebrow: '<我的专栏>',
      intro: '仅在首页显示的简介',
      signature: '小林',
      primary: { label: '读文章', url: '/archives/#recent' },
      secondary: { label: '查看项目', url: 'https://example.org/project' }
    };
    const robots = 'User-agent: *\nDisallow: /private/\n';
    const wallpaper = monthly ? { image: 'javascript:invalid' } : {
      image: '/images/covers/welcome.jpg', dark_image: 'https://example.org/night.webp', overlay: 0, card_opacity: 0.8
    };
    const output = await buildDemo({ root: '/theme/', url: 'https://example.test', siteOverrides: { archive_dir: 'history', archive_generator: { monthly }, category_generator: { per_page: 1 } }, themeOverrides: { hero, footer: { nav: false }, appearance: { layouts, wallpaper, effects: { enable: false } }, home: { theme_promo: themePromo, random: { autoplay: false } }, seo: { sitemap: monthly, robots: true } }, sourceOverrides: monthly ? { 'robots.txt': robots } : {} });
    if (monthly) {
      assert.ok(readSitemap(output).includes('https://example.test/theme/history/'));
      assert.equal(fs.readFileSync(path.join(output, 'robots.txt'), 'utf8'), robots);
    } else {
      assert.ok(!fs.existsSync(path.join(output, 'sitemap.xml')));
      assert.equal(fs.readFileSync(path.join(output, 'robots.txt'), 'utf8'), 'User-agent: *\nDisallow:\n');
    }
    const documentFor = file => new JSDOM(fs.readFileSync(path.join(output, file, 'index.html'), 'utf8')).window.document;
    const home = documentFor('');
    assert.equal(home.body.hasAttribute('data-wallpaper'), !monthly);
    assert.equal(documentFor('music').body.hasAttribute('data-wallpaper'), false);
    if (!monthly) {
      assert.equal(home.body.style.getPropertyValue('--wallpaper-image'), 'url("/theme/images/covers/welcome.jpg")');
      assert.equal(home.body.style.getPropertyValue('--wallpaper-dark-image'), 'url("https://example.org/night.webp")');
      assert.equal(home.body.style.getPropertyValue('--wallpaper-overlay'), '0%');
      assert.equal(documentFor('posts/welcome').body.style.getPropertyValue('--wallpaper-card-opacity'), '80%');
    }
    const heroCard = home.querySelector('.hero__main');
    assert.equal(home.querySelector('[data-random]').dataset.randomAutoplay, 'off');
    assert.ok(home.querySelector('[data-random-refresh]'));
    if (monthly) {
      assert.ok(heroCard.querySelector('h1').textContent.trim());
      assert.equal(heroCard.querySelector('.eyebrow, p, .hero__signature, .hero__actions'), null);
      assert.equal(home.querySelector('.theme-promo'), null);
      assert.equal(home.querySelector('.hero__journal'), null);
      assert.ok(home.querySelector('.hero__side .hero-mini--quote'));
      assert.ok(home.querySelector('.hero__side .hero-mini--stats'));
    } else {
      assert.equal(heroCard.querySelector('h1 em').textContent, 'Welcome back');
      assert.equal(heroCard.querySelector('.eyebrow').textContent.trim(), '<我的专栏>');
      assert.equal(heroCard.querySelector('p').textContent, '仅在首页显示的简介');
      assert.equal(heroCard.querySelector('.hero__signature').textContent, '小林');
      assert.deepEqual([...heroCard.querySelectorAll('.hero__actions a')].map(link => [
        link.firstChild.textContent.trim(), link.getAttribute('href')
      ]), [['读文章', '/theme/archives/#recent'], ['查看项目', 'https://example.org/project']]);
      const links = [...home.querySelectorAll('.theme-promo a')];
      assert.deepEqual(links.map(link => link.getAttribute('href')), ['/theme/about/']);
      const journal = home.querySelector('.hero__journal');
      assert.equal(journal.previousElementSibling.className, 'theme-promo');
      assert.equal(journal.querySelector('.hero-mini--quote a').getAttribute('href'), '/theme/essay/');
      assert.equal(journal.querySelectorAll('.stats-grid strong').length, 2);
    }
    assert.equal(home.querySelector('.footer-nav'), null);
    assert.ok(home.querySelector('.footer-explore a[href="/theme/reading-list/"]'));
    assert.equal(home.querySelector('.morii-atmosphere'), null);
    assert.equal(home.querySelector('script[src*="/js/effects."], link[href*="/css/effects."]'), null);
    assert.equal(home.documentElement.hasAttribute('data-glass'), false);
    assert.equal(home.querySelector('#effects-dialog, [data-open-effects]'), null);
    const overview = documentFor('categories');
    const category = documentFor('categories/主题使用');
    const categoryPageTwo = documentFor('categories/主题使用/page/2');
    assert.match(categoryPageTwo.title, /第 2 页/);
    assert.equal(decodeURI(categoryPageTwo.querySelector('link[rel="canonical"]').href), 'https://example.test/theme/categories/主题使用/page/2/');
    categoryPageTwo.defaultView.close();
    const article = documentFor('posts/welcome');
    const breadcrumbs = JSON.parse(article.querySelector('script[type="application/ld+json"]').textContent)['@graph']
      .find(item => item['@type'] === 'BreadcrumbList').itemListElement;
    assert.equal(breadcrumbs[1].item, 'https://example.test/theme/history/');
    article.defaultView.close();
    const child = documentFor('categories/主题使用/入门/page/2');
    const otherChild = documentFor('categories/开发笔记/入门');
    const href = link => decodeURIComponent(link.getAttribute('href'));
    assert.equal(href(category.querySelector('.category-children a')), '/theme/categories/主题使用/入门/');
    assert.match(category.querySelector('.category-children small').textContent, /2 篇/);
    assert.equal(href(child.querySelector('.category-path li:nth-child(2) a')), '/theme/categories/主题使用/');
    assert.equal(href(otherChild.querySelector('.category-path li:nth-child(2) a')), '/theme/categories/开发笔记/');
    const activeCategory = child.querySelectorAll('.category-index a[aria-current="page"], .category-nav a[aria-current="page"]');
    assert.equal(activeCategory.length, 1);
    assert.equal(href(activeCategory[0]), '/theme/categories/主题使用/入门/');
    assert.equal(child.querySelector('.category-children'), null);
    const archive = documentFor('history');
    const monthIndex = archive.querySelector('.archive-months');
    assert.equal(!!monthIndex, monthly);
    if (monthly) {
      assert.equal(monthIndex.querySelector('a').getAttribute('href'), '/theme/history/2026/10/');
      assert.ok(fs.existsSync(path.join(output, 'history/2026/10/index.html')));
    } else assert.ok(!fs.existsSync(path.join(output, 'history/2026/10/index.html')));
    assert.equal(home.querySelectorAll('#latest .post-card--featured').length, layouts.home === 'grid' ? 0 : 1);
    assert.ok(overview.querySelector(layouts.categories === 'cards' ? '.taxonomy-grid .taxonomy-card' : '.category-directory-variant .category-directory-row'));
    assert.ok(category.querySelector(layouts.category === 'cards' ? '.post-grid .post-card' : '.category-post-list .category-post-row'));
    assert.ok(archive.querySelector(layouts.archives === 'grouped' ? '.archive-groups .archive-year' : '.archive-tree'));
    assert.equal(archive.querySelectorAll('.archive-entry').length, 4, 'Changing layout must not change archive page size');
    for (const document of [home, overview, category, archive, child, otherChild]) {
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
      assert.equal(document.querySelector('.footer-nav').getAttribute('aria-label'), translations['页脚导航']);
      assert.equal(document.querySelector('.footer-nav h2').textContent, language === 'en' ? 'Reading' : '閱讀');
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

test('optional enhancements and Waline produce configured assets and safe sharing metadata', async () => {
  const output = await buildDemo({ root: '/theme/', sourceOverrides: {
    'comments/index.md': '---\ntitle: 留言板\ncomments: true\n---\n欢迎留言。',
    'preview/index.md': '---\ntitle: Preview\nnoindex: true\n---\nPublic preview.',
    '_posts/seo-filename.md': '---\ntitle: Canonical filename\ndate: 2001-01-01\npermalink: posts/myindex.html\nshare_image: "javascript:alert(1)"\ncover: /images/covers/welcome.jpg\n---\nCanonical path.',
    '_posts/seo-protected.md': '---\ntitle: Protected example\ndate: 2001-01-02\npermalink: posts/seo-protected/\npassword: example\nshare_image: https://example.test/private-cover.jpg\ndescription: Private summary\n---\nProtected example.',
    '_posts/formulas.md': '---\ntitle: Formulas and diagrams\ndate: 2026-10-16 12:00:00\npermalink: posts/formulas/\ntags: [Related fixture]\ntoc: true\ntoc_scroll_percent: true\nnavigation_order: newest_first\nsidebar_position: right\nmeta_date_type: created\ncode_viewer: true\ncode_start_collapsed: true\nimage_captions: true\n---\n\n## Examples\n\n{% math %}x^2{% endmath %}\n\n{% mermaid %}\ngraph TD; A-->B;\n{% endmermaid %}\n\n![Sample diagram](/images/covers/welcome.jpg "Build output")',
    '_posts/related-maintained.md': '---\ntitle: Maintained tutorial\npermalink: posts/related-maintained/\ntags: [Related fixture]\ndate: 2020-01-01 12:00:00\nupdated: 2025-02-03 12:00:00\n---\nMaintained tutorial.',
    '_posts/related-recent.md': '---\ntitle: Published later\npermalink: posts/related-recent/\ntags: [Related fixture]\ndate: 2021-01-01 12:00:00\nupdated: 2024-02-03 12:00:00\nmeta_word_count: false\nmeta_reading_time: true\n---\nPublished later.'
  }, themeOverrides: {
    article: { code: { viewer: false, start_collapsed: false }, enhancements: { mermaid: true, math: true }, toc: { enable: false, scroll_percent: false, style_simple: true }, related: { date_type: 'updated' }, navigation_order: 'oldest_first', sidebar_position: 'left', meta: { date_type: 'updated', word_count: true, reading_time: false } },
    comments: { enable: true, provider: 'waline', server_url: 'https://comments.example.test' },
    seo: { default_image: '/share.jpg', structured_data: true }
  } });
  const dom = new JSDOM(fs.readFileSync(path.join(output, 'posts/welcome/index.html'), 'utf8'));
  const d = dom.window.document;
  assert.equal(d.querySelector('.article-body').dataset.codeViewer, 'false');
  assert.equal(d.querySelector('.article-body').dataset.codeStartCollapsed, 'false');
  const headerDates = d.querySelectorAll('.article-header .article-meta time[datetime]');
  assert.equal(headerDates.length, 1);
  assert.match(headerDates[0].parentElement.textContent, /^更新于 /);
  assert.match(d.querySelector('.article-header .article-meta').textContent, /字数 [\d,]+/);
  assert.doesNotMatch(d.querySelector('.article-header .article-meta').textContent, /分钟阅读/);
  const override = new JSDOM(fs.readFileSync(path.join(output, 'posts/related-recent/index.html'), 'utf8'));
  const overrideMeta = override.window.document.querySelector('.article-header .article-meta').textContent;
  assert.doesNotMatch(overrideMeta, /字数/);
  assert.match(overrideMeta, /约 1 分钟阅读/);
  override.window.close();
  assert.ok(d.querySelector('.reading-layout--left'));
  assert.equal(d.querySelector('.toc-card, .mobile-toc, #reading-toc-dialog, [data-reading-toc]'), null);
  assert.ok(d.querySelector('.reading-aside .profile-card'));
  assert.ok(d.querySelector('.reading-progress'));
  assert.equal(d.querySelector('.article-navigation [rel="prev"]').getAttribute('href'), '/theme/posts/reading/');
  assert.equal(d.querySelector('.article-navigation [rel="next"]').getAttribute('href'), '/theme/posts/formulas/');
  assert.equal(d.querySelector('link[rel="preconnect"]'), null, 'Enabling features alone does not emit a CDN hint');
  const technical = new JSDOM(fs.readFileSync(path.join(output, 'posts/formulas/index.html'), 'utf8'));
  assert.equal(technical.window.document.querySelector('.article-body').hasAttribute('data-code-viewer'), false);
  assert.equal(technical.window.document.querySelector('.article-body').hasAttribute('data-code-start-collapsed'), false);
  const illustration = technical.window.document.querySelector('.article-body .article-figure');
  assert.equal(illustration.querySelector('figcaption').textContent, 'Build output');
  assert.equal(illustration.querySelector('img').alt, 'Sample diagram');
  const overrideDates = technical.window.document.querySelectorAll('.article-header .article-meta time[datetime]');
  assert.equal(overrideDates.length, 1);
  assert.equal(overrideDates[0].parentElement.textContent, '发布于 2026-10-16');
  assert.equal(technical.window.document.querySelector('.reading-layout--left'), null);
  assert.equal(technical.window.document.querySelector('.article-navigation [rel="prev"]'), null);
  assert.equal(technical.window.document.querySelector('.article-navigation [rel="next"]').getAttribute('href'), '/theme/posts/welcome/');
  assert.equal(technical.window.document.querySelectorAll('.toc-content a').length, 3);
  assert.equal(technical.window.document.querySelector('.reading-aside .profile-card'), null);
  assert.equal(technical.window.document.querySelectorAll('[data-reading-percent]').length, 2);
  const related = [...technical.window.document.querySelectorAll('.related-card')];
  assert.deepEqual(related.map(card => card.getAttribute('href')), ['/theme/posts/related-maintained/', '/theme/posts/related-recent/']);
  assert.match(related[0].querySelector('.related-card__date').textContent, /更新于 2025\.02\.03/);
  assert.match(related[0].querySelector('time').dateTime, /^2025-02-03T/);
  const connections = [...technical.window.document.querySelectorAll('link[rel="preconnect"]')];
  assert.deepEqual(connections.map(link => [link.getAttribute('href'), link.crossOrigin]), [['https://cdn.jsdelivr.net', 'anonymous']]);
  technical.window.close();
  assert.match(d.querySelector('script[data-mermaid]').dataset.mermaid, /mermaid@11\.12\.0/);
  assert.match(d.querySelector('script[data-math]').dataset.math, /katex@0\.19\.1/);
  assert.ok(d.querySelector('.article-note--tip')); assert.equal(d.querySelector('.code-file').dataset.filename, 'app.js'); assert.ok(d.querySelector('.line.marked'));
  const data = JSON.parse(d.querySelector('script[type="application/ld+json"]').textContent);
  const article = data['@graph'].find(item => item['@type'] === 'BlogPosting');
  assert.equal(article.mainEntityOfPage['@id'], 'https://example.test/theme/posts/welcome/');
  assert.match(article.image[0], /\/theme\/images\/covers\/welcome.jpg$/);
  assert.equal(d.querySelector('meta[name="twitter:card"]').content, 'summary_large_image');
  const trail = data['@graph'].find(item => item['@type'] === 'BreadcrumbList').itemListElement;
  assert.deepEqual(trail.map(item => item.item), [
    ...[...d.querySelectorAll('.article-breadcrumb a')].map(link => new URL(link.href, 'https://example.test').href),
    article.url
  ]);
  assert.deepEqual(trail.map(item => item.position), trail.map((_, index) => index + 1));
  const locations = readSitemap(output);
  for (const file of ['preview/index.html', 'posts/seo-protected/index.html', 'posts/myindex.html']) {
    const sample = new JSDOM(fs.readFileSync(path.join(output, file), 'utf8'));
    const doc = sample.window.document;
    const indexable = file === 'posts/myindex.html';
    assert.equal(doc.querySelector('meta[name="robots"]')?.content, indexable ? undefined : 'noindex');
    assert.equal(Boolean(doc.querySelector('script[type="application/ld+json"]')), indexable);
    const publicPath = indexable ? 'posts/myindex' : file.replace(/\/index\.html$/, '/');
    assert.equal(doc.querySelector('link[rel="canonical"]').href, 'https://example.test/theme/' + publicPath);
    assert.equal(locations.includes('https://example.test/theme/' + publicPath), indexable);
    if (indexable) {
      assert.equal(doc.querySelector('meta[property="og:image"]').content, 'https://example.test/theme/images/covers/welcome.jpg');
    } else if (file.startsWith('posts/')) {
      assert.equal(doc.querySelector('meta[property="og:image"]').content, 'https://example.test/theme/share.jpg');
      assert.doesNotMatch(doc.head.textContent, /Private summary|private-cover\.jpg/);
      assert.doesNotMatch(doc.querySelector('meta[name="description"]').content, /Private summary/);
    }
    sample.window.close();
  }
  // This article explicitly disables comments; a normal page uses the selected provider.
  assert.equal(d.querySelector('#comment-service'), null);
  const about = new JSDOM(fs.readFileSync(path.join(output, 'comments/index.html'), 'utf8'));
  assert.equal(about.window.document.querySelector('link[rel="preconnect"]'), null, 'On-demand comments do not open a speculative connection');
  const service = about.window.document.getElementById('comment-service');
  assert.equal(service.dataset.provider, 'waline'); assert.equal(service.dataset.server, 'https://comments.example.test/'); assert.ok(service.querySelector('#waline'));
  assert.ok(about.window.document.querySelector('script[src*="/js/services."]'));
  dom.window.close(); about.window.close();
});

test('series pages, article order and responsive covers work in English under a deployment subdirectory', async () => {
  const original = name => fs.readFileSync(path.join(__dirname, '../demo/source/_posts', name + '.md'), 'utf8');
  const output = await buildDemo({ root: '/theme/', language: 'en', sourceOverrides: {
    '_data/series.yml': 'guide:\n  title:\n    en: Morii guide\n    zh-CN: 主题指南\n  description: A reading path\n  order_by: title\n  order_direction: desc\n',
    '_posts/welcome.md': original('welcome').replace('title:', 'series: guide\nseries_order: 2\ntitle:'),
    '_posts/cards.md': original('cards').replace('title:', 'series: guide\nseries_order: 1\ntitle:'),
    '_posts/series-two.md': '---\ntitle: Chapter 2\ndate: 2020-01-01\nseries: guide\npermalink: posts/series-two/\n---\nTwo\n',
    '_posts/series-ten.md': '---\ntitle: Chapter 10\ndate: 2020-01-02\nseries: guide\npermalink: posts/series-ten/\n---\nTen\n'
  } });
  const read = file => new JSDOM(fs.readFileSync(path.join(output, file), 'utf8'));
  const index = read('series/index.html'), detail = read('series/guide/index.html'), article = read('posts/welcome/index.html');
  assert.equal(index.window.document.querySelector('h2 a').textContent, 'Morii guide');
  const links = ['cards', 'welcome', 'series-ten', 'series-two'].map(slug => `/theme/posts/${slug}/`);
  const hrefs = nodes => [...nodes].map(link => link.getAttribute('href'));
  assert.deepEqual(hrefs(detail.window.document.querySelectorAll('.series-directory li a')), links);
  assert.deepEqual(hrefs(index.window.document.querySelectorAll('.series-card:first-child li a')), links.slice(0, 3));
  const doc = article.window.document;
  const articleTrail = JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent)['@graph']
    .find(item => item['@type'] === 'BreadcrumbList').itemListElement;
  assert.equal(articleTrail.at(-2).item, 'https://example.test/theme/series/guide/');
  assert.equal(doc.querySelector('.article-series [aria-current="page"]').getAttribute('href'), '/theme/posts/welcome/');
  assert.deepEqual(hrefs(doc.querySelectorAll('.article-series li a')), links);
  assert.deepEqual(hrefs(doc.querySelectorAll('.series-article-nav a')), [links[0], links[2]]);
  assert.equal(doc.querySelector('.article-breadcrumb [aria-current]').textContent, '欢迎使用 Morii');
  let nativeImages = false; try { nativeImages = !!require('sharp'); } catch {}
  if (nativeImages) {
    assert.match(doc.querySelector('.article-cover').getAttribute('srcset'), /^\/theme\/images\/morii\/.+480w/);
    assert.equal(Number(doc.querySelector('.article-cover').width), 1440);
    for (const candidate of doc.querySelector('.article-cover').getAttribute('srcset').split(', ')) {
      const file = candidate.split(' ')[0].replace('/theme/', ''); assert.ok(fs.existsSync(path.join(output, file)));
    }
  } else assert.equal(doc.querySelector('.article-cover').getAttribute('srcset'), null);
  for (const dom of [index, detail, article]) dom.window.close();
});
