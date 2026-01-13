document.addEventListener("DOMContentLoaded", () => {
    // 1. Gestion du thème au chargement
    if(localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
    }
    document.body.classList.add('ready');

    // 2. Initialisation de la Date (Optionnel mais recommandé pour le design)
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = new Date().toLocaleDateString('fr-FR', options).toUpperCase();
    }
});

// --- TOGGLE DARK MODE ---
document.getElementById('dark-mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// --- GESTION VISUELLE DE LA NAVIGATION ---
// Cette partie s'assure que si tu cliques sur une catégorie, elle change de style
document.querySelectorAll('.compact-nav span').forEach(link => {
    link.addEventListener('click', function() {
        // Retire la classe active de tous les liens
        document.querySelectorAll('.compact-nav span').forEach(s => s.classList.remove('active'));
        // Ajoute la classe active au lien cliqué
        this.classList.add('active');

        // Appelle la fonction de filtrage définie dans fetchNews.js
        if (typeof window.filterCategory === 'function') {
            window.filterCategory(this.innerText);
        }
    });
});