const Parser = require('rss-parser');
const { fetchWithTimeout } = require('../utils/fetchWithTimeout');
const { normalizeArticle, originFromUrl } = require('../utils/normalize');
const { dedupeByUrl } = require('../utils/dedupe');
const { detectCategory } = require('../utils/categorize');
const {
    CATEGORY_IDS,
    coerceLang,
    coerceCategory,
    getSourcesFromCatalog
} = require('../config/sources.config');

const rssParser = new Parser({
    customFields: {
        item: [
            ['media:content', 'mediaContent'],
            ['content:encoded', 'contentEncoded'],
            ['description', 'description'],
            ['content', 'content']
        ]
    }
});

const NEWS_API_KEY = process.env.NEWS_API_KEY;

const langToCountry = {
    fr: 'fr',
    en: 'us'
};

const NEWSAPI_CATEGORY_MAP = {
    general: 'general',
    politics: null,
    economy: 'business',
    sports: 'sports',
    culture: 'entertainment',
    technology: 'technology'
};

const CATEGORY_SEARCH_TERMS = {
    fr: {
        politics: 'politique OR gouvernement OR ministre OR assemblée OR sénat OR présidentielle',
        economy: 'économie OR inflation OR bourse OR entreprise OR marché OR banque',
        sports: 'sport OR football OR ligue OR match OR tennis OR rugby OR formule 1',
        culture: 'culture OR cinéma OR musique OR festival OR série OR livre',
        technology: 'technologie OR tech OR intelligence artificielle OR startup OR numérique OR cybersécurité'
    },
    en: {
        politics: 'politics OR government OR minister OR parliament OR senate OR election',
        economy: 'economy OR inflation OR stock market OR business OR bank OR company',
        sports: 'sports OR football OR soccer OR match OR tennis OR NBA OR Formula 1',
        culture: 'culture OR cinema OR movie OR music OR festival OR series OR books',
        technology: 'technology OR tech OR AI OR startup OR cybersecurity OR software'
    }
};

function normalizeSourceKey(value = '') {
    return String(value)
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function pickBestText(item = {}) {
    const title =
        item.title ||
        item.contentSnippet ||
        item.contentEncoded ||
        item.content ||
        item.description ||
        '';

    const description =
        item.contentSnippet ||
        item.contentEncoded ||
        item.content ||
        item.description ||
        title ||
        '';

    return {
        title: String(title || '').trim(),
        description: String(description || '').trim()
    };
}

function determinePrimaryCategory(article, lang, forcedCategory = null) {
    if (forcedCategory && CATEGORY_IDS.includes(forcedCategory)) {
        return forcedCategory;
    }

    const sourceKey = normalizeSourceKey(article.source || '');

    if (sourceKey.includes("l'equipe") || sourceKey.includes('lequipe')) return 'sports';
    if (sourceKey.includes('bbc sport')) return 'sports';
    if (sourceKey.includes('politico')) return 'politics';
    if (sourceKey.includes('les echos')) return 'economy';
    if (sourceKey.includes('numerama')) return 'technology';
    if (sourceKey.includes('techcrunch')) return 'technology';

    return detectCategory(article.title, article.description, lang);
}

function isValidArticle(article) {
    if (!article || typeof article !== 'object') return false;
    if (!article.url) return false;
    if (!article.title && !article.description) return false;
    return true;
}

function strictCategoryFilter(article, requestedCategory) {
    if (requestedCategory === 'general') return true;
    return article.primaryCategory === requestedCategory;
}

function buildEverythingUrl({ lang, category, pageSize }) {
    const query = CATEGORY_SEARCH_TERMS[lang]?.[category];
    if (!query || !NEWS_API_KEY) return null;

    return `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=${lang}&sortBy=publishedAt&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`;
}

function buildTopHeadlinesUrl({ lang, category, pageSize }) {
    if (!NEWS_API_KEY) return null;

    const mappedCategory = NEWSAPI_CATEGORY_MAP[category];
    const country = langToCountry[lang] || 'fr';

    let url = `https://newsapi.org/v2/top-headlines?country=${country}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`;

    if (mappedCategory && mappedCategory !== 'general') {
        url += `&category=${mappedCategory}`;
    }

    return url;
}

async function fetchJsonArticles(url, lang, forcedCategory = null) {
    if (!url) return [];

    try {
        const res = await fetchWithTimeout(url, 9000);
        const data = await res.json();
        const items = Array.isArray(data.articles) ? data.articles : [];

        return items
            .map((item) => {
                const normalized = normalizeArticle(
                    {
                        title: item.title,
                        description: item.description || item.content || '',
                        url: item.url,
                        publishedAt: item.publishedAt,
                        image: item.urlToImage,
                        source: item.source?.name || 'NewsAPI',
                        sourceUrl: originFromUrl(item.url)
                    },
                    lang
                );

                return {
                    ...normalized,
                    title: normalized.title || normalized.description || 'Sans titre',
                    primaryCategory: determinePrimaryCategory(
                        normalized,
                        lang,
                        forcedCategory
                    )
                };
            })
            .filter(isValidArticle);
    } catch (e) {
        console.error('[NewsAPI] Error:', e.message);
        return [];
    }
}

async function fetchNewsAPI({ lang, category, pageSize }) {
    if (!NEWS_API_KEY) return [];

    const safePageSize = Math.min(Math.max(Number(pageSize) || 30, 10), 100);
    const urls = [];

    if (category === 'general') {
        urls.push({
            url: buildTopHeadlinesUrl({ lang, category: 'general', pageSize: safePageSize }),
            forcedCategory: null
        });
    } else {
        if (NEWSAPI_CATEGORY_MAP[category]) {
            urls.push({
                url: buildTopHeadlinesUrl({ lang, category, pageSize: safePageSize }),
                forcedCategory: category
            });
        }

        urls.push({
            url: buildEverythingUrl({ lang, category, pageSize: safePageSize }),
            forcedCategory: category
        });
    }

    const results = await Promise.all(
        urls.map(({ url, forcedCategory }) =>
            fetchJsonArticles(url, lang, forcedCategory)
        )
    );

    return results.flat();
}

async function fetchRSSFeed(feed, lang) {
    try {
        const parsed = await rssParser.parseURL(feed.url);
        const items = Array.isArray(parsed.items) ? parsed.items : [];

        return items
            .slice(0, 30)
            .map((item) => {
                const { title, description } = pickBestText(item);

                const image =
                    item.enclosure?.url ||
                    item.mediaContent?.$?.url ||
                    item.mediaContent?.url ||
                    null;

                const normalized = normalizeArticle(
                    {
                        title: title || description || 'Sans titre',
                        description,
                        url: item.link,
                        publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
                        image,
                        source: feed.name,
                        sourceUrl: originFromUrl(feed.url)
                    },
                    lang
                );

                return {
                    ...normalized,
                    title: normalized.title || normalized.description || 'Sans titre',
                    primaryCategory: determinePrimaryCategory(
                        normalized,
                        lang,
                        feed.categoryId || null
                    )
                };
            })
            .filter(isValidArticle);
    } catch (e) {
        console.error(`[RSS] ${feed.name}:`, e.message);
        return [];
    }
}

async function getNews({ lang, category, page, pageSize }) {
    try {
        const safeLang = coerceLang(lang);
        const safeCategory = coerceCategory(category || 'general');
        const safePage = Math.max(parseInt(page, 10) || 1, 1);
        const safePageSize = Math.min(Math.max(parseInt(pageSize, 10) || 60, 10), 100);

        const rssFeeds = getSourcesFromCatalog({
            lang: safeLang,
            category: safeCategory
        });

        const results = await Promise.all([
            fetchNewsAPI({
                lang: safeLang,
                category: safeCategory,
                pageSize: Math.min(safePageSize * 2, 100)
            }),
            ...rssFeeds.map((feed) => fetchRSSFeed(feed, safeLang))
        ]);

        let merged = results.flat().filter(isValidArticle);

        merged = dedupeByUrl(merged);

        merged = merged.filter((article) => strictCategoryFilter(article, safeCategory));
        merged = merged.filter((article) => article.language === safeLang);

        if (safeCategory === 'general') {
            merged = merged.filter((article) => article.title || article.description);
        }

        merged.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

        const start = (safePage - 1) * safePageSize;
        return merged.slice(start, start + safePageSize);
    } catch (err) {
        console.error('[Service News] Erreur:', err);
        return [];
    }
}

module.exports = { getNews };