const articlesContainer = document.getElementById('articles-container');
const keywordInput = document.getElementById('keyword-input');
const filterButton = document.getElementById('filter-button');
const clearButton = document.getElementById('clear-button');
const loadingIndicator = document.getElementById('loading-indicator');
const noResultsIndicator = document.getElementById('no-results');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const languageSelect = document.getElementById('language-select');
const sourceSelect = document.getElementById('source-select');
const categorySelect = document.getElementById('category-select');

let allArticles = [];

// --- UTILITIES ---

function timeAgo(publishedDate) {
    const now = new Date();
    const published = new Date(publishedDate);
    const diff = Math.floor((now - published) / 1000);
    if (diff < 60) return `Il y a ${diff}s`;
    if (diff < 3600) return `Il y a ${Math.floor(diff/60)}min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff/3600)}h`;
    if (diff < 604800) return `Il y a ${Math.floor(diff/86400)}j`;
    return `Le ${published.toLocaleDateString('fr-FR')}`;
}

function getSelectedValues(selectElement) {
    if (!selectElement) return [];
    return Array.from(selectElement.options)
        .filter(option => option.selected && option.value !== '')
        .map(option => option.value);
}

// --- LOCAL STORAGE HELPERS ---

function getReadHistory() {
    try {
        const history = JSON.parse(localStorage.getItem('readHistory'));
        return Array.isArray(history) ? history : [];
    } catch (e) { return []; }
}

function getHiddenSources() {
    try {
        const hidden = JSON.parse(localStorage.getItem('hiddenSources'));
        return Array.isArray(hidden) ? hidden : [];
    } catch (e) { return []; }
}
function populateSourceSelect(articles) {
    if (!sourceSelect) return;
    // Crée une liste unique de toutes les sources présentes dans les articles
    const sources = [...new Set(articles.map(a => a.source))].sort();

    sourceSelect.innerHTML = '<option value="">Toutes les sources (' + articles.length + ')</option>';
    sources.forEach(src => {
        const option = document.createElement('option');
        option.value = src;
        option.textContent = src;
        sourceSelect.appendChild(option);
    });
}
// --- RENDERING & MARKUP ---

function createArticleHtml(article) {
    const readHistory = getReadHistory();
    const articleId = article.lien;
    const isRead = readHistory.includes(articleId);
    const sourceName = article.source || 'Inconnue';

    return `
    <div class="p-5 bg-white shadow-lg hover:shadow-xl transition rounded-xl border-l-4 border-blue-500 dark:bg-gray-800 dark:border-blue-700 ${isRead ? 'opacity-60' : ''}" data-article-id="${articleId}" data-full-description="${article.description}">
        ${article.urlToImage ? `<img src="${article.urlToImage}" alt="Image" class="w-full h-40 object-cover rounded-lg mb-3">` : ''}
        <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400" data-source-name="${sourceName}">${sourceName}</span>
            <button class="hide-source-btn text-red-500 hover:text-red-700 text-xs font-bold">[Masquer]</button>
            ${article.category ? `<span class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-xl dark:bg-blue-900 dark:text-blue-200">${article.category}</span>` : ''}
            ${article.publishedAt ? `<span class="text-gray-400 text-xs">${timeAgo(article.publishedAt)}</span>` : ''}
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mt-1 mb-2">
            <a href="${article.lien}" target="_blank" rel="noopener noreferrer" class="article-link text-blue-600 hover:underline dark:text-blue-400">
                ${article.titre}
            </a>
        </h3>
        <p class="text-gray-700 dark:text-gray-300">${article.description || 'Pas de description.'}</p>
        <button class="summarize-btn mt-3 px-3 py-1 text-xs font-medium text-white bg-green-500 rounded-md hover:bg-green-600 transition">Résumer (IA)</button>
        <p class="summary-output mt-2 text-sm italic text-green-700 dark:text-green-400 hidden"></p>
    </div>
    `;
}

function renderArticles(articles) {
    articlesContainer.innerHTML = '';
    if (!articles.length) {
        noResultsIndicator.classList.remove('hidden');
        return;
    }
    noResultsIndicator.classList.add('hidden');
    articles.forEach(article => articlesContainer.insertAdjacentHTML('beforeend', createArticleHtml(article)));
}

// --- DYNAMIC SELECTS POPULATION ---

function populateCategorySelect(articles) {
    if (!categorySelect) return;
    const categories = [...new Set(articles.map(a => a.category))].filter(c => c).sort();
    categorySelect.innerHTML = '<option value="">Toutes les catégories</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.toLowerCase();
        option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        categorySelect.appendChild(option);
    });
}

function populateSourceSelect(articles) {
    if (!sourceSelect) return;
    const sources = [...new Set(articles.map(a => a.source))].sort();
    sourceSelect.innerHTML = '<option value="">Toutes les sources (' + articles.length + ')</option>';
    sources.forEach(src => {
        const option = document.createElement('option');
        option.value = src;
        option.textContent = src;
        sourceSelect.appendChild(option);
    });
}

// --- FILTERING LOGIC ---

function renderFilteredArticles() {
    const keyword = keywordInput.value.toLowerCase().trim();
    const hiddenSources = getHiddenSources();
    const selectedSources = getSelectedValues(sourceSelect);
    const selectedCats = getSelectedValues(categorySelect);

    let filtered = allArticles.filter(article => !hiddenSources.includes(article.source));

    if (selectedSources.length > 0) filtered = filtered.filter(a => selectedSources.includes(a.source));
    if (selectedCats.length > 0) filtered = filtered.filter(a => a.category && selectedCats.includes(a.category.toLowerCase()));

    if (keyword) {
        filtered = filtered.filter(a =>
            (a.titre && a.titre.toLowerCase().includes(keyword)) ||
            (a.description && a.description.toLowerCase().includes(keyword))
        );
    }
    renderArticles(filtered);
}

// --- CORE LOADING ---

async function loadNews() {
    loadingIndicator.classList.remove('hidden');
    articlesContainer.innerHTML = '';
    const selectedLang = languageSelect ? languageSelect.value : 'fr';

    try {
        const res = await fetch(`/api/news?lang=${selectedLang}`);
        const data = await res.json();
        if (data.success) {
            allArticles = data.articles;
            populateSourceSelect(allArticles);
            populateCategorySelect(allArticles);
            renderFilteredArticles();
        }
    } catch(err) {
        console.error("Erreur API:", err);
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}
function handleLanguageChange() {
    const newLang = languageSelect.value;
    localStorage.setItem('flowlyLang', newLang);

    // RESET DES FILTRES (Indispensable pour pas avoir de mélange)
    if (sourceSelect) sourceSelect.innerHTML = '<option value="">Chargement...</option>';
    if (categorySelect) categorySelect.value = '';

    articlesContainer.innerHTML = ''; // Vide l'écran pour le nouveau flux
    loadNews();
}
// --- EVENT HANDLERS ---

async function handleSummarizeClick(target) {
    const card = target.closest('[data-article-id]');
    const text = card.getAttribute('data-full-description');
    const output = card.querySelector('.summary-output');

    output.classList.remove('hidden');
    output.textContent = "Génération du résumé...";

    try {
        const res = await fetch('/api/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        const data = await res.json();
        output.textContent = data.success ? data.summary : "Erreur de résumé.";
    } catch (e) { output.textContent = "Serveur indisponible."; }
}

function handleHideSource(target) {
    const sourceName = target.previousElementSibling.getAttribute('data-source-name');
    let hidden = getHiddenSources();
    if (!hidden.includes(sourceName)) {
        hidden.push(sourceName);
        localStorage.setItem('hiddenSources', JSON.stringify(hidden));
        renderFilteredArticles();
    }
}

// --- INITIALISATION ---

languageSelect.addEventListener('change', () => {
    localStorage.setItem('flowlyLang', languageSelect.value);
    if(sourceSelect) sourceSelect.value = '';
    if(categorySelect) categorySelect.value = '';
    loadNews();
});

if (sourceSelect) sourceSelect.addEventListener('change', renderFilteredArticles);
if (categorySelect) categorySelect.addEventListener('change', renderFilteredArticles);
filterButton.addEventListener('click', renderFilteredArticles);
articlesContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('summarize-btn')) handleSummarizeClick(e.target);
    if (e.target.classList.contains('hide-source-btn')) handleHideSource(e.target);
    if (e.target.classList.contains('article-link')) {
        const id = e.target.closest('[data-article-id]').getAttribute('data-article-id');
        let history = getReadHistory();
        if(!history.includes(id)) {
            history.push(id);
            localStorage.setItem('readHistory', JSON.stringify(history));
            e.target.closest('[data-article-id]').classList.add('opacity-60');
        }
    }
});

darkModeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Restaurer thème et langue au démarrage
if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');
languageSelect.value = localStorage.getItem('flowlyLang') || 'fr';

window.onload = loadNews;