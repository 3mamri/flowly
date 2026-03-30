const fetch = require('node-fetch');

class FetchTimeoutError extends Error {
    constructor(message) {
        super(message);
        this.name = 'FetchTimeoutError';
        this.statusCode = 504;
    }
}

class FetchRequestError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.name = 'FetchRequestError';
        this.statusCode = statusCode;
    }
}

async function fetchWithTimeout(url, ms = 9000, options = {}) {
    if (!url || typeof url !== 'string') {
        throw new FetchRequestError('Invalid URL provided to fetchWithTimeout', 400);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);

    const defaultHeaders = {
        Accept: 'application/json, text/plain, */*, application/rss+xml, application/xml, text/xml',
        'User-Agent': 'Flowly/1.0 (+https://flowly.local)'
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...(options.headers || {})
            },
            signal: controller.signal
        });

        return response;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new FetchTimeoutError(`Request timed out after ${ms}ms: ${url}`);
        }

        throw new FetchRequestError(
            `Fetch failed for ${url}: ${error.message}`,
            error.statusCode || 500
        );
    } finally {
        clearTimeout(timer);
    }
}

module.exports = {
    fetchWithTimeout,
    FetchTimeoutError,
    FetchRequestError
};