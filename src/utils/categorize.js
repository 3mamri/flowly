// src/utils/categorize.js

function detectCategory(title = '', description = '', lang = 'fr') {
    const text = `${title} ${description}`.toLowerCase();

    const scores = {
        politics: 0,
        sports: 0,
        economy: 0,
        technology: 0,
        culture: 0,
        general: 0
    };

    // =========================
    // SPORTS (PRIORITÉ FORTE)
    // =========================
    const sportsRegex = /\b(football|foot|soccer|match|score|goal|but|ligue|league|championship|psg|om|nba|nhl|nfl|mlb|f1|formula 1|tennis|rugby|stade|stadium|ballon|olympic|olympics|jo)\b/;
    if (sportsRegex.test(text)) scores.sports += 5;

    // =========================
    // POLITICS
    // =========================
    const politicsRegex = /\b(élection|election|gouvernement|government|ministre|minister|président|president|elysée|parlement|parliament|assemblée|senate|sénat|député|vote|voting|réforme|reform|loi|law|bill|policy|politics|parti|party)\b/;
    if (politicsRegex.test(text)) scores.politics += 4;

    // =========================
    // ECONOMY
    // =========================
    const economyRegex = /\b(économie|economy|economic|bourse|stock|stocks|market|markets|inflation|pib|gdp|croissance|growth|entreprise|company|companies|finance|financial|banque|bank|interest rate|rates|emploi|jobs|employment|salaire|wage|wages|budget|deficit|debt)\b/;
    if (economyRegex.test(text)) scores.economy += 4;

    // =========================
    // TECHNOLOGY
    // =========================
    const techRegex = /\b(ia|ai\b|artificial intelligence|tech|technology|google|apple|iphone|microsoft|openai|nasa|space|spacex|science|robot|chips|semiconductor)\b/;
    if (techRegex.test(text)) scores.technology += 4;

    // =========================
    // CULTURE
    // =========================
    const cultureRegex = /\b(cinéma|cinema|movie|film|série|series|festival|music|musique|concert|album|art|exposition|museum|book|livre|author|culture|theatre|theater)\b/;
    if (cultureRegex.test(text)) scores.culture += 3;

    // =========================
    // ANTI-POLLUTION (RÈGLES)
    // =========================

    // Si sport fort → jamais politique
    if (scores.sports >= 5) {
        scores.politics = 0;
        scores.economy = 0;
    }

    // Si tech fort → pas culture
    if (scores.technology >= 4) {
        scores.culture = Math.max(0, scores.culture - 2);
    }

    // =========================
    // RESULT
    // =========================

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [bestCategory, bestScore] = sorted[0];

    return bestScore > 0 ? bestCategory : 'general';
}

module.exports = { detectCategory };