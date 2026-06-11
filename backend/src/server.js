require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./config/db');
const cronRunner = require('./jobs/cron');

const authRoutes = require('./routes/auth');
const articleRoutes = require('./routes/articles');
const adminRoutes = require('./routes/admin');
const n8nRoutes = require('./routes/n8n');

const PORT = parseInt(process.env.PORT, 10) || 5000;

const app = express();

// Enable 'trust proxy' to support correct IP rate-limiting behind proxies like Render
app.set('trust proxy', 1);

// --------- Middleware ---------
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

const origins = (process.env.CORS_ORIGINS || '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: origins.includes('*') ? true : origins,
    credentials: true
  })
);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate-limit only the auth routes to discourage brute force
app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false
  })
);

// --------- Health ---------
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV || 'development',
    time: new Date().toISOString()
  });
});

// --------- Routes ---------
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/n8n', n8nRoutes);

// --------- 404 + Error ---------
app.use((req, res) => res.status(404).json({ message: `Not found: ${req.method} ${req.path}` }));
app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {})
  });
});

// --------- Boot ---------
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`╔══════════════════════════════════════════════╗`);
    console.log(`║  Ascentium Intelligence API                   ║`);
    console.log(`║  Listening on http://localhost:${String(PORT).padEnd(13)}║`);
    console.log(`║  ENV: ${(process.env.NODE_ENV || 'development').padEnd(38)}║`);
    console.log(`╚══════════════════════════════════════════════╝`);
    cronRunner.start();
  });
}

start().catch((err) => {
  console.error('[boot] failed:', err);
  process.exit(1);
});
