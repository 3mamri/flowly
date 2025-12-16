const articlesContainer = document.getElementById('articles-container');
const keywordInput = document.getElementById('keyword-input');
const filterButton = document.getElementById('filter-button');
const loadingIndicator = document.getElementById('loading-indicator');
const sourceSelect = document.getElementById('source-select');
const languageSelect = document.getElementById('language-select');

let allArticles = [];
let currentCategory = '';

// --- FONCTIONS DE BASE ---
async function loadNews() {
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');
    const lang = localStorage.getItem('flowlyLang') || 'fr';

    try {
        const res = await fetch(`/api/news?lang=${lang}`);
        const data = await res.json();
        if (data.success) {
            allArticles = data.articles;
            populateSourceSelect(allArticles);
            renderFilteredArticles();
        }
    } catch(err) {
        console.error("Erreur API:", err);
    } finally {
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
    }
}

function renderArticles(articles) {
    if (!articlesContainer) return;
    articlesContainer.innerHTML = articles.length ? '' : '<p class="no-results">Aucun article trouvé.</p>';
    articles.forEach(article => {
        articlesContainer.insertAdjacentHTML('beforeend', `
            <div class="article-card">
                ${article.urlToImage ? `<img src="${article.urlToImage}" class="article-img">` : ''}
                <div class="article-meta">
                    <span class="source-tag">${article.source}</span>
                </div>
                <h3><a href="${article.lien}" target="_blank" class="article-link">${article.titre}</a></h3>
                <p class="article-desc">${article.description || ''}</p>
            </div>
        `);
    });
}

function populateSourceSelect(articles) {
    if (!sourceSelect) return;
    const sources = [...new Set(articles.map(a => a.source))].sort();
    sourceSelect.innerHTML = '<option value="">Toutes les sources</option>';
    sources.forEach(src => {
        sourceSelect.insertAdjacentHTML('beforeend', `<option value="${src}">${src}</option>`);
    });
}

function renderFilteredArticles() {
    const keyword = keywordInput.value.toLowerCase().trim();
    const source = sourceSelect.value;
    let filtered = allArticles;

    if (currentCategory) filtered = filtered.filter(a => a.category === currentCategory);
    if (source) filtered = filtered.filter(a => a.source === source);
    if (keyword) filtered = filtered.filter(a => a.titre.toLowerCase().includes(keyword));

    renderArticles(filtered);
}

// --- FONCTIONS GLOBALES ---
window.setLanguage = function(lang) {
    localStorage.setItem('flowlyLang', lang);
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-lang') === lang));
    loadNews();
};

window.filterCategory = function(cat) {
    currentCategory = (cat === 'Actualités') ? '' : cat;
    renderFilteredArticles();
};

// --- EVENTS ---
if (filterButton) filterButton.addEventListener('click', renderFilteredArticles);
if (sourceSelect) sourceSelect.addEventListener('change', renderFilteredArticles);
window.onload = loadNews;