'use strict';
const { footerNav } = require('../scripts/lib/footer-nav.cjs');
hexo.extend.helper.register('morii_footer_nav', () => footerNav(hexo.theme.config.footer?.nav));
