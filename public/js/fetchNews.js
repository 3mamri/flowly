const articlesContainer = document.getElementById('articles-container');
const keywordInput = document.getElementById('keyword-input');
const filterButton = document.getElementById('filter-button');
const clearButton = document.getElementById('clear-button');
const loadingIndicator = document.getElementById('loading-indicator');
const noResultsIndicator = document.getElementById('no-results');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const languageSelect = document.getElementById('language-select'); // Le nouveau sélecteur

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

// --- RENDERING & MARKUP ---

function createArticleHtml(article) {
    const readHistory = getReadHistory();
    const articleId = article.lien;
    const isRead = readHistory.includes(articleId);
    const sourceName = article.source || 'Inconnue';

    return `
    <div class="p-5 bg-white shadow-lg hover:shadow-xl transition rounded-xl border-l-4 border-blue-500 ${isRead ? 'article-read' : ''}" data-article-id="${articleId}" data-full-description="${article.description}">
        ${article.urlToImage ? `<img src="${article.urlToImage}" alt="Image article" class="w-full h-40 object-cover rounded-lg mb-3">` : ''}
        <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-semibold uppercase text-gray-500" data-source-name="${sourceName}">${sourceName}</span>
            <button class="hide-source-btn text-red-500 hover:text-red-700 text-xs font-bold" title="Masquer toutes les nouvelles de cette source">
                [Masquer]
            </button>
            ${article.category ? `<span class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-xl">${article.category}</span>` : ''}
            ${article.publishedAt ? `<span class="text-gray-400 text-xs">${timeAgo(article.publishedAt)}</span>` : ''}
        </div>
        <h3 class="text-xl font-bold text-gray-900 mt-1 mb-2">
            <a href="${article.lien}" target="_blank" rel="noopener noreferrer" class="article-link text-blue-600 hover:underline">
                ${article.titre}
            </a>
        </h3>
        <p class="text-gray-700">${article.description || 'Description non disponible.'}</p>
        
        <button class="summarize-btn mt-3 px-3 py-1 text-xs font-medium text-white bg-green-500 rounded-md hover:bg-green-600 transition">
            Résumer (IA)
        </button>
        <p class="summary-output mt-2 text-sm italic text-green-700 hidden"></p>
        
    </div>
    `;
}

function renderArticles(articles) {
    articlesContainer.innerHTML = '';
    if (!articles.length) {
        if (noResultsIndicator) noResultsIndicator.classList.remove('hidden');
        return;
    }
    if (noResultsIndicator) noResultsIndicator.classList.add('hidden');
    articles.forEach(article => articlesContainer.insertAdjacentHTML('beforeend', createArticleHtml(article)));
}

// --- CORE LOGIC ---

function renderFilteredArticles() {
    const keyword = keywordInput.value.toLowerCase().trim();
    const hiddenSources = getHiddenSources();

    // 1. Filtrer les articles masqués
    let filtered = allArticles.filter(article =>
        !hiddenSources.includes(article.source)
    );

    // 2. Filtrer par mot-clé
    if (keyword) {
        filtered = filtered.filter(a =>
            (a.titre && a.titre.toLowerCase().includes(keyword)) ||
            (a.description && a.description.toLowerCase().includes(keyword))
        );
    }

    renderArticles(filtered);
}

// *** FONCTION DE CHARGEMENT CORRIGÉE ***
async function loadNews() {
    loadingIndicator.classList.remove('hidden');

    // CORRECTION : Lire la langue sélectionnée pour l'envoyer au serveur
    const selectedLang = languageSelect ? languageSelect.value : 'fr';

    try {
        // Envoi du paramètre 'lang' au backend
        const res = await fetch(`/api/news?lang=${selectedLang}`);
        const data = await res.json();

        if (data.success) {
            allArticles = data.articles;
            renderFilteredArticles();
        } else {
            console.error("Échec de la récupération des articles:", data.message || "Erreur inconnue");
        }
    } catch(err) {
        console.error("Erreur lors de l'appel API:", err);
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}


// --- EVENT HANDLERS ---

function handleArticleClick(event) {
    const link = event.target.closest('.article-link');
    if (!link) return;
    const articleId = link.href;
    const articleCard = link.closest('[data-article-id]');

    let history = getReadHistory();

    if (!history.includes(articleId)) {
        history.push(articleId);
        localStorage.setItem('readHistory', JSON.stringify(history));
    }

    if (articleCard) {
        articleCard.classList.add('article-read');
    }
}

function handleHideSourceClick(event) {
    const hideButton = event.target.closest('.hide-source-btn');
    if (!hideButton) return;

    const sourceElement = hideButton.previousElementSibling;
    const sourceToHide = sourceElement ? sourceElement.getAttribute('data-source-name') : null;

    if (sourceToHide) {
        let hiddenSources = getHiddenSources();

        if (!hiddenSources.includes(sourceToHide)) {
            hiddenSources.push(sourceToHide);
            localStorage.setItem('hiddenSources', JSON.stringify(hiddenSources));

            renderFilteredArticles();
        }
    }
}

async function handleSummarizeClick(event) {
    const summarizeButton = event.target.closest('.summarize-btn');
    if (!summarizeButton) return;

    const articleCard = summarizeButton.closest('[data-article-id]');
    const fullDescription = articleCard ? articleCard.getAttribute('data-full-description') : null;
    const outputElement = articleCard ? articleCard.querySelector('.summary-output') : null;

    if (!fullDescription || !outputElement) return;

    outputElement.classList.remove('hidden');
    outputElement.textContent = "Génération du résumé par l'IA en cours...";
    summarizeButton.disabled = true;

    try {
        const res = await fetch('/api/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: fullDescription })
        });
        const data = await res.json();

        if (data.success) {
            outputElement.textContent = `Résumé : ${data.summary}`;
        } else {
            outputElement.textContent = `Erreur: ${data.message || 'Échec de la connexion au service de résumé.'}`;
        }
    } catch (error) {
        outputElement.textContent = "Erreur: Impossible de contacter le serveur de résumé.";
    } finally {
        summarizeButton.disabled = false;
    }
}

function handleDarkModeToggle() {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// *** NOUVELLE FONCTIONNALITÉ : GESTION DE LA LANGUE ***
function handleLanguageChange() {
    const newLang = languageSelect.value;
    // Sauvegarder la préférence dans le localStorage
    localStorage.setItem('flowlyLang', newLang);
    // Recharger les nouvelles immédiatement avec la nouvelle langue
    loadNews(); // <-- Ceci force le rechargement avec le nouveau paramètre 'lang'
}

// --- INITIALISATION ---

// 1. Initialisation de la langue au chargement
if (languageSelect) {
    const savedLang = localStorage.getItem('flowlyLang') || 'fr'; // 'fr' par défaut
    languageSelect.value = savedLang;
    // Écouteur pour le changement de langue
    languageSelect.addEventListener('change', handleLanguageChange);
}


// 2. Initialisation du Dark Mode
if (darkModeToggle) {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
        if (darkModeToggle.type === 'checkbox') darkModeToggle.checked = true;
    }
    darkModeToggle.addEventListener('click', handleDarkModeToggle);
}

// 3. Écouteurs pour les autres actions
filterButton.addEventListener('click', renderFilteredArticles);
clearButton.addEventListener('click', () => {
    keywordInput.value = '';
    renderFilteredArticles();
});
articlesContainer.addEventListener('click', handleArticleClick);
articlesContainer.addEventListener('click', handleHideSourceClick);
articlesContainer.addEventListener('click', handleSummarizeClick);


window.onload = loadNews; // Charge les articles (maintenant avec la bonne langue)