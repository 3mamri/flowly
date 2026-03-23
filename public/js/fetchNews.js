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

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }

    return res.json();
}


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


/* ---------------- FILTRAGE ET RENDU ---------------- */

function applyFiltersAndRender() {
    console.log("🎨 Application des filtres...");

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
    } else {
        console.error("❌ FlowlyUI.renderArticles est introuvable !");
    }
}


/* ---------------- NEWS ---------------- */

async function loadNews(fetchId) {
    if (state.category === 'FAVORIS') return;

    UI?.setLoading?.(loadingIndicator, true);
    UI?.showMessage?.(noResults, false);

    const categoryMapping = {
        'Actualités': 'general',
        'Politique': 'general',
        'Économie': 'business',
        'Sports': 'sports',
        'Culture': 'entertainment',
        'Technologie': 'technology'
    };

    const sourceMapping = {
        'BBC News': 'bbc-news',
        'CNN': 'cnn',
        'The Verge': 'the-verge',
        'TechCrunch': 'techcrunch',
        'Reuters': 'reuters',
        'Bloomberg': 'bloomberg'
    };

    let apiCategory = categoryMapping[state.category] || 'general';

    const params = new URLSearchParams({
        page: state.page,
        pageSize: state.pageSize,
        lang: state.lang // Ajout de la langue pour le serveur
    });

    if (state.source && sourceMapping[state.source]) {
        params.set('source', sourceMapping[state.source]);
    } else {
        params.set('category', apiCategory);
        // params.set('country', 'us'); // Optionnel selon ta config serveur
    }

    try {
        const data = await fetchJson(`/api/news?${params.toString()}`);

        if (fetchId !== lastFetchId) return;

        allArticles = Array.isArray(data.articles) ? data.articles : (data || []);

        if (!allArticles.length) {
            UI?.renderArticles?.(articlesContainer, [], noResults);
            UI?.showMessage?.(noResults, true, "Aucun article trouvé.");
        } else {
            applyFiltersAndRender();
        }
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


function refetchNewsOnly() {
    lastFetchId++;
    const id = lastFetchId;

    setActiveUI();
    loadNews(id);
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

function setActiveUI() {
    const activeCat = state.category || 'Actualités';

    UI?.setActiveButtons?.('.lang-btn', state.lang, 'data-lang');
    UI?.setActiveButtons?.('.nav-cat', activeCat, 'data-cat');

    const favBtn = document.getElementById('btn-show-fav');

    if (favBtn) {
        favBtn.classList.toggle('active', state.category === 'FAVORIS');
    }
}


/* ---------------- EVENTS ---------------- */

function bindEvents() {
    document.querySelectorAll('.nav-cat').forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.getAttribute('data-cat');
            state.category = (cat === 'Actualités') ? '' : cat;
            state.page = 1;
            refetchNewsOnly();
        });
    });

    document.getElementById('filter-button')?.addEventListener('click', () => {
        applyFiltersAndRender();
    });

    document.getElementById('source-select')?.addEventListener('change', () => {
        applyFiltersAndRender();
    });

    document.getElementById('keyword-input')?.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') applyFiltersAndRender();
    });

    document.getElementById('btn-show-fav')?.addEventListener('click', () => {
        state.category = 'FAVORIS';
        setActiveUI();
        applyFiltersAndRender();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    refetchAll();
});

window.refetchAll = refetchAll;