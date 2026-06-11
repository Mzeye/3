/* ============================================================
   utils.js — Pure utility functions (no DOM, no side effects)
   ============================================================ */

/**
 * Count "words" in mixed CJK + English text.
 * CJK: each character counts as one word.
 * Latin: space-delimited words.
 */
function countWords(text) {
  if (!text || !text.trim()) return 0;

  let count = 0;
  let inLatin = false;
  let latinWord = '';

  for (const ch of text) {
    const cp = ch.codePointAt(0);

    // CJK Unified, CJK Ext-A, CJK Ext-B.., punctuation ranges, fullwidth forms
    const isCJK =
      (cp >= 0x4E00 && cp <= 0x9FFF) ||   // CJK Unified
      (cp >= 0x3400 && cp <= 0x4DBF) ||   // CJK Ext-A
      (cp >= 0x20000 && cp <= 0x2A6DF) || // CJK Ext-B
      (cp >= 0xF900 && cp <= 0xFAFF) ||   // CJK Compat
      (cp >= 0x2F800 && cp <= 0x2FA1F) || // CJK Compat Sup
      (cp >= 0x3000 && cp <= 0x303F) ||   // CJK Symbols
      (cp >= 0xFF00 && cp <= 0xFFEF) ||   // Halfwidth/Fullwidth
      (cp >= 0x2E80 && cp <= 0x2EFF) ||   // CJK Radicals Sup
      (cp >= 0x31C0 && cp <= 0x31EF);     // CJK Strokes

    const isLatin = (cp >= 0x0041 && cp <= 0x005A) || // A-Z
                    (cp >= 0x0061 && cp <= 0x007A) || // a-z
                    (cp >= 0x00C0 && cp <= 0x024F) || // Latin Ext
                    cp === 0x0027;                      // apostrophe

    const isDigit = cp >= 0x0030 && cp <= 0x0039;
    const isSpace = cp === 0x0020 || cp === 0x000A || cp === 0x000D || cp === 0x0009;

    if (isCJK) {
      if (inLatin && latinWord) {
        count++;
        latinWord = '';
        inLatin = false;
      }
      count++; // each CJK char is one "word"
    } else if (isLatin || isDigit) {
      inLatin = true;
      latinWord += ch;
    } else if (isSpace) {
      if (inLatin && latinWord) {
        count++;
        latinWord = '';
      }
      inLatin = false;
    } else {
      // punctuation or other — finalize latin word
      if (inLatin && latinWord) {
        count++;
        latinWord = '';
      }
      inLatin = false;
    }
  }

  // trailing latin word
  if (inLatin && latinWord) count++;

  return count;
}

/** Count non-whitespace characters. */
function countChars(text) {
  if (!text) return 0;
  let count = 0;
  for (const ch of text) {
    if (ch !== ' ' && ch !== '\n' && ch !== '\r' && ch !== '\t') {
      count++;
    }
  }
  return count;
}

/** Estimate reading time in minutes (avg 250 words/min, min 1). */
function readingTime(wordCount) {
  return Math.max(1, Math.ceil(wordCount / 250));
}

/** Format ISO timestamp to "2026年6月4日" */
function formatDate(isoString) {
  const d = new Date(isoString);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/** Format ISO timestamp to "2026年6月4日 14:30" */
function formatDateTime(isoString) {
  const d = new Date(isoString);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${hh}:${mm}`;
}

/** Extract first N characters as excerpt, trimming to nearest word boundary. */
function excerpt(text, maxLen) {
  if (!text || text.length <= maxLen) return text || '';
  const slice = text.slice(0, maxLen);
  // Try to break at a sentence-ending punctuation or newline
  const breakIdx = Math.max(
    slice.lastIndexOf('。'),
    slice.lastIndexOf('！'),
    slice.lastIndexOf('？'),
    slice.lastIndexOf('\n'),
    slice.lastIndexOf('. '),
    slice.lastIndexOf('! '),
    slice.lastIndexOf('? ')
  );
  if (breakIdx > maxLen * 0.5) return slice.slice(0, breakIdx + 1);
  // Fallback to last space
  const lastSpace = slice.lastIndexOf(' ');
  if (lastSpace > maxLen * 0.5) return slice.slice(0, lastSpace);
  return slice + '…';
}

/** Client-side filter essays by title & content. */
function filterEssays(essays, query) {
  if (!query || !query.trim()) return essays;
  const q = query.toLowerCase().trim();
  return essays.filter(e =>
    (e.title && e.title.toLowerCase().includes(q)) ||
    (e.content && e.content.toLowerCase().includes(q))
  );
}

/** Debounce helper. */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
