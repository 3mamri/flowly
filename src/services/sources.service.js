const { fetchWithTimeout } = require('../utils/fetchWithTimeout');
const { normalizeSource } = require('../utils/normalize');
const { dedupeSources } = require('../utils/dedupe');

const NEWS_API_KEY = process.env.NEWS_API_KEY;

// RSS fixes (complète le catalogue)
const RSS_SOURCES = {
    fr: [
        { name: 'Le Monde', url: 'https://www.lemonde.fr/rss/une.xml', provider: 'RSS' },
        { name: 'France 24', url: 'https://www.france24.com/fr/rss', provider: 'RSS' },
        { name: "L'Équipe", url: 'https://www.lequipe.fr/rss/actu_rss.xml', provider: 'RSS' },
    ],
    en: [
        { name: 'BBC', url: 'https://feeds.bbci.co.uk/news/rss.xml', provider: 'RSS' },
        { name: 'CNN', url: 'https://rss.cnn.com/rss/edition.rss', provider: 'RSS' },
    ],
};

// Cache mémoire simple
const cache = new Map();
const TTL_MS = 60 * 1000;

function getCache(key) {
    const e = cache.get(key);
    if (!e) return null;
    if (Date.now() - e.ts > TTL_MS) return null;
    return e.data;
}
function setCache(key, data) {
    cache.set(key, { ts: Date.now(), data });
}

async function fetchNewsApiSources(lang) {
    if (!NEWS_API_KEY) return [];

    const url = `https://newsapi.org/v2/top-headlines/sources?language=${lang}&apiKey=${NEWS_API_KEY}`;

    try {
        const res = await fetchWithTimeout(url, 9000);
        const data = await res.json();

        const sources = Array.isArray(data.sources) ? data.sources : [];

        return sources.map(s =>
            normalizeSource({
                name: s.name,
                url: s.url,
                provider: 'NewsAPI',
            })
        );
    } catch (e) {
        console.error('NewsAPI sources error:', e.message || e);
        return [];
    }
}

async function getSources({ lang }) {
    const safeLang = lang === 'en' ? 'en' : 'fr';

    const cacheKey = `sources:${safeLang}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const fromNewsApi = await fetchNewsApiSources(safeLang);
    const fromRss = (RSS_SOURCES[safeLang] || RSS_SOURCES.fr).map(normalizeSource);

    const merged = dedupeSources([...fromNewsApi, ...fromRss]).sort((a, b) =>
        a.name.localeCompare(b.name, safeLang === 'fr' ? 'fr' : 'en', { sensitivity: 'base' })
    );

    setCache(cacheKey, merged);
    return merged;
}

module.exports = { getSources };
