const express = require('express');
const { getNews } = require('../services/news.service');

const router = express.Router();

// Catégories universelles
const ALLOWED_CATEGORIES = [
    'general',
    'politics',
    'economy',
    'sports',
    'culture',
    'technology'
];

// Langues supportées
const ALLOWED_LANGS = ['fr', 'en', 'all'];

router.get('/', async (req, res, next) => {
    try {
        // ===== LANG =====
        let lang = req.query.lang || 'fr';
        if (!ALLOWED_LANGS.includes(lang)) {
            lang = 'fr';
        }

        // ===== CATEGORY =====
        let category = req.query.category || 'general';

        if (!ALLOWED_CATEGORIES.includes(category)) {
            return res.status(400).json({
                success: false,
                error: `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}`
            });
        }

        // ===== PAGINATION =====
        const page = Math.min(Math.max(parseInt(req.query.page, 10) || 1, 1), 20);
        const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || 60, 10), 100);

        // ===== CALL SERVICE =====
        const articles = await getNews({
            lang,
            category,
            page,
            pageSize
        });

        return res.json({
            success: true,
            meta: {
                lang,
                category,
                page,
                pageSize,
                count: articles.length
            },
            articles
        });

    } catch (err) {
        next(err); // Passe au error handler global (meilleure pratique)
    }
});

module.exports = router;