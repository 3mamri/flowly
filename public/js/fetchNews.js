const articlesContainer = document.getElementById('articles-container');
const keywordInput = document.getElementById('keyword-input');
const loadingIndicator = document.getElementById('loading-indicator');
const sourceSelect = document.getElementById('source-select');
const noResults = document.getElementById('no-results');
const sourcesList = document.getElementById('sources-list');

const UI = window.FlowlyUI || null;

const state = {
    lang: localStorage.getItem('flowlyLang') === 'en' ? 'en' : 'fr',
    category: '',
    source: '',
    keyword: '',
    page: 1,
    pageSize: 60,
};

let allArticles = [];
let allSources = [];
let lastFetchId = 0;
let favorites = JSON.parse(localStorage.getItem('flowlyFavorites')) || [];

/* ---------------- HELPERS ---------------- */

function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function normalizeText(v) {
    return decodeHTML(String(v ?? '')).toLowerCase().trim();
}

async function fetchJson(url) {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

function buildSourcesFallbackFromArticles(articles) {
    const map = new Map();
    for (const a of articles) {
        const name = a?.source;
        if (!name) continue;
        if (!map.has(name)) {
            map.set(name, { name, url: a.sourceUrl || '' });
        }
    }
    return [...map.values()];
}

function setActiveUI() {
    const activeCat = state.category || 'Actualités';
    UI?.setActiveButtons?.('.lang-btn', state.lang, 'data-lang');
    UI?.setActiveButtons?.('.nav-cat', activeCat, 'data-cat');
    const favBtn = document.getElementById('btn-show-fav');
    if (favBtn) {
        favBtn.classList.toggle('active', state.category === 'FAVORIS');
    }
}

/* ---------------- FAVORITES ---------------- */

window.toggleFavorite = function(articleLien) {
    const index = favorites.findIndex(a => a.lien === articleLien);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        const article = allArticles.find(a => a.lien === articleLien);
        if (article) favorites.push(article);
    }
    localStorage.setItem('flowlyFavorites', JSON.stringify(favorites));

    if (state.category === 'FAVORIS') {
        window.showFavorites();
    } else {
        applyFiltersAndRender();
    }
};

window.showFavorites = function() {
    state.category = 'FAVORIS';
    setActiveUI();
    UI?.setLoading?.(loadingIndicator, false);
    UI?.renderArticles?.(articlesContainer, favorites, noResults);
};

/* ---------------- SOURCES ---------------- */

async function loadSources(fetchId) {
    try {
        const data = await fetchJson(`/api/sources?lang=${state.lang}`);
        if (fetchId !== lastFetchId) return;
        allSources = Array.isArray(data.sources) ? data.sources : [];
    } catch (e) {
        console.error('sources error:', e);
        if (fetchId !== lastFetchId) return;
        allSources = [];
    }
    if (!UI) return;
    UI.populateSourceSelect?.(sourceSelect, allSources, state.source);
    UI.renderSourcesList?.(sourcesList, allSources);
}

/* ---------------- ARTICLES ---------------- */

async function loadNews(fetchId) {
    if (state.category === 'FAVORIS') return;
    UI?.setLoading?.(loadingIndicator, true);
    UI?.showMessage?.(noResults, false);

    const params = new URLSearchParams({
        lang: state.lang,
        page: state.page,
        pageSize: state.pageSize
    });

    if (state.category) {
        params.set('category', state.category);
    }

    try {
        const data = await fetchJson(`/api/news?${params.toString()}`);
        if (fetchId !== lastFetchId) return;
        allArticles = Array.isArray(data.articles) ? data.articles : [];

        if (!allArticles.length) {
            UI?.renderArticles?.(articlesContainer, [], noResults);
            UI?.showMessage?.(noResults, true, "Aucun article trouvé.");
            return;
        }

        if ((!allSources || allSources.length === 0) && allArticles.length > 0) {
            allSources = buildSourcesFallbackFromArticles(allArticles);
            UI?.populateSourceSelect?.(sourceSelect, allSources, state.source);
            UI?.renderSourcesList?.(sourcesList, allSources);
        }
        applyFiltersAndRender();
    } catch (e) {
        console.error('news error:', e);
        if (fetchId !== lastFetchId) return;
        allArticles = [];
        UI?.renderArticles?.(articlesContainer, [], noResults);
    } finally {
        if (fetchId === lastFetchId) {
            UI?.setLoading?.(loadingIndicator, false);
        }
    }
}

function applyFiltersAndRender() {
    if (state.category === 'FAVORIS') {
        UI?.renderArticles?.(articlesContainer, favorites, noResults);
        return;
    }

    state.keyword = (keywordInput?.value || '').toLowerCase().trim();
    state.source = sourceSelect?.value || '';
    let filtered = [...allArticles];

    if (state.source) {
        filtered = filtered.filter(a => a.source === state.source);
    }

    if (state.keyword) {
        filtered = filtered.filter(a =>
            (a.titre || '').toLowerCase().includes(state.keyword) ||
            (a.description || '').toLowerCase().includes(state.keyword)
        );
    }

    if (UI && UI.renderArticles) {
        UI.renderArticles(articlesContainer, filtered, noResults);
    }
}

/* ---------------- ORCHESTRATION ---------------- */

function refetchNewsOnly() {
    lastFetchId++;
    setActiveUI();
    loadNews(lastFetchId);
}

function refetchAll() {
    lastFetchId++;
    const id = lastFetchId;
    state.lang = localStorage.getItem('flowlyLang') || 'fr';
    setActiveUI();
    state.source = '';
    state.keyword = '';
    if (sourceSelect) sourceSelect.value = '';
    if (keywordInput) keywordInput.value = '';
    loadSources(id);
    loadNews(id);
}

/* ---------------- EVENTS ---------------- */

function bindEvents() {
    const targetBtn = document.getElementById('filter-button');
    const targetSelect = document.getElementById('source-select');
    const targetInput = document.getElementById('keyword-input');
    const favBtn = document.getElementById('btn-show-fav');

    // Gestion des catégories
    document.querySelectorAll('.nav-cat').forEach(btn => {
        btn.addEventListener('click', () => {
            const label = (btn.getAttribute('data-cat') || 'Actualités').trim();
            state.category = (label === 'Actualités') ? '' : label;
            refetchNewsOnly();
        });
    });

    if (targetBtn) targetBtn.addEventListener('click', applyFiltersAndRender);
    if (targetSelect) targetSelect.addEventListener('change', applyFiltersAndRender);
    if (targetInput) {
        targetInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') applyFiltersAndRender();
        });
    }

    // Gestion du bouton favoris
    if (favBtn) {
        favBtn.addEventListener('click', () => {
            window.showFavorites();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    refetchAll();
});

window.refetchAll = refetchAll;