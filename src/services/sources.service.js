const { fetchWithTimeout } = require('../utils/fetchWithTimeout');
const { normalizeSource } = require('../utils/normalize');
const { dedupeSources } = require('../utils/dedupe');

const NEWS_API_KEY = process.env.NEWS_API_KEY;

// Liste des IDs "Elite" officiels de NewsAPI (Garantis sans bugs)
const ELITE_IDS = [
    // Français
    'le-monde', 'liberation', 'les-echos', 'le-figaro', 'google-news-fr',
    // Anglais (USA/UK)
    'bbc-news', 'cnn', 'reuters', 'the-verge', 'techcrunch', 'abc-news', 'google-news'
];

const RSS_SOURCES = {
    fr: [
        { name: 'Le Monde', url: 'https://www.lemonde.fr/rss/une.xml', provider: 'RSS' },
        { name: 'France 24', url: 'https://www.france24.com/fr/rss', provider: 'RSS' }
    ],
    en: [
        { name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml', provider: 'RSS' },
        { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss', provider: 'RSS' }
    ]
};

async function fetchNewsApiSources(lang) {
    if (!NEWS_API_KEY) return [];
    const url = `https://newsapi.org/v2/top-headlines/sources?language=${lang}&apiKey=${NEWS_API_KEY}`;

    try {
        const res = await fetchWithTimeout(url, 5000);
        const data = await res.json();
        let sources = data.sources || [];

        // ON FILTRE : On ne garde que les IDs de notre liste ELITE
        sources = sources.filter(s => ELITE_IDS.includes(s.id));

        return sources.map(s => normalizeSource({
            name: s.name,
            url: s.url,
            provider: 'NewsAPI'
        }));
    } catch (e) {
        console.error(`[NewsAPI] Erreur sources ${lang}:`, e.message);
        return [];
    }
}

async function getSources({ lang }) {
    const safeLang = (lang === 'en') ? 'en' : 'fr';

    // On lance les deux récupérations
    const fromNewsApi = await fetchNewsApiSources(safeLang);
    const fromRss = (RSS_SOURCES[safeLang] || []).map(normalizeSource);

    // Fusion et dédoublonnage
    const merged = dedupeSources([...fromNewsApi, ...fromRss]).sort((a, b) =>
        a.name.localeCompare(b.name, safeLang)
    );

    return merged;
}

module.exports = { getSources };