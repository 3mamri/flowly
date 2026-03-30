// public/js/fetchNews.js

const articlesContainer = document.getElementById('articles-container');
const keywordInput = document.getElementById('keyword-input');
const loadingIndicator = document.getElementById('loading-indicator');
const sourceSelect = document.getElementById('source-select');
const noResults = document.getElementById('no-results');
const sourcesList = document.getElementById('sources-list');

const UI = window.FlowlyUI || null;

const state = {
    lang: localStorage.getItem('flowlyLang') === 'en' ? 'en' : 'fr',
    category: 'general',
    source: '',
    keyword: '',
    page: 1,
    pageSize: 60,
};

window.state = state;

let allArticles = [];
let allSources = [];
let lastFetchId = 0;
let favorites = JSON.parse(localStorage.getItem('flowlyFavorites')) || [];

/* ---------------- HELPERS ---------------- */

function decodeHTML(html = '') {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

function normalizeText(v) {
    return decodeHTML(String(v ?? '')).toLowerCase().trim();
}

async function fetchJson(url) {
    const res = await fetch(url, {
        headers: { Accept: 'application/json' }
    });

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }

    return res.json();
}

function setActiveUI() {
    UI?.setActiveButtons?.('.lang-btn', state.lang, 'data-lang');
    UI?.setActiveButtons?.('.nav-cat', state.category, 'data-cat');

    const favBtn = document.getElementById('btn-show-fav');
    if (favBtn) {
        favBtn.classList.toggle('active', state.category === 'favorites');
    }
}

/* ---------------- FAVORITES ---------------- */

window.toggleFavorite = function(articleUrl) {
    const index = favorites.findIndex((a) => a.url === articleUrl);

    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        const article = allArticles.find((a) => a.url === articleUrl);
        if (article) {
            favorites.push(article);
        }
    }

    localStorage.setItem('flowlyFavorites', JSON.stringify(favorites));

    if (state.category === 'favorites') {
        window.showFavorites();
    } else {
        applyFiltersAndRender();
    }
};

window.showFavorites = function() {
    state.category = 'favorites';
    setActiveUI();
    UI?.setLoading?.(loadingIndicator, false);
    UI?.renderArticles?.(articlesContainer, favorites, noResults);
};

/* ---------------- SOURCES ---------------- */

async function loadSources(fetchId) {
    if (state.category === 'favorites') {
        allSources = [];
        UI?.populateSourceSelect?.(sourceSelect, [], '');
        UI?.renderSourcesList?.(sourcesList, []);
        return;
    }

    try {
        const params = new URLSearchParams({
            lang: state.lang,
            category: state.category
        });

        const data = await fetchJson(`/api/sources?${params.toString()}`);

        if (fetchId !== lastFetchId) return;

        allSources = Array.isArray(data.sources) ? data.sources : [];
    } catch (e) {
        console.error('sources error:', e);

        if (fetchId !== lastFetchId) return;
        allSources = [];
    }

    UI?.populateSourceSelect?.(sourceSelect, allSources, state.source);
    UI?.renderSourcesList?.(sourcesList, allSources);
}

/* ---------------- ARTICLES ---------------- */

async function loadNews(fetchId) {
    if (state.category === 'favorites') return;

    UI?.setLoading?.(loadingIndicator, true);
    UI?.showMessage?.(noResults, false);

    const params = new URLSearchParams({
        lang: state.lang,
        category: state.category,
        page: String(state.page),
        pageSize: String(state.pageSize)
    });

    try {
        const data = await fetchJson(`/api/news?${params.toString()}`);

        if (fetchId !== lastFetchId) return;

        allArticles = Array.isArray(data.articles) ? data.articles : [];

        applyFiltersAndRender();
    } catch (e) {
        console.error('news error:', e);

        if (fetchId !== lastFetchId) return;

        allArticles = [];
        UI?.renderArticles?.(articlesContainer, [], noResults);
        UI?.showMessage?.(noResults, true, 'Aucun article trouvé.');
    } finally {
        if (fetchId === lastFetchId) {
            UI?.setLoading?.(loadingIndicator, false);
        }
    }
}

/* ---------------- FILTER ---------------- */

function applyFiltersAndRender() {
    if (state.category === 'favorites') {
        UI?.renderArticles?.(articlesContainer, favorites, noResults);
        return;
    }

    state.keyword = normalizeText(keywordInput?.value || '');
    state.source = sourceSelect?.value || '';

    let filtered = [...allArticles];

    // Sécurité supplémentaire front
    if (state.category && state.category !== 'general') {
        filtered = filtered.filter((a) => a.primaryCategory === state.category);
    }

    if (state.source) {
        filtered = filtered.filter((a) => a.source === state.source);
    }

    if (state.keyword) {
        filtered = filtered.filter((a) =>
            normalizeText(a.title).includes(state.keyword) ||
            normalizeText(a.description).includes(state.keyword)
        );
    }

    UI?.renderArticles?.(articlesContainer, filtered, noResults);
}

/* ---------------- ORCHESTRATION ---------------- */

function refetchNewsOnly() {
    lastFetchId++;
    const currentId = lastFetchId;

    setActiveUI();
    loadSources(currentId);
    loadNews(currentId);
}

function refetchAll() {
    lastFetchId++;
    const id = lastFetchId;

    state.lang = localStorage.getItem('flowlyLang') === 'en' ? 'en' : 'fr';
    state.source = '';
    state.keyword = '';
    state.page = 1;

    if (sourceSelect) sourceSelect.value = '';
    if (keywordInput) keywordInput.value = '';

    setActiveUI();
    loadSources(id);
    loadNews(id);
}

/* ---------------- EVENTS ---------------- */

function bindEvents() {
    document.querySelectorAll('.nav-cat').forEach((btn) => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-cat') || 'general';
            state.category = category;
            refetchNewsOnly();
        });
    });

    document.querySelectorAll('.lang-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            if (!lang) return;

            localStorage.setItem('flowlyLang', lang);
            state.lang = lang;
            refetchAll();
        });
    });

    sourceSelect?.addEventListener('change', applyFiltersAndRender);

    keywordInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            applyFiltersAndRender();
        }
    });

    document.getElementById('filter-button')?.addEventListener('click', applyFiltersAndRender);

    document.getElementById('btn-show-fav')?.addEventListener('click', () => {
        window.showFavorites();
    });
}

/* ---------------- INIT ---------------- */

document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    setActiveUI();
    refetchAll();
});

window.refetchAll = refetchAll;