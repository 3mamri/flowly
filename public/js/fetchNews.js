const articlesContainer = document.getElementById('articles-container');
const keywordInput = document.getElementById('keyword-input');
const filterButton = document.getElementById('filter-button');
const loadingIndicator = document.getElementById('loading-indicator');
const sourceSelect = document.getElementById('source-select');
const sourcesList = document.getElementById('sources-list');
const noResults = document.getElementById('no-results');

const UI = window.FlowlyUI || null;

const state = {
    lang: localStorage.getItem('flowlyLang') === 'en' ? 'en' : 'fr',
    category: '', // '' = Actualités (pas de filtre)
    source: '',
    keyword: '',
    page: 1,
    pageSize: 60,
};

let allArticles = [];
let allSources = [];
let lastFetchId = 0;

/* --------- Helpers --------- */
function fallbackMessage(msg) {
    if (!articlesContainer) return;
    articlesContainer.textContent = '';
    const div = document.createElement('div');
    div.style.padding = '16px';
    div.style.opacity = '0.85';
    div.textContent = msg;
    articlesContainer.appendChild(div);
}

async function fetchJson(url) {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

function normalizeText(v) {
    return String(v ?? '').toLowerCase().trim();
}

function setActiveUI() {
    const activeCat = state.category || 'Actualités';
    UI?.setActiveButtons?.('.lang-btn', state.lang, 'data-lang');
    UI?.setActiveButtons?.('.nav-cat', activeCat, 'data-cat');
}

function buildSourcesFallbackFromArticles(articles) {
    const map = new Map();
    for (const a of articles) {
        const name = a?.source;
        if (!name) continue;
        if (!map.has(name)) map.set(name, { name, url: a.sourceUrl || '' });
    }
    return [...map.values()];
}

/* --------- Sources --------- */
async function loadSources(fetchId) {
    try {
        const data = await fetchJson(`/api/sources?lang=${encodeURIComponent(state.lang)}`);
        if (fetchId !== lastFetchId) return;
        allSources = Array.isArray(data.sources) ? data.sources : [];
    } catch (e) {
        console.error('sources error:', e);
        if (fetchId !== lastFetchId) return;
        allSources = [];
    }

    if (!UI) return; // UI manquante => pas de crash
    UI.populateSourceSelect?.(sourceSelect, allSources, state.source);
    UI.renderSourcesList?.(sourcesList, allSources);
}

/* --------- Articles --------- */
async function loadNews(fetchId) {
    UI?.setLoading?.(loadingIndicator, true);
    UI?.showMessage?.(noResults, false);

    const params = new URLSearchParams({
        lang: state.lang,
        page: String(state.page),
        pageSize: String(state.pageSize),
    });
    if (state.category) params.set('category', state.category);

    try {
        const data = await fetchJson(`/api/news?${params.toString()}`);
        if (fetchId !== lastFetchId) return;

        allArticles = Array.isArray(data.articles) ? data.articles : [];

        // fallback sources si /api/sources vide
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
        if (UI) {
            UI.renderArticles?.(articlesContainer, [], noResults);
            UI.showMessage?.(noResults, true, "Erreur de chargement. Réessaie.");
        } else {
            fallbackMessage("Erreur de chargement. Réessaie.");
        }
    } finally {
        if (fetchId === lastFetchId) UI?.setLoading?.(loadingIndicator, false);
    }
}

function applyFiltersAndRender() {
    state.keyword = normalizeText(keywordInput?.value);
    state.source = sourceSelect?.value || '';

    let filtered = [...allArticles];

    if (state.source) filtered = filtered.filter(a => a.source === state.source);

    if (state.keyword) {
        filtered = filtered.filter(a =>
            normalizeText(a.titre).includes(state.keyword) ||
            normalizeText(a.description).includes(state.keyword)
        );
    }

    if (UI) {
        UI.renderArticles?.(articlesContainer, filtered, noResults);
    } else {
        fallbackMessage(filtered.length ? 'Chargé.' : 'Aucun résultat.');
    }
}

/* --------- Orchestration --------- */
function refetchAll() {
    lastFetchId += 1;
    const id = lastFetchId;
    setActiveUI();

    state.source = '';
    state.keyword = '';
    state.page = 1;
    if (sourceSelect) sourceSelect.value = '';
    if (keywordInput) keywordInput.value = '';

    loadSources(id);
    loadNews(id);
}

function refetchNewsOnly() {
    lastFetchId += 1;
    const id = lastFetchId;
    setActiveUI();
    loadNews(id);
}

/* --------- Events --------- */
function bindEvents() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang') === 'en' ? 'en' : 'fr';
            if (lang === state.lang) return;

            state.lang = lang;
            localStorage.setItem('flowlyLang', state.lang);

            state.category = '';
            refetchAll();
        });
    });

    document.querySelectorAll('.nav-cat').forEach(btn => {
        btn.addEventListener('click', () => {
            const label = (btn.getAttribute('data-cat') || 'Actualités').trim();
            state.category = (label === 'Actualités' || label.toUpperCase() === 'ACTUALITÉS') ? '' : label;

            // reset UI-filters (évite faux “aucun résultat”)
            state.source = '';
            state.keyword = '';
            if (sourceSelect) sourceSelect.value = '';
            if (keywordInput) keywordInput.value = '';
            state.page = 1;

            refetchNewsOnly();
        });
    });

    filterButton?.addEventListener('click', applyFiltersAndRender);
    sourceSelect?.addEventListener('change', applyFiltersAndRender);

    keywordInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') applyFiltersAndRender();
    });
}

window.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    setActiveUI();
    refetchAll();
});
