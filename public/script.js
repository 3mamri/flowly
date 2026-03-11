document.addEventListener('DOMContentLoaded', () => {

    const body = document.body;

    /* ---------------- THEME ---------------- */

    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        body.classList.add('dark');
    }



    /* ---------------- DATE ---------------- */

    function updateDate() {
        const dateEl = document.getElementById('current-date');
        if (!dateEl) return;

        // On récupère la langue actuelle stockée ou celle du navigateur
        const lang = localStorage.getItem('flowlyLang') || 'fr';
        const locale = lang === 'en' ? 'en-US' : 'fr-FR';

        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = new Date().toLocaleDateString(locale, options).toUpperCase();
    }

// Appelle updateDate() au chargement
    document.addEventListener('DOMContentLoaded', updateDate);



    /* ---------------- DARK MODE ---------------- */

    const toggleBtn = document.getElementById('dark-mode-toggle');

    if (toggleBtn) {

        toggleBtn.addEventListener('click', () => {

            body.classList.toggle('dark');

            const theme =
                body.classList.contains('dark') ? 'dark' : 'light';

            localStorage.setItem('theme', theme);
        });
    }



    /* ---------------- LANG SWITCH ---------------- */

    const langButtons = document.querySelectorAll('.lang-btn');

    langButtons.forEach(btn => {

        btn.addEventListener('click', () => {

            const lang = btn.getAttribute('data-lang');

            if (!lang) return;

            localStorage.setItem('flowlyLang', lang);

            updateDate();

            // recharge les news si fetchNews est chargé
            if (typeof window.refetchAll === 'function') {
                window.refetchAll();
            }
        });
    });

});