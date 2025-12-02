document.addEventListener("DOMContentLoaded", () => {
    if(localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
    }
    document.body.classList.add('ready');
});

// Toggle Dark Mode
document.getElementById('dark-mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    if(document.body.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});
