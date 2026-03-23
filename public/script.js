document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    // --- THEME ---
    if (localStorage.getItem('theme') === 'dark') body.classList.add('dark');

    const toggleBtn = document.getElementById('dark-mode-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            body.classList.toggle('dark');
            localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
        });
    }

    // --- DATE ---
    function updateDate() {
        const dateEl = document.getElementById('current-date');
        if (!dateEl) return;

        const lang = localStorage.getItem('flowlyLang') || 'fr';
        const locale = lang === 'en' ? 'en-US' : 'fr-FR';
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = new Date().toLocaleDateString(locale, options).toUpperCase();
    }
    updateDate();

    // --- LANG SWITCH ---
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            if (!lang) return;

            localStorage.setItem('flowlyLang', lang); // stocker la langue
            updateDate(); // mettre à jour la date

            // relancer fetchNews si la fonction est définie
            if (typeof window.refetchAll === 'function') {
                console.log("🔄 Switch vers :", lang);
                window.refetchAll();
            } else {
                console.log("🔄 Switch vers (reload) :", lang);
                window.location.reload();
            }
        });
    });

    // --- NAV BUTTONS (.nav-cat) ---
    const navButtons = document.querySelectorAll('.nav-cat');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // retirer active de tous
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            console.log("🔄 Switch vers :", btn.dataset.cat);

            // filtrer les articles
            if (typeof window.filterArticles === 'function') {
                window.filterArticles(btn.dataset.cat);
            }
        });
    });
});