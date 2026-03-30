// src/utils/dedupe.js

function normalizeText(value = '') {
    return String(value)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function normalizeUrl(url = '') {
    try {
        const parsed = new URL(url);

        // On retire les fragments
        parsed.hash = '';

        // On retire les paramètres de tracking courants
        const trackingParams = [
            'utm_source',
            'utm_medium',
            'utm_campaign',
            'utm_term',
            'utm_content',
            'fbclid',
            'gclid'
        ];

        trackingParams.forEach((param) => parsed.searchParams.delete(param));

        // Harmonisation du trailing slash
        let normalized = parsed.toString();
        if (normalized.endsWith('/')) {
            normalized = normalized.slice(0, -1);
        }

        return normalized.toLowerCase();
    } catch {
        return '';
    }
}

function getArticleKey(article = {}) {
    const normalizedUrl = normalizeUrl(article.url);

    if (normalizedUrl) {
        return `url:${normalizedUrl}`;
    }

    const normalizedTitle = normalizeText(article.title);
    const normalizedSource = normalizeText(article.source);

    return `fallback:${normalizedTitle}|${normalizedSource}`;
}

function getArticleScore(article = {}) {
    let score = 0;

    if (article.url) score += 5;
    if (article.title) score += 4;
    if (article.description && article.description.length > 40) score += 4;
    if (article.image) score += 3;
    if (article.publishedAt) score += 2;
    if (article.source) score += 2;
    if (article.primaryCategory) score += 2;
    if (article.language) score += 1;

    return score;
}

function chooseBestArticle(current, candidate) {
    const currentScore = getArticleScore(current);
    const candidateScore = getArticleScore(candidate);

    if (candidateScore > currentScore) {
        return candidate;
    }

    return current;
}

function dedupeByUrl(articles = []) {
    const map = new Map();

    for (const article of articles) {
        if (!article || typeof article !== 'object') continue;

        const key = getArticleKey(article);
        const existing = map.get(key);

        if (!existing) {
            map.set(key, article);
            continue;
        }

        map.set(key, chooseBestArticle(existing, article));
    }

    return Array.from(map.values());
}

function getSourceKey(source = {}) {
    const origin = normalizeUrl(source.origin || '');
    if (origin) return `origin:${origin}`;

    const url = normalizeUrl(source.url || '');
    if (url) return `url:${url}`;

    const name = normalizeText(source.name || '');
    if (name) return `name:${name}`;

    return '';
}

function dedupeSources(sources = []) {
    const map = new Map();

    for (const source of sources) {
        if (!source || typeof source !== 'object') continue;

        const key = getSourceKey(source);
        if (!key) continue;

        if (!map.has(key)) {
            map.set(key, source);
            continue;
        }

        const existing = map.get(key);

        // On garde la source la plus complète
        const existingScore =
            (existing.name ? 1 : 0) +
            (existing.url ? 1 : 0) +
            (existing.origin ? 1 : 0) +
            (existing.provider ? 1 : 0);

        const candidateScore =
            (source.name ? 1 : 0) +
            (source.url ? 1 : 0) +
            (source.origin ? 1 : 0) +
            (source.provider ? 1 : 0);

        if (candidateScore > existingScore) {
            map.set(key, source);
        }
    }

    return Array.from(map.values());
}

module.exports = {
    dedupeByUrl,
    dedupeSources
};