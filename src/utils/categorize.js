function detectCategory(title = '', description = '') {
    const text = `${title} ${description}`.toLowerCase();

    const scores = { Sports: 0, Politique: 0, Économie: 0, Culture: 0 };

    // ⚽ SPORTS (FR + EN)
    if (/\b(football|foot|soccer|match|score|goal|but|ligue|league|championship|psg|om|nba|nhl|nfl|mlb|f1|formula 1|tennis|rugby|stade|stadium|ballon|olympic|olympics|jo)\b/.test(text)) {
        scores.Sports += 3;
    }

    // 🏛️ POLITIQUE (FR + EN)
    if (/\b(élection|election|gouvernement|government|ministre|minister|président|president|elysée|parlement|parliament|assemblée|senate|sénat|député|mp\b|vote|voting|réforme|reform|loi|law|bill\b|policy|politics|parti|party)\b/.test(text)) {
        scores.Politique += 3;
    }

    // 💰 ÉCONOMIE (FR + EN)
    if (/\b(économie|economy|economic|bourse|stock|stocks|market|markets|inflation|pib|gdp|croissance|growth|entreprise|company|companies|finance|financial|banque|bank|interest rate|rates|emploi|jobs|employment|salaire|wage|wages|budget|deficit|debt)\b/.test(text)) {
        scores.Économie += 3;
    }

    // 🎭 CULTURE / TECH (FR + EN)
    if (/\b(cinéma|cinema|movie|film|série|series|festival|music|musique|concert|album|art|exposition|museum|book|livre|author|culture|theatre|theater)\b/.test(text)) {
        scores.Culture += 3;
    }
    if (/\b(ia|ai\b|artificial intelligence|tech|technology|google|apple|iphone|microsoft|openai|nasa|space|spacex|science|robot|chips|semiconductor)\b/.test(text)) {
        scores.Culture += 2;
    }

    // Choix meilleur score
    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return !best || best[1] === 0 ? 'Actualités' : best[0];
}

module.exports = { detectCategory };
