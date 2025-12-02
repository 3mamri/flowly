// server.js
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// RSS Parser
const Parser = require('rss-parser');
const rssParser = new Parser({
    customFields: {
        item: ['media:content', 'media:group'],
    }
});

// --- CLÉS ET URLS ---
const API_KEY = process.env.NEWS_API_KEY;
const GNEWS_API_KEY = process.env.GNEWS_API_KEY; // NOUVEAU
const NEWS_API_BASE_URL = 'https://newsapi.org/v2/top-headlines';
const GNEWS_API_BASE_URL = 'https://gnews.io/api/v4/top-headlines'; // NOUVEAU
const NEWS_API_SOURCES_URL = 'https://newsapi.org/v2/top-headlines/sources';

if (!API_KEY) {
    console.error("4dce789306e145cf9742b48fc50bf366");
}
if (!GNEWS_API_KEY) {
    console.error("81b21675ada8417c0f671064dc8a8fc");
}

let cachedAvailableSources = []; // Cache pour les sources NewsAPI

/**
 * Récupère la liste complète des sources NewsAPI disponibles (IDs).
 */
async function fetchMaximumSources() {
    if (cachedAvailableSources.length > 0) return cachedAvailableSources;

    // Obtient toutes les sources en français ET en anglais, basées en France.
    const url = `${NEWS_API_SOURCES_URL}?language=fr,en&country=fr&apiKey=${API_KEY}`;

    if (!API_KEY) return [];

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'ok' && Array.isArray(data.sources)) {
            cachedAvailableSources = data.sources.map(source => ({
                id: source.id,
                name: source.name,
                category: source.category || 'general'
            }));
            return cachedAvailableSources;
        } else {
            console.error("Erreur lors de la récupération des sources API:", data.message);
            return [];
        }
    } catch (error) {
        console.error("Erreur critique lors de l'appel à l'endpoint Sources:", error.message);
        return [];
    }
}


// --- GNEWS HELPER (NOUVEAU) ---

/**
 * Appelle GNews et formate les articles.
 */
async function fetchGNews(lang) {
    if (!GNEWS_API_KEY) return [];

    // GNews supporte 'fr' et 'en' pour le paramètre lang
    const url = `${GNEWS_API_BASE_URL}?lang=${lang}&token=${GNEWS_API_KEY}&max=20`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.totalArticles > 0 && Array.isArray(data.articles)) {
            return data.articles.map(article => ({
                lien: article.url,
                titre: article.title,
                description: article.description,
                // Préfixer pour identifier la source dans le filtre média
                source: `GNews: ${article.source.name}`,
                urlToImage: article.image,
                publishedAt: article.publishedAt,
                category: 'GNews',
            }));
        } else {
            console.error("Erreur GNews:", data.errors ? data.errors[0] : 'Statut KO');
            return [];
        }
    } catch (error) {
        console.error("Erreur critique lors de l'appel à GNews:", error.message);
        return [];
    }
}


// --- RSS HELPER et Configuration RSS (Objet par langue) ---

const userRssFeeds = {
    'fr': [
        'https://www.lemonde.fr/rss/une.xml', 'https://www.rtl.fr/podcast/feed/info.xml',
        'https://www.lefigaro.fr/rss/figaro_actualites.xml', 'https://www.france24.com/fr/rss',
        'https://www.bfmtv.com/rss/news/accueil/', 'https://www.lesechos.fr/rss/rss-les-echos-une.xml',
        'https://www.liberation.fr/rss/actualite/',
        'https://www.20minutes.fr/rss/',
        'https://www.radio-canada.ca/rss/nouvelles/toutelactualite',
        'https://www.lalibre.be/rss/dernieres-infos.xml',
    ],
    'en': [
        'https://techcrunch.com/feed/', 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
        'https://feeds.bbci.co.uk/news/world/rss.xml', 'https://feeds.reuters.com/Reuters/worldNews',
        'https://www.theguardian.com/world/rss', 'https://www.wired.com/feed/rss',
        'https://rss.cnn.com/rss/cnn_topstories.rss',
        'https://www.washingtonpost.com/rss/business',
        'https://www.nasa.gov/rss/dyn/breaking_news.rss',
        'https://feeds.a.dj.com/rss/RTfInaZ.xml',
    ],
};
async function fetchAndFormatRss(feedUrl) {
    // ... (votre code fetchAndFormatRss reste inchangé)
    try {
        const feed = await rssParser.parseURL(feedUrl);
        const sourceUrl = new URL(feedUrl);
        return feed.items.map(item => ({
            lien: item.link || '#',
            titre: item.title || 'Pas de titre',
            description: item.contentSnippet || item.summary || item.content || 'Description non disponible.',
            source: feed.title || sourceUrl.hostname,
            urlToImage: (item.enclosure && item.enclosure.url) ? item.enclosure.url : null,
            publishedAt: item.pubDate,
            category: 'RSS'
        })).slice(0, 10);
    } catch (error) {
        console.error(`Erreur lors de la récupération du flux RSS ${feedUrl}:`, error.message);
        return [];
    }
}

// ... (votre generateSummary reste inchangé) ...
async function generateSummary(fullText) {
    if (!fullText || fullText.length < 50) {
        return "Le contenu de l'article est trop court pour générer un résumé pertinent.";
    }
    await new Promise(resolve => setTimeout(resolve, 800));
    const shortText = fullText.substring(0, 150);
    return `[RÉSUMÉ IA] : ${shortText}... (Ce résumé est simulé.)`;
}


// --- ROUTE PRINCIPALE D'AGRÉGATION ---
app.get('/api/news', async (req, res) => {
    let allArticles = [];
    const countryCode = req.query.lang || 'fr';
    const promises = [];

    // --- 1. NewsAPI (Max Sources) ---
    if (API_KEY) {
        promises.push((async () => {
            const availableSources = await fetchMaximumSources(); // Récupère la liste complète des sources
            const sourceIds = availableSources.map(s => s.id);

            // NewsAPI limit: only allows 20 sources per 'sources' filter value.
            const sourcesForApiCall = sourceIds.slice(0, 20).join(',');

            if (!sourcesForApiCall) return [];

            const dynamicApiUrl = `${NEWS_API_BASE_URL}?sources=${sourcesForApiCall}&apiKey=${API_KEY}`;

            try {
                const apiResponse = await fetch(dynamicApiUrl, { headers: { 'User-Agent': 'Flowly-News-Aggregator/1.0' } });
                const apiData = await apiResponse.json();

                if (apiData.status === 'ok' && Array.isArray(apiData.articles)) {
                    const sourceMap = new Map(availableSources.map(s => [s.name, s.category]));

                    return apiData.articles.map(article => ({
                        lien: article.url,
                        titre: article.title,
                        description: article.content || article.description,
                        source: article.source.name,
                        urlToImage: article.urlToImage,
                        publishedAt: article.publishedAt,
                        category: sourceMap.get(article.source.name) || 'general',
                    }));
                } else {
                    console.error(`Erreur NewsAPI:`, apiData.message || 'Statut KO');
                    return [];
                }
            } catch (error) {
                console.error("Erreur critique NewsAPI:", error.message);
                return [];
            }
        })());
    }

    // --- 2. GNews (NOUVEAU) ---
    if (GNEWS_API_KEY) {
        promises.push(fetchGNews(countryCode));
    }

    // --- 3. RSS Feeds ---
    const feedsToFetch = userRssFeeds[countryCode] || userRssFeeds['fr'];
    promises.push(...feedsToFetch.map(fetchAndFormatRss));

    // 4. Exécution et fusion des promesses
    const results = await Promise.all(promises);

    results.forEach(articles => {
        if (Array.isArray(articles)) {
            allArticles.push(...articles);
        }
    });

    // 5. Tri final
    allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    res.json({
        success: true,
        articles: allArticles
    });
});


// ROUTE DE RÉSUMÉ D'ARTICLE
app.post('/api/summarize', async (req, res) => {
    // ... (votre code reste inchangé) ...
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ success: false, message: "Le champ 'text' est requis pour le résumé." });
    }

    try {
        const summary = await generateSummary(text);
        res.json({ success: true, summary: summary });
    } catch (error) {
        console.error("Erreur lors de la génération du résumé:", error.message);
        res.status(500).json({ success: false, message: "Échec de la génération du résumé par l'IA." });
    }
});


// Servir les fichiers statiques (Frontend)
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Flowly server running at http://localhost:${3000}`);
});