const { normalizeSource } = require('../utils/normalize');
const { dedupeSources } = require('../utils/dedupe');
const {
    coerceLang,
    coerceCategory,
    getSourcesFromCatalog
} = require('../config/sources.config');

function sortSources(a, b, locale) {
    const priorityA = Number(a.priority) || 0;
    const priorityB = Number(b.priority) || 0;

    if (priorityB !== priorityA) {
        return priorityB - priorityA;
    }

    return String(a.name || '').localeCompare(String(b.name || ''), locale, {
        sensitivity: 'base'
    });
}

async function getSources({ lang, category }) {
    const safeLang = coerceLang(lang);
    const safeCategory = coerceCategory(category);

    let sources = getSourcesFromCatalog({
        lang: safeLang,
        category: safeCategory
    }).map((source) =>
        normalizeSource({
            ...source,
            category: source.categoryId
        })
    );

    sources = dedupeSources(sources);

    const locale = safeLang === 'en' ? 'en' : 'fr';
    sources.sort((a, b) => sortSources(a, b, locale));

    return sources;
}

module.exports = { getSources };