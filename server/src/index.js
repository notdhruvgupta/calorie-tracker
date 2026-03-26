import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import authRoutes from './routes/auth.js';
import entryRoutes from './routes/entries.js';
import analyticsRoutes from './routes/analytics.js';
import settingsRoutes from './routes/settings.js';
import { authenticate } from './middleware/auth.js';
import { rateLimit } from './middleware/rateLimit.js';
import { runMigrations } from './db/migrate.js';

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = dirname(fileURLToPath(import.meta.url));

// CORS — open in dev, restricted by env var in production
const allowedOrigin = process.env.CORS_ORIGIN;
app.use(cors(allowedOrigin ? { origin: allowedOrigin, credentials: true } : {}));

app.use(express.json({ limit: '10mb' }));

// Rate limiters
const authLimiter = rateLimit({ windowMs: 15 * 60_000, max: 15, message: 'Too many auth attempts, try again later' });
const apiLimiter = rateLimit({ windowMs: 60_000, max: 60 });

// Health check (no auth, no rate limit)
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Public routes
app.use('/api/auth', authLimiter, authRoutes);

// Protected routes
app.use('/api/entries', authenticate, apiLimiter, entryRoutes);
app.use('/api/analytics', authenticate, apiLimiter, analyticsRoutes);
app.use('/api/settings', authenticate, apiLimiter, settingsRoutes);

// Serve built frontend in production
const distPath = join(__dirname, '../../dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('/{*path}', (_req, res) => res.sendFile(join(distPath, 'index.html')));
}

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Run migrations then start
runMigrations()
  .then(() => app.listen(PORT, () => console.log(`Server running on :${PORT}`)))
  .catch((err) => { console.error('Startup failed:', err); process.exit(1); });
