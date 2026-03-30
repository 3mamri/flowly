const CATEGORY_IDS = ['general', 'politics', 'economy', 'sports', 'culture', 'technology'];

const SOURCE_CATALOG = [
    // =========================
    // FR — GENERAL
    // =========================
    {
        id: 'fr_lemonde_general',
        name: 'Le Monde',
        language: 'fr',
        categoryId: 'general',
        provider: 'RSS',
        url: 'https://www.lemonde.fr/rss/une.xml',
        priority: 100
    },
    {
        id: 'fr_france24_general',
        name: 'France 24',
        language: 'fr',
        categoryId: 'general',
        provider: 'RSS',
        url: 'https://www.france24.com/fr/rss',
        priority: 95
    },

    // =========================
    // FR — POLITICS
    // =========================
    {
        id: 'fr_lemonde_politics',
        name: 'Le Monde',
        language: 'fr',
        categoryId: 'politics',
        provider: 'RSS',
        url: 'https://www.lemonde.fr/politique/rss_full.xml',
        priority: 100
    },
    {
        id: 'fr_lemonde_assemblee',
        name: "Le Monde | Cuisines de l'Assemblée",
        language: 'fr',
        categoryId: 'politics',
        provider: 'RSS',
        url: 'https://www.lemonde.fr/cuisines-de-l-assemblee/rss_full.xml',
        priority: 92
    },

    // =========================
    // FR — ECONOMY
    // =========================
    {
        id: 'fr_lesechos_economy',
        name: 'Les Échos',
        language: 'fr',
        categoryId: 'economy',
        provider: 'RSS',
        url: 'https://business.lesechos.fr/rss/les-echos-business.xml',
        priority: 100
    },
    {
        id: 'fr_lemonde_economy',
        name: 'Le Monde',
        language: 'fr',
        categoryId: 'economy',
        provider: 'RSS',
        url: 'https://www.lemonde.fr/economie/rss_full.xml',
        priority: 92
    },

    // =========================
    // FR — SPORTS
    // =========================
    {
        id: 'fr_lequipe_sports',
        name: "L'Équipe",
        language: 'fr',
        categoryId: 'sports',
        provider: 'RSS',
        url: 'https://dwh.lequipe.fr/api/edito/rss?path=/',
        priority: 100
    },
    {
        id: 'fr_lemonde_sports',
        name: 'Le Monde',
        language: 'fr',
        categoryId: 'sports',
        provider: 'RSS',
        url: 'https://www.lemonde.fr/sport/rss_full.xml',
        priority: 88
    },

    // =========================
    // FR — CULTURE
    // =========================
    {
        id: 'fr_lemonde_culture',
        name: 'Le Monde',
        language: 'fr',
        categoryId: 'culture',
        provider: 'RSS',
        url: 'https://www.lemonde.fr/culture/rss_full.xml',
        priority: 100
    },

    // =========================
    // FR — TECHNOLOGY
    // =========================
    {
        id: 'fr_numerama_technology',
        name: 'Numerama',
        language: 'fr',
        categoryId: 'technology',
        provider: 'RSS',
        url: 'https://www.numerama.com/feed/',
        priority: 100
    },
    {
        id: 'fr_lemonde_pixels',
        name: 'Le Monde | Pixels',
        language: 'fr',
        categoryId: 'technology',
        provider: 'RSS',
        url: 'https://www.lemonde.fr/pixels/rss_full.xml',
        priority: 92
    },

    // =========================
    // EN — GENERAL
    // =========================
    {
        id: 'en_bbc_general',
        name: 'BBC News',
        language: 'en',
        categoryId: 'general',
        provider: 'RSS',
        url: 'https://feeds.bbci.co.uk/news/rss.xml',
        priority: 100
    },
    {
        id: 'en_cnn_general',
        name: 'CNN',
        language: 'en',
        categoryId: 'general',
        provider: 'RSS',
        url: 'https://rss.cnn.com/rss/edition.rss',
        priority: 95
    },
    {
        id: 'en_guardian_world',
        name: 'The Guardian',
        language: 'en',
        categoryId: 'general',
        provider: 'RSS',
        url: 'https://www.theguardian.com/world/rss',
        priority: 92
    },

    // =========================
    // EN — POLITICS
    // =========================
    {
        id: 'en_politico_politics',
        name: 'Politico',
        language: 'en',
        categoryId: 'politics',
        provider: 'RSS',
        url: 'https://www.politico.com/rss/politicopicks.xml',
        priority: 100
    },
    {
        id: 'en_guardian_politics',
        name: 'The Guardian',
        language: 'en',
        categoryId: 'politics',
        provider: 'RSS',
        url: 'https://www.theguardian.com/politics/rss',
        priority: 92
    },

    // =========================
    // EN — ECONOMY
    // =========================
    {
        id: 'en_reuters_business',
        name: 'Reuters',
        language: 'en',
        categoryId: 'economy',
        provider: 'RSS',
        url: 'https://feeds.reuters.com/reuters/businessNews',
        priority: 100
    },
    {
        id: 'en_bbc_business',
        name: 'BBC News',
        language: 'en',
        categoryId: 'economy',
        provider: 'RSS',
        url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
        priority: 92
    },

    // =========================
    // EN — SPORTS
    // =========================
    {
        id: 'en_bbc_sport',
        name: 'BBC Sport',
        language: 'en',
        categoryId: 'sports',
        provider: 'RSS',
        url: 'http://feeds.bbci.co.uk/sport/rss.xml?edition=uk',
        priority: 100
    },
    {
        id: 'en_guardian_sport',
        name: 'The Guardian',
        language: 'en',
        categoryId: 'sports',
        provider: 'RSS',
        url: 'https://www.theguardian.com/uk/sport/rss',
        priority: 92
    },

    // =========================
    // EN — CULTURE
    // =========================
    {
        id: 'en_guardian_culture',
        name: 'The Guardian',
        language: 'en',
        categoryId: 'culture',
        provider: 'RSS',
        url: 'https://www.theguardian.com/uk/culture/rss',
        priority: 100
    },
    {
        id: 'en_bbc_entertainment',
        name: 'BBC News',
        language: 'en',
        categoryId: 'culture',
        provider: 'RSS',
        url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',
        priority: 92
    },

    // =========================
    // EN — TECHNOLOGY
    // =========================
    {
        id: 'en_techcrunch_technology',
        name: 'TechCrunch',
        language: 'en',
        categoryId: 'technology',
        provider: 'RSS',
        url: 'https://techcrunch.com/feed/',
        priority: 100
    },
    {
        id: 'en_bbc_technology',
        name: 'BBC News',
        language: 'en',
        categoryId: 'technology',
        provider: 'RSS',
        url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
        priority: 92
    }
];

function coerceLang(lang) {
    if (lang === 'en') return 'en';
    if (lang === 'all') return 'all';
    return 'fr';
}

function coerceCategory(category) {
    return CATEGORY_IDS.includes(category) ? category : 'general';
}

function getSourcesFromCatalog({ lang = 'fr', category = 'general' } = {}) {
    const safeLang = coerceLang(lang);
    const safeCategory = coerceCategory(category);
    const languages = safeLang === 'all' ? ['fr', 'en'] : [safeLang];

    return SOURCE_CATALOG.filter(
        (source) =>
            languages.includes(source.language) &&
            source.categoryId === safeCategory
    );
}

module.exports = {
    CATEGORY_IDS,
    SOURCE_CATALOG,
    coerceLang,
    coerceCategory,
    getSourcesFromCatalog
};