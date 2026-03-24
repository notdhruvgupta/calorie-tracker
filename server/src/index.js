import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import entryRoutes from './routes/entries.js';
import analyticsRoutes from './routes/analytics.js';
import settingsRoutes from './routes/settings.js';
import { authenticate } from './middleware/auth.js';
import { rateLimit } from './middleware/rateLimit.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiters
const authLimiter = rateLimit({ windowMs: 15 * 60_000, max: 15, message: 'Too many auth attempts, try again later' });
const apiLimiter = rateLimit({ windowMs: 60_000, max: 60 });

// Public routes
app.use('/api/auth', authLimiter, authRoutes);

// Protected routes
app.use('/api/entries', authenticate, apiLimiter, entryRoutes);
app.use('/api/analytics', authenticate, apiLimiter, analyticsRoutes);
app.use('/api/settings', authenticate, apiLimiter, settingsRoutes);

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`Server running on :${PORT}`));
