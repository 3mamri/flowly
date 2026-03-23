const express = require('express');
const { getNews } = require('../services/news.service');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        // 1. On récupère les paramètres de la requête (URL)
        const lang = req.query.lang === 'en' ? 'en' : 'fr';

        // ICI : On récupère la catégorie envoyée par le Front-end (ex: business, sports)
        const category = req.query.category || '';

        const page = Math.min(Math.max(parseInt(req.query.page, 10) || 1, 1), 20);
        const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || 60, 10), 100);

        // 2. ON TRANSMET LA CATÉGORIE AU SERVICE (C'est ce qui manquait !)
        const articles = await getNews({
            lang,
            category,
            page,
            pageSize
        });

        res.json({ success: true, articles });
    } catch (err) {
        console.error("Route Error:", err);
        res.status(500).json({ success: false, articles: [] });
    }
});

module.exports = router;