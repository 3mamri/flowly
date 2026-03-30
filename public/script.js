document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const themeToggleButton = document.getElementById('dark-mode-toggle');

    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark');
        } else {
            body.classList.remove('dark');
        }

        localStorage.setItem('theme', theme);
    }

    function getSavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'light' ? 'light' : 'dark';
    }

    applyTheme(getSavedTheme());

    themeToggleButton?.addEventListener('click', () => {
        const nextTheme = body.classList.contains('dark') ? 'light' : 'dark';
        applyTheme(nextTheme);
    });

    function updateDate() {
        const dateEl = document.getElementById('current-date');
        if (!dateEl) return;

        const lang = localStorage.getItem('flowlyLang') === 'en' ? 'en' : 'fr';
        const locale = lang === 'en' ? 'en-US' : 'fr-FR';

        dateEl.textContent = new Date().toLocaleDateString(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).toUpperCase();
    }

    updateDate();

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