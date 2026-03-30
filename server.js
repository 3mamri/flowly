require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const newsRoutes = require('./src/routes/news.routes');
const sourcesRoutes = require('./src/routes/sources.routes');

const app = express();
const port = Number(process.env.PORT) || 3000;

function validateEnv() {
    const errors = [];

    if (process.env.PORT && Number.isNaN(Number(process.env.PORT))) {
        errors.push('PORT must be a valid number');
    }

    if (errors.length > 0) {
        console.error('Invalid environment configuration:');
        errors.forEach((error) => console.error(`- ${error}`));
        process.exit(1);
    }
}

validateEnv();

app.disable('x-powered-by');

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
);

app.use(express.json({ limit: '250kb' }));

app.use(
    express.static(path.join(__dirname, 'public'), {
        maxAge: '1h',
        extensions: ['html'],
    })
);

app.get('/health', (req, res) => {
    res.status(200).json({
        ok: true,
        service: 'flowly',
        timestamp: new Date().toISOString(),
    });
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many requests, please try again later.',
    },
});

app.use('/api', apiLimiter);

app.use('/api/news', newsRoutes);
app.use('/api/sources', sourcesRoutes);

app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API route not found',
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
    });
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.error(err);

    res.status(statusCode).json({
        success: false,
        error: statusCode >= 500 ? 'Internal Server Error' : message,
    });
});

app.listen(port, () => {
    console.log(`🗞️ Flowly lancé → http://localhost:${port}`);
});