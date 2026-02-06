const Parser = require('rss-parser');

const { fetchWithTimeout } = require('../utils/fetchWithTimeout');
const { normalizeArticle, originFromUrl } = require('../utils/normalize');
const { dedupeByUrl } = require('../utils/dedupe');

const rssParser = new Parser();

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

// RSS feeds (complète les APIs)
const RSS_FEEDS = {
    fr: [
        { name: 'Le Monde', url: 'https://www.lemonde.fr/rss/une.xml' },
        { name: 'France 24', url: 'https://www.france24.com/fr/rss' },
        { name: "L'Équipe", url: 'https://www.lequipe.fr/rss/actu_rss.xml' },
    ],
    en: [
        { name: 'BBC', url: 'https://feeds.bbci.co.uk/news/rss.xml' },
        { name: 'CNN', url: 'https://rss.cnn.com/rss/edition.rss' },
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

// NewsAPI top-headlines -> country (plus fiable que language seul)
const langToCountry = { fr: 'fr', en: 'gb' };

async function fetchNewsAPI({ lang, pageSize }) {
    if (!NEWS_API_KEY) return [];

    const country = langToCountry[lang] || 'fr';
    const url = `https://newsapi.org/v2/top-headlines?country=${country}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`;

    try {
        const res = await fetchWithTimeout(url, 9000);
        const data = await res.json();
        const items = Array.isArray(data.articles) ? data.articles : [];

        return items.map(a =>
            normalizeArticle({
                titre: a.title,
                description: a.description || a.content || '',
                lien: a.url,
                publishedAt: a.publishedAt,
                urlToImage: a.urlToImage || null,
                source: a?.source?.name || 'NewsAPI',
                sourceUrl: originFromUrl(a.url),
            })
        );
    } catch (e) {
        console.error('NewsAPI error:', e.message || e);
        return [];
    }
}

async function fetchGNews({ lang, max }) {
    if (!GNEWS_API_KEY) return [];

    const url = `https://gnews.io/api/v4/top-headlines?lang=${lang}&max=${max}&token=${GNEWS_API_KEY}`;

    try {
        const res = await fetchWithTimeout(url, 9000);
        const data = await res.json();
        const items = Array.isArray(data.articles) ? data.articles : [];

        return items.map(a =>
            normalizeArticle({
                titre: a.title,
                description: a.description || '',
                lien: a.url,
                publishedAt: a.publishedAt,
                urlToImage: a.image || null,
                source: a?.source?.name ? `GNews: ${a.source.name}` : 'GNews',
                sourceUrl: a?.source?.url || originFromUrl(a.url),
            })
        );
    } catch (e) {
        console.error('GNews error:', e.message || e);
        return [];
    }
}

async function fetchRSSFeed(feed) {
    try {
        const parsed = await rssParser.parseURL(feed.url);
        const items = Array.isArray(parsed.items) ? parsed.items : [];

        return items.slice(0, 30).map(item => {
            const img =
                item.enclosure?.url ||
                item['media:content']?.url ||
                item['media:group']?.['media:content']?.url ||
                null;

            return normalizeArticle({
                titre: item.title,
                description: item.contentSnippet || item.content || '',
                lien: item.link,
                publishedAt: item.pubDate || new Date().toISOString(),
                urlToImage: img,
                source: parsed.title || feed.name,
                sourceUrl: parsed.link || originFromUrl(feed.url),
            });
        });
    } catch (e) {
        console.error('RSS error:', feed.url, e.message || e);
        return [];
    }
}

function paginate(list, page, pageSize) {
    const start = (page - 1) * pageSize;
    return list.slice(start, start + pageSize);
}

async function getNews({ lang, category, page, pageSize }) {
    const safeLang = lang === 'en' ? 'en' : 'fr';
    const safeCategory = typeof category === 'string' ? category.trim() : '';
    const safePage = Math.min(Math.max(parseInt(page, 10) || 1, 1), 50);
    const safePageSize = Math.min(Math.max(parseInt(pageSize, 10) || 60, 10), 100);

    const cacheKey = `news:${safeLang}:${safeCategory || 'all'}:${safePage}:${safePageSize}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const feeds = RSS_FEEDS[safeLang] || RSS_FEEDS.fr;

    const results = await Promise.all([
        fetchNewsAPI({ lang: safeLang, pageSize: 80 }),
        fetchGNews({ lang: safeLang, max: 80 }),
        ...feeds.map(fetchRSSFeed),
    ]);

    let merged = results.flat().filter(Boolean);

    // dedupe
    merged = dedupeByUrl(merged);

    // filtre catégorie serveur
    if (safeCategory) merged = merged.filter(a => a.category === safeCategory);

    // tri date desc
    merged.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    // pagination finale
    const paged = paginate(merged, safePage, safePageSize);

    setCache(cacheKey, paged);
    return paged;
}

module.exports = { getNews };
