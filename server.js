require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const Parser = require('rss-parser');

const app = express();
const port = 3000;
const rssParser = new Parser({ customFields: { item: ['media:content', 'media:group'] } });

app.use(express.json());
app.use(express.static('public'));

// --- CONFIGURATION ---
const API_KEY = process.env.NEWS_API_KEY;
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

// Cache pour les sources
let cachedSources = [];

/**
 * 1. Récupère le catalogue des médias filtré par la langue sélectionnée
 */
async function fetchSourcesByLanguage(lang) {
    const url = `https://newsapi.org/v2/top-headlines/sources?language=${lang}&apiKey=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.status === 'ok' ? data.sources : [];
    } catch (e) {
        console.error("Erreur catalogue sources:", e);
        return [];
    }
}

/**
 * 2. Récupère et formate les flux RSS
 */
async function fetchRSS(url) {
    try {
        const feed = await rssParser.parseURL(url);
        return feed.items.map(item => ({
            titre: item.title,
            source: feed.title || new URL(url).hostname,
            lien: item.link,
            category: 'RSS',
            publishedAt: item.pubDate,
            description: item.contentSnippet || item.content,
            urlToImage: item.enclosure?.url || null
        })).slice(0, 10);
    } catch (e) {
        return [];
    }
}

// --- ROUTES ---

app.get('/api/news', async (req, res) => {
    const lang = req.query.lang || 'fr';
    let allArticles = [];
    const promises = [];

    // A. NEWS API : On moissonne les médias de la langue sélectionnée
    if (API_KEY) {
        promises.push((async () => {
            const catalog = await fetchSourcesByLanguage(lang);
            const sourceIds = catalog.map(s => s.id).slice(0, 20).join(',');

            if (!sourceIds) return [];

            const url = `https://newsapi.org/v2/top-headlines?sources=${sourceIds}&apiKey=${API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();

            return (data.articles || []).map(a => ({
                titre: a.title,
                source: a.source.name,
                lien: a.url,
                category: catalog.find(s => s.id === a.source.id)?.category || 'Général',
                publishedAt: a.publishedAt,
                description: a.description,
                urlToImage: a.urlToImage
            }));
        })());
    }

    // B. GNEWS : Couverture mondiale filtrée par langue
    if (GNEWS_API_KEY) {
        const gnewsUrl = `https://gnews.io/api/v4/top-headlines?lang=${lang}&token=${GNEWS_API_KEY}&max=20`;
        promises.push(
            fetch(gnewsUrl)
                .then(r => r.json())
                .then(data => (data.articles || []).map(a => ({
                    titre: a.title,
                    source: `GNews: ${a.source.name}`,
                    lien: a.url,
                    category: 'Mondial',
                    publishedAt: a.publishedAt,
                    description: a.description,
                    urlToImage: a.image
                })))
                .catch(() => [])
        );
    }

    // C. RSS : Flux manuels spécifiques à la langue
    const rssList = {
        'fr': ['https://www.lemonde.fr/rss/une.xml', 'https://www.france24.com/fr/rss'],
        'en': ['https://techcrunch.com/feed/', 'https://feeds.bbci.co.uk/news/world/rss.xml']
    };
    (rssList[lang] || []).forEach(url => promises.push(fetchRSS(url)));

    // Fusion des résultats et tri chronologique
    try {
        const results = await Promise.all(promises);
        results.forEach(batch => {
            if (Array.isArray(batch)) allArticles.push(...batch);
        });
        allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    } catch (err) {
        console.error("Erreur lors de la fusion:", err);
    }

    res.json({ success: true, articles: allArticles });
});

app.post('/api/summarize', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false });
    await new Promise(r => setTimeout(r, 800)); // Simulation IA
    res.json({ success: true, summary: `[RÉSUMÉ IA] : ${text.substring(0, 150)}...` });
});

app.listen(port, () => console.log(`Flowly tournant sur http://localhost:${port}`));