function dedupeByUrl(articles) {
    const seen = new Set();
    const out = [];

    for (const a of articles) {
        const key = a.lien ? `u:${a.lien}` : `t:${a.titre}|s:${a.source}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(a);
    }

    return out;
}

function dedupeSources(sources) {
    const map = new Map();
    for (const s of sources) {
        const key = s.origin || s.url || s.name;
        if (!key) continue;
        if (!map.has(key)) map.set(key, s);
    }
    return [...map.values()];
}

module.exports = { dedupeByUrl, dedupeSources };
