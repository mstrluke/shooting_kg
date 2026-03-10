import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { authRouter } from './routes/auth';
import { slidersRouter } from './routes/sliders';
import { newsRouter } from './routes/news';
import { eventsRouter } from './routes/events';
import { staffRouter } from './routes/staff';
import { photosRouter } from './routes/photos';
import { videosRouter } from './routes/videos';
import { partnersRouter } from './routes/partners';
import { documentsRouter } from './routes/documents';
import { ratingsRouter } from './routes/ratings';
import { pagesRouter } from './routes/pages';
import { settingsRouter } from './routes/settings';
import { uploadRouter } from './routes/upload';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// === SECURITY ===

// Helmet: security headers (XSS protection, no sniff, frameguard, etc.)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow images to load cross-origin
  contentSecurityPolicy: false, // CSP handled by nginx in prod
}));

// CORS: restrict origins in production
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

// Global rate limit: 100 requests per minute per IP
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, try again later' },
}));

// Body parser with size limit
app.use(express.json({ limit: '2mb' }));

// Static files (no directory listing)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), { dotfiles: 'deny', index: false }));
app.use('/stub', express.static(path.join(__dirname, '..', 'stub'), { dotfiles: 'deny', index: false }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/sliders', slidersRouter);
app.use('/api/news', newsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/staff', staffRouter);
app.use('/api/photos', photosRouter);
app.use('/api/videos', videosRouter);
app.use('/api/partners', partnersRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/pages', pagesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/upload', uploadRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler — never leak stack traces
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
