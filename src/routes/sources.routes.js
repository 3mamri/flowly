const express = require('express');
const { getSources } = require('../services/sources.service');

const router = express.Router();

const ALLOWED_LANGS = ['fr', 'en', 'all'];
const ALLOWED_CATEGORIES = [
    'general',
    'politics',
    'economy',
    'sports',
    'culture',
    'technology'
];

/**
 * GET /api/sources
 * Query:
 *  - lang=fr|en|all
 *  - category=general|politics|economy|sports|culture|technology
 */
router.get('/', async (req, res, next) => {
    try {
        let lang = req.query.lang || 'fr';
        if (!ALLOWED_LANGS.includes(lang)) {
            lang = 'fr';
        }

        let category = req.query.category || 'general';
        if (!ALLOWED_CATEGORIES.includes(category)) {
            return res.status(400).json({
                success: false,
                error: `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}`
            });
        }

        const sources = await getSources({ lang, category });

        return res.json({
            success: true,
            meta: {
                lang,
                category,
                count: sources.length
            },
            sources
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;