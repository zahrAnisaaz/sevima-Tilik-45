require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet({
  contentSecurityPolicy: { directives: { 'upgrade-insecure-requests': null } }, // agar jalan di http://localhost
}));
const origins = (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({ origin: origins.length ? origins : '*' }));
app.use(express.json({ limit: '100kb' }));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: 'draft-7', legacyHeaders: false });

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'Tilik', tagline: 'Ajar Sesuai Tingkat' }));
app.use('/api/auth', authLimiter, require('./routes/auth'));

app.use('/api', notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌱 Tilik berjalan di http://localhost:${PORT}`));
