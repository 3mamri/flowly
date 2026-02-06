// public/js/ui.js
// Petit module UI : rendu DOM uniquement (pas de fetch, pas de logique métier)

function setLoading(loadingIndicatorEl, isLoading) {
    if (!loadingIndicatorEl) return;
    loadingIndicatorEl.classList.toggle('hidden', !isLoading);
}

function showMessage(messageEl, show, text) {
    if (!messageEl) return;
    messageEl.classList.toggle('hidden', !show);
    if (show && typeof text === 'string') messageEl.textContent = text;
}

function safeUrl(url) {
    try {
        if (!url) return '#';
        new URL(url);
        return url;
    } catch {
        return '#';
    }
}

function renderSourcesList(sourcesListEl, sources) {
    if (!sourcesListEl) return;
    sourcesListEl.textContent = '';

    if (!Array.isArray(sources) || sources.length === 0) {
        const div = document.createElement('div');
        div.className = 'sources-empty';
        div.textContent = 'Aucune source trouvée.';
        sourcesListEl.appendChild(div);
        return;
    }

    const frag = document.createDocumentFragment();

    for (const s of sources) {
        const a = document.createElement('a');
        a.className = 'source-pill';
        a.textContent = s.name || 'Source';
        a.href = safeUrl(s.url || s.origin);
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        frag.appendChild(a);
    }

    sourcesListEl.appendChild(frag);
}

function populateSourceSelect(selectEl, sources, selectedValue = '') {
    if (!selectEl) return;

    selectEl.innerHTML = '';
    const base = document.createElement('option');
    base.value = '';
    base.textContent = 'Toutes les sources';
    selectEl.appendChild(base);

    const names = [...new Set((sources || []).map(s => s.name).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));

    if (!names.length) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'Aucune source trouvée';
        selectEl.appendChild(opt);
        return;
    }

    for (const n of names) {
        const opt = document.createElement('option');
        opt.value = n;
        opt.textContent = n;
        selectEl.appendChild(opt);
    }

    if (selectedValue && names.includes(selectedValue)) {
        selectEl.value = selectedValue;
    } else {
        selectEl.value = '';
    }
}

function renderArticles(containerEl, articles, noResultsEl) {
    if (!containerEl) return;
    containerEl.textContent = '';

    if (!Array.isArray(articles) || articles.length === 0) {
        showMessage(noResultsEl, true, 'Aucun résultat.');
        return;
    }

    showMessage(noResultsEl, false);

    const frag = document.createDocumentFragment();

    for (const a of articles) {
        const card = document.createElement('div');
        card.className = 'article-card';

        if (a.urlToImage) {
            const img = document.createElement('img');
            img.className = 'article-img';
            img.loading = 'lazy';
            img.referrerPolicy = 'no-referrer';
            img.alt = 'Illustration';
            img.src = a.urlToImage;
            img.onerror = () => img.remove();
            card.appendChild(img);
        }

        const meta = document.createElement('div');
        meta.className = 'article-meta';

        const sourceLink = document.createElement('a');
        sourceLink.className = 'source-tag';
        sourceLink.href = safeUrl(a.sourceUrl || a.lien);
        sourceLink.target = '_blank';
        sourceLink.rel = 'noopener noreferrer';
        sourceLink.textContent = a.source || 'Source';
        meta.appendChild(sourceLink);

        const cat = document.createElement('span');
        cat.className = 'category-tag';
        cat.textContent = a.category || 'Actualités';
        meta.appendChild(cat);

        card.appendChild(meta);

        const h3 = document.createElement('h3');
        const link = document.createElement('a');
        link.className = 'article-link';
        link.href = safeUrl(a.lien);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = a.titre || 'Sans titre';
        h3.appendChild(link);
        card.appendChild(h3);

        if (a.description) {
            const p = document.createElement('p');
            p.className = 'article-desc';
            p.textContent = a.description;
            card.appendChild(p);
        }

        frag.appendChild(card);
    }

    containerEl.appendChild(frag);
}

function setActiveButtons(selector, activeValue, attrName) {
    document.querySelectorAll(selector).forEach(btn => {
        const v = btn.getAttribute(attrName) || '';
        btn.classList.toggle('active', v === activeValue);
    });
}

// Expose en global (simple, scolaire)
window.FlowlyUI = {
    setLoading,
    showMessage,
    renderSourcesList,
    populateSourceSelect,
    renderArticles,
    setActiveButtons,
};
