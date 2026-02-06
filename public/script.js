document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    // ---------------- THEME (chargement) ----------------
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') body.classList.add('dark');

    // ---------------- DATE ----------------
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const flowlyLang = localStorage.getItem('flowlyLang') === 'en' ? 'en' : 'fr';
        const locale = flowlyLang === 'en' ? 'en-GB' : 'fr-FR';
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = new Date().toLocaleDateString(locale, options).toUpperCase();
    }

    // ---------------- TOGGLE DARK MODE ----------------
    const toggleBtn = document.getElementById('dark-mode-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            body.classList.toggle('dark');
            localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
        });
    }
});
