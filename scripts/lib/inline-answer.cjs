'use strict';

// The tag only emits escaped text inside the answer span.
const stripInlineAnswers = html => String(html).replace(/<span class="inline-answer"[^>]*>[^<]*<\/span>/g, ' ');

module.exports = { stripInlineAnswers };
