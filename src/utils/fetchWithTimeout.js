const fetch = require('node-fetch');

async function fetchWithTimeout(url, ms = 9000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);

    try {
        return await fetch(url, { signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

module.exports = { fetchWithTimeout };
