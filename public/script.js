// public/script.js

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    /* =========================
       THEME
    ========================= */
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark');
    }

    const toggleBtn = document.getElementById('dark-mode-toggle');

    toggleBtn?.addEventListener('click', () => {
        body.classList.toggle('dark');

        localStorage.setItem(
            'theme',
            body.classList.contains('dark') ? 'dark' : 'light'
        );
    });

    /* =========================
       DATE
    ========================= */
    function updateDate() {
        const dateEl = document.getElementById('current-date');
        if (!dateEl) return;

        const lang = localStorage.getItem('flowlyLang') === 'en' ? 'en' : 'fr';
        const locale = lang === 'en' ? 'en-US' : 'fr-FR';

        dateEl.textContent = new Date()
            .toLocaleDateString(locale, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
            .toUpperCase();
    }

    updateDate();

    /* =========================
       LANGUAGE SWITCH
    ========================= */
    document.querySelectorAll('.lang-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            if (!lang) return;

            localStorage.setItem('flowlyLang', lang);
            updateDate();

            if (typeof window.refetchAll === 'function') {
                window.refetchAll();
            }
        });
    });
});