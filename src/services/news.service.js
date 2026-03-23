// src/services/news.service.js

const Parser = require('rss-parser');
const { fetchWithTimeout } = require('../utils/fetchWithTimeout');
const { normalizeArticle, originFromUrl } = require('../utils/normalize');
const { dedupeByUrl } = require('../utils/dedupe');

const rssParser = new Parser();
const NEWS_API_KEY = process.env.NEWS_API_KEY;

// RSS feeds de secours
const RSS_FEEDS = {
    fr: [
        { name: 'Le Monde', url: 'https://www.lemonde.fr/rss/une.xml' },
        { name: 'France 24', url: 'https://www.france24.com/fr/rss' }
    ],
    en: [
        { name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml' },
        { name: 'CNN', url: 'https://rss.cnn.com/rss/edition.rss' }
    ],
};

// Mapping Pays pour NewsAPI
const langToCountry = { fr: 'fr', en: 'us' };

/**
 * Récupère les news de NewsAPI avec gestion des catégories
 */
async function fetchNewsAPI({ lang, category, pageSize }) {
    if (!NEWS_API_KEY) return [];

    const country = langToCountry[lang] || 'fr';

    // Construction de l'URL avec les bons paramètres
    // NewsAPI attend : business, entertainment, general, health, science, sports, technology
    let url = `https://newsapi.org/v2/top-headlines?country=${country}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`;

    if (category && category !== 'general' && category !== '') {
        url += `&category=${category}`;
    }

    try {
        const res = await fetchWithTimeout(url, 9000);
        const data = await res.json();

        if (data.status === 'error') {
            console.error('[NewsAPI Error]', data.message);
            return [];
        }

        const items = Array.isArray(data.articles) ? data.articles : [];
        return items.map(a => normalizeArticle({
            titre: a.title,
            description: a.description || a.content || '',
            lien: a.url,
            publishedAt: a.publishedAt,
            urlToImage: a.urlToImage || null,
            source: a?.source?.name || 'NewsAPI',
            sourceUrl: originFromUrl(a.url),
        }));
    } catch (e) {
        console.error('[NewsAPI] Erreur de récupération:', e.message);
        return [];
    }
}

/**
 * Récupère les news via les flux RSS
 */
async function fetchRSSFeed(feed) {
    try {
        const parsed = await rssParser.parseURL(feed.url);
        const items = Array.isArray(parsed.items) ? parsed.items : [];

        return items.slice(0, 20).map(item => normalizeArticle({
            titre: item.title,
            description: item.contentSnippet || item.content || '',
            lien: item.link,
            publishedAt: item.pubDate || new Date().toISOString(),
            urlToImage: item.enclosure?.url || null,
            source: feed.name,
            sourceUrl: originFromUrl(feed.url),
        }));
    } catch (e) {
        console.error(`[RSS] Erreur sur ${feed.name}:`, e.message);
        return [];
    }
}

/**
 * Fonction principale appelée par le contrôleur
 */
async function getNews({ lang, category, page, pageSize }) {
    try {
        const safeLang = lang === 'en' ? 'en' : 'fr';
        const safePage = parseInt(page) || 1;
        const safePageSize = parseInt(pageSize) || 60;

        // On lance NewsAPI et les RSS en parallèle
        // Note: Les RSS ne gèrent pas bien les catégories, donc on ne les charge
        // principalement que pour la catégorie "general" (Actualités)
        const feeds = (category === 'general' || !category) ? (RSS_FEEDS[safeLang] || []) : [];

        const results = await Promise.all([
            fetchNewsAPI({ lang: safeLang, category, pageSize: 100 }),
            ...feeds.map(fetchRSSFeed)
        ]);

        // Fusion et nettoyage
        let merged = results.flat().filter(Boolean);
        merged = dedupeByUrl(merged);

        // Tri par date (plus récent en premier)
        merged.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

        // Pagination finale
        const start = (safePage - 1) * safePageSize;
        return merged.slice(start, start + safePageSize);

    } catch (err) {
        console.error('[Service News] Erreur globale:', err);
        return [];
    }
}

module.exports = { getNews };