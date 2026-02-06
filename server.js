require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const newsRoutes = require('./src/routes/news.routes');
const sourcesRoutes = require('./src/routes/sources.routes');

const app = express();
const port = Number(process.env.PORT) || 3000;

// Petit bonus sécurité
app.disable('x-powered-by');

// Sécurité basique (projet scolaire)
app.use(helmet());

// Limite anti-spam (évite spam API)
app.use(rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
}));

app.use(express.json({ limit: '250kb' }));

// Front statique
app.use(express.static('public', { maxAge: '1h' }));

// Healthcheck
app.get('/health', (req, res) => res.json({ ok: true }));

// API
app.use('/api/news', newsRoutes);
app.use('/api/sources', sourcesRoutes);

// 404 JSON propre
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Not Found' });
});

// Error handler minimal (évite des crashs silencieux)
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
});

app.listen(port, () => {
    console.log(`🗞️ Flowly lancé → http://localhost:${port}`);
});
