const express = require('express');
const { getSources } = require('../services/sources.service');

const router = express.Router();

/**
 * GET /api/sources
 * Query:
 *  - lang=fr|en
 */
router.get('/', async (req, res, next) => {
    try {
        const lang = req.query.lang === 'en' ? 'en' : 'fr';

        const sources = await getSources({ lang });

        res.json({
            success: true,
            meta: { lang, count: sources.length },
            sources,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
