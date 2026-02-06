const { detectCategory } = require('./categorize');

function safeText(v, max = 2000) {
    // anti-XSS basique (utile même en projet scolaire)
    return String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .slice(0, max);
}

function originFromUrl(url) {
    try {
        return url ? new URL(url).origin : '';
    } catch {
        return '';
    }
}

function normalizeArticle(raw) {
    const titre = safeText(raw.titre || '');
    const description = safeText(raw.description || '');
    const lien = raw.lien || '';
    const source = safeText(raw.source || '');
    const sourceUrl = raw.sourceUrl || originFromUrl(lien) || '';
    const publishedAt = raw.publishedAt || new Date().toISOString();
    const urlToImage = raw.urlToImage || null;

    return {
        titre,
        description,
        lien,
        source,
        sourceUrl,
        publishedAt,
        urlToImage,
        category: detectCategory(titre, description),
    };
}

function normalizeSource(raw) {
    const name = safeText(raw.name || '', 160);
    const url = raw.url || '';
    return {
        name,
        url,
        origin: originFromUrl(url),
        provider: raw.provider || '',
    };
}

module.exports = {
    safeText,
    originFromUrl,
    normalizeArticle,
    normalizeSource,
};
