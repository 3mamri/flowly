const express = require('express');
const { getNews } = require('../services/news.service');

const router = express.Router();

/**
 * GET /api/news
 * Query:
 *  - lang=fr|en
 *  - category=Politique|Économie|Sports|Culture (optionnel)
 *  - page=1..20
 *  - pageSize=10..100
 */
router.get('/', async (req, res, next) => {
    try {
        const lang = req.query.lang === 'en' ? 'en' : 'fr';
        const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';

        const page = Math.min(Math.max(parseInt(req.query.page, 10) || 1, 1), 20);
        const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || 60, 10), 100);

        const articles = await getNews({ lang, category, page, pageSize });

        res.json({
            success: true,
            meta: { lang, category: category || 'all', page, pageSize, count: articles.length },
            articles,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
