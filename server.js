// server.js
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

// Middleware pour analyser les requêtes JSON (nécessaire pour /api/summarize)
app.use(express.json());

// RSS Parser
const Parser = require('rss-parser');
const rssParser = new Parser({
    customFields: {
        item: ['media:content', 'media:group'],
    }
});

const API_KEY = process.env.NEWS_API_KEY;
// Base URL pour les top-headlines, la langue sera ajoutée dynamiquement
const NEWS_API_BASE_URL = 'https://newsapi.org/v2/top-headlines';

if (!API_KEY) {
    console.error("Clé API NEWS_API_KEY manquante !");
    process.exit(1);
}

// --- CONFIGURATION RSS SIMULÉE ---
const userRssFeeds = [
    'https://www.lemonde.fr/rss/une.xml',        // Le Monde (français)
    'https://www.rtl.fr/podcast/feed/info.xml',  // RTL Info (français)
    'http://feeds.lefigaro.fr/rss/figaro_actualites.xml' // Le Figaro (français)
];
// --- RSS HELPER ---

/**
 * Analyse un flux RSS et formate les articles pour Flowly.
 */
async function fetchAndFormatRss(feedUrl) {
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
        // Log d'erreur détaillé pour le débogage
        console.error(`Erreur lors de la récupération du flux RSS ${feedUrl}:`, error.message);
        return [];
    }
}


// --- IA HELPER (SIMULÉ) ---

/**
 * Simule l'appel à une API d'IA pour résumer un texte.
 */
async function generateSummary(fullText) {
    if (!fullText || fullText.length < 50) {
        return "Le contenu de l'article est trop court pour générer un résumé pertinent.";
    }

    // SIMULATION IA : Remplacer ceci par votre appel réel à une API LLM
    await new Promise(resolve => setTimeout(resolve, 800));
    const shortText = fullText.substring(0, 150);
    return `[RÉSUMÉ IA] : ${shortText}... (Ce résumé est simulé.)`;
}


// --- ROUTES ---

// ROUTE D'AGRÉGATION PRINCIPALE
app.get('/api/news', async (req, res) => {
    let allArticles = [];

    // 1. Déterminer la langue (countryCode)
    const countryCode = req.query.lang || 'fr';
    // Construire l'URL API avec le paramètre dynamique
    const dynamicApiUrl = `${NEWS_API_BASE_URL}?country=${countryCode}&apiKey=${API_KEY}`;

    // 2. Récupération des articles de l'API principale (NewsAPI)
    try {
        const apiResponse = await fetch(dynamicApiUrl, {
            headers: { 'User-Agent': 'Flowly-News-Aggregator/1.0' }
        });
        const apiData = await apiResponse.json();

        // <<< LIGNE DE DIAGNOSTIC >>>
        console.log("Statut de la réponse NewsAPI:", apiData.status, "Message:", apiData.message);
        // <<< FIN LIGNE DE DIAGNOSTIC >>>

        if (apiData.status === 'ok' && Array.isArray(apiData.articles)) {
            const mainApiArticles = apiData.articles.map(article => ({
                lien: article.url,
                titre: article.title,
                description: article.content || article.description,
                source: article.source.name,
                urlToImage: article.urlToImage,
                publishedAt: article.publishedAt,
                category: article.source.name
            }));
            allArticles.push(...mainApiArticles);
        } else {
            console.error(`Erreur de l'API principale pour ${countryCode}:`, apiData.message || 'Statut KO');
        }
    } catch (error) {
        console.error("Erreur critique lors de l'appel à NewsAPI:", error.message);
    }

    // 3. Récupération des articles des flux RSS spécifiques à la langue
    // (Assurez-vous que userRssFeeds est un objet, pas un tableau, pour le filtrage par langue)
    const feedsToFetch = userRssFeeds[countryCode] || userRssFeeds['fr'];

    const rssPromises = feedsToFetch.map(fetchAndFormatRss);
    const rssResults = await Promise.all(rssPromises);
    rssResults.forEach(articles => {
        allArticles.push(...articles);
    });

    // 4. Tri final et Réponse
    allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    res.json({
        success: true,
        articles: allArticles
    });
});
// ROUTE DE RÉSUMÉ D'ARTICLE
app.post('/api/summarize', async (req, res) => {
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


// Assurez-vous que le dossier 'public' existe et contient vos fichiers frontend.
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Flowly server running at http://localhost:${port}`);
});