function setLoading(loadingIndicatorEl, isLoading) {
    if (!loadingIndicatorEl) return;
    loadingIndicatorEl.classList.toggle('hidden', !isLoading);
}

function showMessage(messageEl, show, text = '') {
    if (!messageEl) return;
    messageEl.classList.toggle('hidden', !show);
    if (show) {
        messageEl.textContent = text || 'Aucun résultat.';
    }
}

function safeUrl(url) {
    try {
        if (!url) return '#';
        return new URL(url).toString();
    } catch {
        return '#';
    }
}

function formatDate(value, lang = 'fr') {
    try {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';

        return new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'fr-FR', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(date);
    } catch {
        return '';
    }
}

function getCategoryLabel(category, lang = 'fr') {
    const labels = {
        general: { fr: 'Actualités', en: 'News' },
        politics: { fr: 'Politique', en: 'Politics' },
        economy: { fr: 'Économie', en: 'Economy' },
        sports: { fr: 'Sports', en: 'Sports' },
        culture: { fr: 'Culture', en: 'Culture' },
        technology: { fr: 'Technologie', en: 'Technology' }
    };

    const entry = labels[category] || labels.general;
    return lang === 'en' ? entry.en : entry.fr;
}

function uniqueSourceNames(sources = []) {
    const map = new Map();

    for (const source of sources) {
        const rawName = String(source?.name || '').trim();
        if (!rawName) continue;

        const key = rawName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        if (!map.has(key)) {
            map.set(key, rawName);
        }
    }

    return Array.from(map.values()).sort((a, b) =>
        a.localeCompare(b, 'fr', { sensitivity: 'base' })
    );
}

function renderSourcesList(sourcesListEl, sources = []) {
    if (!sourcesListEl) return;

    sourcesListEl.textContent = '';

    const names = uniqueSourceNames(sources);

    if (!names.length) {
        sourcesListEl.innerHTML = '<div class="sources-empty">Aucune source disponible.</div>';
        return;
    }

    const frag = document.createDocumentFragment();
    const select = document.getElementById('source-select');

    names.forEach((name) => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'source-pill';
        pill.textContent = name;

        pill.addEventListener('click', () => {
            if (select) {
                select.value = name;
                select.dispatchEvent(new Event('change'));
            }

            document.querySelectorAll('.source-pill').forEach((item) => {
                item.classList.remove('active-pill');
            });

            pill.classList.add('active-pill');
        });

        frag.appendChild(pill);
    });

    sourcesListEl.appendChild(frag);
}

function populateSourceSelect(selectEl, sources = [], selectedValue = '') {
    if (!selectEl) return;

    selectEl.innerHTML = '';

    const base = document.createElement('option');
    base.value = '';
    base.textContent = 'Toutes les sources';
    selectEl.appendChild(base);

    const names = uniqueSourceNames(sources);

    names.forEach((name) => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        selectEl.appendChild(option);
    });

    selectEl.value = names.includes(selectedValue) ? selectedValue : '';
}

function renderArticles(containerEl, articles = [], noResultsEl) {
    if (!containerEl) return;

    containerEl.textContent = '';

    if (!Array.isArray(articles) || articles.length === 0) {
        showMessage(noResultsEl, true, 'Aucun résultat.');
        return;
    }

    showMessage(noResultsEl, false);

    const favorites = JSON.parse(localStorage.getItem('flowlyFavorites')) || [];
    const frag = document.createDocumentFragment();

    for (const article of articles) {
        const card = document.createElement('article');
        card.className = 'article-card';

        const meta = document.createElement('div');
        meta.className = 'article-meta';

        const sourceTag = document.createElement('span');
        sourceTag.className = 'source-tag';
        sourceTag.textContent = article.source || 'Source';
        meta.appendChild(sourceTag);

        const categoryTag = document.createElement('span');
        categoryTag.className = 'category-tag';
        categoryTag.textContent = getCategoryLabel(article.primaryCategory, article.language);
        meta.appendChild(categoryTag);

        const isFav = favorites.some((fav) => fav.url === article.url);

        const favBtn = document.createElement('button');
        favBtn.className = `fav-indicator ${isFav ? 'active' : ''}`;
        favBtn.innerHTML = isFav ? '★' : '☆';
        favBtn.title = 'Sauvegarder';

        favBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.toggleFavorite) {
                window.toggleFavorite(article.url);
            }
        });

        meta.appendChild(favBtn);
        card.appendChild(meta);

        const h3 = document.createElement('h3');
        const link = document.createElement('a');
        link.className = 'article-link';
        link.href = safeUrl(article.url);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = article.title || 'Sans titre';
        h3.appendChild(link);
        card.appendChild(h3);

        if (article.description) {
            const p = document.createElement('p');
            p.className = 'article-desc';
            p.textContent = article.description;
            card.appendChild(p);
        }

        const footer = document.createElement('div');
        footer.className = 'article-footer';

        const dateEl = document.createElement('span');
        dateEl.className = 'article-date';
        dateEl.textContent = formatDate(article.publishedAt, article.language);

        const langEl = document.createElement('span');
        langEl.className = 'article-lang';
        langEl.textContent = (article.language || 'fr').toUpperCase();

        footer.appendChild(dateEl);
        footer.appendChild(langEl);

        card.appendChild(footer);
        frag.appendChild(card);
    }

    containerEl.appendChild(frag);
}

function setActiveButtons(selector, activeValue, attrName) {
    document.querySelectorAll(selector).forEach((btn) => {
        const value = btn.getAttribute(attrName) || '';
        btn.classList.toggle('active', value === activeValue);
    });
}

window.FlowlyUI = {
    setLoading,
    showMessage,
    renderSourcesList,
    populateSourceSelect,
    renderArticles,
    setActiveButtons
};