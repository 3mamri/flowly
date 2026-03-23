// public/js/ui.js

function setLoading(loadingIndicatorEl, isLoading) {
    if (!loadingIndicatorEl) return;
    loadingIndicatorEl.classList.toggle('hidden', !isLoading);
}

function showMessage(messageEl, show, text) {
    if (!messageEl) return;
    messageEl.classList.toggle('hidden', !show);

    if (show && typeof text === 'string') {
        messageEl.textContent = text;
    }
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


/* ---------------- SOURCES LIST ---------------- */

function renderSourcesList(sourcesListEl, sources) {
    if (!sourcesListEl) return;
    sourcesListEl.textContent = '';

    if (!Array.isArray(sources) || sources.length === 0) {
        sourcesListEl.innerHTML = '<div class="sources-empty">Aucune source disponible.</div>';
        return;
    }

    const frag = document.createDocumentFragment();

    sources.forEach(s => {
        const span = document.createElement('span');
        span.className = 'source-pill';
        span.textContent = s.name || s.source;
        span.style.cursor = 'pointer'; // On montre que c'est cliquable

        // Quand on clique sur une bulle de source
        span.addEventListener('click', () => {
            // 1. On met à jour le menu déroulant (pour que tout soit synchro)
            const select = document.getElementById('source-select');
            if (select) {
                select.value = s.name || s.source;
                // 2. On déclenche manuellement l'événement de changement
                select.dispatchEvent(new Event('change'));
            }

            // 3. Effet visuel : on met la bulle en évidence
            document.querySelectorAll('.source-pill').forEach(p => p.classList.remove('active-pill'));
            span.classList.add('active-pill');
        });

        frag.appendChild(span);
    });

    sourcesListEl.appendChild(frag);
}
/* ---------------- SOURCE SELECT ---------------- */

function populateSourceSelect(selectEl, sources, selectedValue = '') {

    if (!selectEl) return;

    selectEl.innerHTML = '';

    const base = document.createElement('option');
    base.value = '';
    base.textContent = 'Toutes les sources';

    selectEl.appendChild(base);

    const names = [...new Set(
        (sources || [])
            .map(s => s.name || s.source)
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));


    for (const n of names) {

        const opt = document.createElement('option');

        opt.value = n;
        opt.textContent = n;

        selectEl.appendChild(opt);
    }

    selectEl.value = names.includes(selectedValue) ? selectedValue : '';
}


/* ---------------- ARTICLES ---------------- */

function renderArticles(containerEl, articles, noResultsEl) {

    if (!containerEl) return;

    containerEl.textContent = '';

    if (!Array.isArray(articles) || articles.length === 0) {

        showMessage(noResultsEl, true, 'Aucun résultat.');

        return;
    }

    showMessage(noResultsEl, false);

    const favorites =
        JSON.parse(localStorage.getItem('flowlyFavorites')) || [];

    const frag = document.createDocumentFragment();


    for (const a of articles) {

        const card = document.createElement('div');
        card.className = 'article-card';


        /* IMAGE */
        if (a.urlToImage) {
            const img = document.createElement('img');
            img.className = 'article-img';
            img.loading = 'lazy';
            img.src = a.urlToImage;

            // FIX SÉCURISÉ : On ne supprime que si le parent existe encore
            img.onerror = () => {
                if (img && img.parentNode) {
                    img.parentNode.removeChild(img);
                }
            };

            card.appendChild(img);
        }
        /* META */

        const meta = document.createElement('div');
        meta.className = 'article-meta';


        const sourceTag = document.createElement('span');

        sourceTag.className = 'source-tag';
        sourceTag.textContent = a.source || 'Source';

        meta.appendChild(sourceTag);


        /* FAVORI */

        const isFav = favorites.some(f => f.lien === a.lien);

        const favBtn = document.createElement('button');

        favBtn.className = `fav-indicator ${isFav ? 'active' : ''}`;
        favBtn.innerHTML = isFav ? '★' : '☆';

        favBtn.title = 'Sauvegarder';


        favBtn.addEventListener('click', (e) => {

            e.preventDefault();
            e.stopPropagation(); // empêche l'ouverture de l'article

            if (window.toggleFavorite) {
                window.toggleFavorite(a.lien);
            }
        });

        meta.appendChild(favBtn);

        card.appendChild(meta);


        /* TITRE */

        const h3 = document.createElement('h3');

        const link = document.createElement('a');

        link.className = 'article-link';
        link.href = safeUrl(a.lien);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        link.textContent = a.titre || 'Sans titre';

        h3.appendChild(link);

        card.appendChild(h3);


        /* DESCRIPTION */

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


/* ---------------- ACTIVE BUTTONS ---------------- */

function setActiveButtons(selector, activeValue, attrName) {

    document.querySelectorAll(selector).forEach(btn => {

        const v = btn.getAttribute(attrName) || btn.textContent.trim();

        const isActualites =
            v === 'Actualités' && activeValue === '';

        btn.classList.toggle(
            'active',
            v === activeValue || isActualites
        );
    });
}


/* ---------------- EXPORT GLOBAL ---------------- */

window.FlowlyUI = {

    setLoading,
    showMessage,
    renderSourcesList,
    populateSourceSelect,
    renderArticles,
    setActiveButtons

};
function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}