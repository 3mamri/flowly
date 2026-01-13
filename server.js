require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const Parser = require('rss-parser');

const app = express();
const port = 3000;
const rssParser = new Parser();

app.use(express.json());
app.use(express.static('public'));

const NEWS_API_KEY = process.env.NEWS_API_KEY;

/* --------------------------------------------------
   1. DÉTECTION DE CATÉGORIE PAR CONTENU (PRIORITAIRE)
-------------------------------------------------- */
function detectCategory(title = '', description = '') {
    const text = `${title} ${description}`.toLowerCase();

    const scores = {
        Sports: 0,
        Politique: 0,
        Économie: 0,
        Culture: 0
    };

    // ⚽ SPORTS
    if (/\b(football|foot|ligue|match|but|score|psg|om|jo|tennis|nba|f1|rugby|stade)\b/.test(text)) {
        scores.Sports += 3;
    }

    // 🏛️ POLITIQUE
    if (/\b(élection|gouvernement|ministre|président|elysée|assemblée|sénat|député|vote|réforme|loi)\b/.test(text)) {
        scores.Politique += 3;
    }

    // 💰 ÉCONOMIE
    if (/\b(économie|bourse|inflation|pib|croissance|entreprise|finance|banque|marché|emploi|salaire)\b/.test(text)) {
        scores.Économie += 3;
    }

    // 🎭 CULTURE / TECH
    if (/\b(cinéma|film|série|festival|musique|concert|album|art\b|exposition|livre|ia\b|intelligence artificielle|technologie|nasa|espace)\b/.test(text)) {
        scores.Culture += 3;
    }

    // 🔍 Choix de la meilleure catégorie
    const bestCategory = Object.entries(scores)
        .sort((a, b) => b[1] - a[1])[0];

    // ❌ Aucun score → Actualités
    if (!bestCategory || bestCategory[1] === 0) {
        return 'Actualités';
    }

    return bestCategory[0];
}

/* --------------------------------------------------
   2. NEWSAPI — ARTICLES PAR LANGUE
-------------------------------------------------- */
async function fetchNewsAPI(lang) {
    if (!NEWS_API_KEY) return [];

    try {
        const res = await fetch(
            `https://newsapi.org/v2/top-headlines?language=${lang}&pageSize=40&apiKey=${NEWS_API_KEY}`
        );
        const data = await res.json();

        return (data.articles || []).map(a => ({
            titre: a.title,
            source: a.source.name,
            lien: a.url,
            publishedAt: a.publishedAt,
            description: a.description || '',
            urlToImage: a.urlToImage || null,
            category: detectCategory(a.title, a.description)
        }));
    } catch (e) {
        console.error('Erreur NewsAPI:', e);
        return [];
    }
}

/* --------------------------------------------------
   3. RSS — ANALYSE IDENTIQUE
-------------------------------------------------- */
async function fetchRSS(url) {
    try {
        const feed = await rssParser.parseURL(url);

        return feed.items.slice(0, 15).map(item => ({
            titre: item.title,
            source: feed.title || new URL(url).hostname,
            lien: item.link,
            publishedAt: item.pubDate || new Date().toISOString(),
            description: item.contentSnippet || '',
            urlToImage: item.enclosure?.url || null,
            category: detectCategory(item.title, item.contentSnippet)
        }));
    } catch (e) {
        console.error('Erreur RSS:', url);
        return [];
    }
}

/* --------------------------------------------------
   4. ROUTE PRINCIPALE
-------------------------------------------------- */
app.get('/api/news', async (req, res) => {
    const lang = req.query.lang || 'fr';

    const rssFeeds = {
        fr: [
            'https://www.lemonde.fr/rss/une.xml',
            'https://www.france24.com/fr/rss',
            'https://www.lequipe.fr/rss/actu_rss.xml'
        ],
        en: [
            'https://feeds.bbci.co.uk/news/rss.xml',
            'https://rss.cnn.com/rss/edition.rss'
        ]
    };

    try {
        const promises = [
            fetchNewsAPI(lang),
            ...(rssFeeds[lang] || []).map(url => fetchRSS(url))
        ];

        const results = await Promise.all(promises);
        const articles = results.flat();

        // 🔥 TRI FINAL
        articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

        res.json({ success: true, articles });
    } catch (err) {
        console.error('Erreur API:', err);
        res.status(500).json({ success: false });
    }
});

/* -------------------------------------------------- */
app.listen(port, () => {
    console.log(`🗞️ Flowly lancé → http://localhost:${port}`);
});
