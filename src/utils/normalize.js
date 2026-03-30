const { detectCategory } = require('./categorize');

const CATEGORY_IDS = ['general', 'politics', 'economy', 'sports', 'culture', 'technology'];

/* =========================
   HTML DECODE
========================= */
function decodeHtmlEntities(text = '') {
    return String(text)
        .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
        .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#160;/g, ' ')
        .replace(/&eacute;/gi, 'é')
        .replace(/&egrave;/gi, 'è')
        .replace(/&ecirc;/gi, 'ê')
        .replace(/&agrave;/gi, 'à')
        .replace(/&ccedil;/gi, 'ç')
        .replace(/&uuml;/gi, 'ü')
        .replace(/&ouml;/gi, 'ö')
        .replace(/&ldquo;/gi, '“')
        .replace(/&rdquo;/gi, '”')
        .replace(/&lsquo;/gi, '‘')
        .replace(/&rsquo;/gi, '’')
        .replace(/&ndash;/gi, '–')
        .replace(/&mdash;/gi, '—');
}

/* =========================
   TEXT SANITIZE
========================= */
function safeText(value, max = 2000) {
    const decoded = decodeHtmlEntities(value);

    return String(decoded)
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, max);
}

/* =========================
   URL HELPERS
========================= */
function safeUrl(url = '') {
    const value = String(url || '').trim();
    if (!value) return '';

    try {
        return new URL(value).toString();
    } catch {
        return '';
    }
}

function originFromUrl(url) {
    try {
        return url ? new URL(url).origin : '';
    } catch {
        return '';
    }
}

/* =========================
   DATE HELPERS
========================= */
function normalizeDate(value) {
    if (!value) {
        return new Date().toISOString();
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return new Date().toISOString();
    }

    return date.toISOString();
}

/* =========================
   ID HELPERS
========================= */
function slugify(value = '') {
    return String(value)
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/['’"]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

/* =========================
   CATEGORY HELPERS
========================= */
function coerceCategory(category) {
    return CATEGORY_IDS.includes(category) ? category : 'general';
}

/* =========================
   NORMALIZE ARTICLE
========================= */
function normalizeArticle(raw = {}, lang = 'fr') {
    const title = safeText(raw.title || raw.titre || '', 500);
    const description = safeText(raw.description || raw.content || '', 3000);
    const url = safeUrl(raw.url || raw.lien || '');
    const source = safeText(raw.source || 'Unknown Source', 160);
    const sourceUrl = safeUrl(raw.sourceUrl || originFromUrl(url) || '');
    const publishedAt = normalizeDate(raw.publishedAt);
    const image = safeUrl(raw.image || raw.urlToImage || '');

    const cleanTitle = title || description || 'Sans titre';
    const detectedCategory = detectCategory(cleanTitle, description, lang);
    const primaryCategory = coerceCategory(raw.primaryCategory || detectedCategory);

    return {
        title: cleanTitle,
        description,
        url,
        source,
        sourceId: slugify(raw.sourceId || source || 'unknown_source'),
        sourceUrl,
        publishedAt,
        image: image || null,
        language: lang === 'en' ? 'en' : 'fr',
        primaryCategory
    };
}

/* =========================
   NORMALIZE SOURCE
========================= */
function normalizeSource(raw = {}) {
    const name = safeText(raw.name || '', 160);
    const url = safeUrl(raw.url || '');
    const provider = safeText(raw.provider || '', 60);
    const language = raw.language === 'en' ? 'en' : 'fr';
    const category = coerceCategory(raw.category);
    const priority = Number.isFinite(Number(raw.priority)) ? Number(raw.priority) : 0;

    return {
        id: slugify(raw.id || name || 'unknown_source'),
        name: name || 'Unknown Source',
        url,
        origin: originFromUrl(url),
        provider,
        category,
        language,
        priority
    };
}

module.exports = {
    safeText,
    safeUrl,
    originFromUrl,
    normalizeArticle,
    normalizeSource,
    decodeHtmlEntities,
    slugify,
    normalizeDate
};