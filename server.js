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

/**
 * Nettoie le texte des balises HTML pour un rendu "Clean"
 */
function cleanDescription(text) {
    if (!text) return "";
    return text.replace(/<[^>]*>?/gm, '').substring(0, 200) + "...";
}

/**
 * 1. Récupère les sources autorisées par langue via NewsAPI
 */
async function fetchSourcesByLanguage(lang) {
    const url = `https://newsapi.org/v2/top-headlines/sources?language=${lang}&apiKey=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.status === 'ok' ? data.sources : [];
    } catch (e) {
        console.error("Erreur sources:", e);
        return [];
    }
}

/**
 * 2. Récupère les flux RSS spécifiques à la langue
 */
async function fetchRSS(url, category = 'Actualités') {
    try {
        const feed = await rssParser.parseURL(url);
        return feed.items.map(item => ({
            titre: item.title,
            source: feed.title || new URL(url).hostname,
            lien: item.link,
            category: category,
            publishedAt: item.pubDate,
            description: cleanDescription(item.contentSnippet || item.content),
            urlToImage: item.enclosure?.url || null
        })).slice(0, 10);
    } catch (e) {
        return [];
    }
}

// --- ROUTES ---

app.get('/api/news', async (req, res) => {
    // Récupère 'fr' ou 'en' envoyé par fetchNews.js
    const lang = req.query.lang || 'fr';
    let allArticles = [];
    const promises = [];

    // A. NEWS API : Filtrage par langue sélectionnée
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
                description: cleanDescription(a.description),
                urlToImage: a.urlToImage
            }));
        })());
    }

    // B. GNEWS : Filtrage mondial par langue sélectionnée
    if (GNEWS_API_KEY) {
        const gnewsUrl = `https://gnews.io/api/v4/top-headlines?lang=${lang}&token=${GNEWS_API_KEY}&max=15`;
        promises.push(
            fetch(gnewsUrl)
                .then(r => r.json())
                .then(data => (data.articles || []).map(a => ({
                    titre: a.title,
                    source: a.source.name,
                    lien: a.url,
                    category: 'Mondial',
                    publishedAt: a.publishedAt,
                    description: cleanDescription(a.description),
                    urlToImage: a.image
                })))
                .catch(() => [])
        );
    }

    // C. RSS : Sélection des flux selon la langue choisie
    const rssList = {
        'fr': [
            { url: 'https://www.lemonde.fr/rss/une.xml', cat: 'Politique' },
            { url: 'https://www.france24.com/fr/rss', cat: 'Actualités' }
        ],
        'en': [
            { url: 'https://techcrunch.com/feed/', cat: 'Tech' },
            { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', cat: 'Mondial' }
        ]
    };

    const selectedRSS = rssList[lang] || [];
    selectedRSS.forEach(item => promises.push(fetchRSS(item.url, item.cat)));

    // Fusion et tri chronologique
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
    // Résumé simple pour démonstration
    res.json({ success: true, summary: `[RÉSUMÉ IA] : ${text.substring(0, 150)}...` });
});

app.listen(port, () => console.log(`Flowly tournant sur http://localhost:${port}`));