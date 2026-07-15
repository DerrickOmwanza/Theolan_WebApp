import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { db, healthCheck, closeDb } from './config/database.js';
import { redis, closeRedis } from './config/redis.js';
import { initSentry, setSentryUser } from './config/sentry.js';
import { errorHandler } from './middlewares/errorHandler.js';
import logger, { requestLogger } from './middlewares/logger.js';
import { authRoutes } from './routes/auth.js';
import { bookingRoutes } from './routes/bookings.js';
import { quoteRoutes } from './routes/quote.js';
import { productRoutes } from './routes/products.js';
import { orderRoutes } from './routes/orders.js';
import { paymentRoutes } from './routes/payments.js';
import analyticsRoutes from './routes/analytics.js';
import settingsRoutes from './routes/settings.js';
import { profileRoutes } from './routes/profile.js';
import { contactRoutes } from './routes/contact.js';
import adminRoutes from './routes/admin.js';

// Initialize Sentry for error tracking
initSentry();

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Trust proxy — required behind Render's reverse proxy for rate limiting IP detection
app.set('trust proxy', 1);

// ============================================================
// SECURITY MIDDLEWARE
// ============================================================

// Helmet — sets secure HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false
  })
);

// CORS — restricted to configured origins with wildcard support
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim());
const allowedPatterns = (process.env.CORS_ORIGIN_PATTERNS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

console.log('[CORS] Allowed origins (exact match):', allowedOrigins);
console.log('[CORS] Allowed patterns (wildcard):', allowedPatterns);

// Body parsing — limited payload size (MUST be before CORS and other middleware)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS error handler - catches CORS errors and returns 403 instead of 500
const handleCorsError = (err, req, res, next) => {
  if (err.message && err.message.includes('CORS blocked')) {
    res.setHeader('Access-Control-Allow-Origin', 'false');
    return res.status(403).json({
      success: false,
      error: 'CORS_FORBIDDEN',
      message: err.message
    });
  }
  next(err);
};

// Apply CORS middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Render health checks)
      if (!origin) return callback(null, true);

      // Check exact match first
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Check wildcard patterns (e.g. *.vercel.app)
      const matchesPattern = allowedPatterns.some((pattern) => {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(origin);
      });

      if (matchesPattern) {
        return callback(null, true);
      }

      // Origin not allowed - trigger CORS error
      callback(new Error(`CORS blocked: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 86400, // 24 hours preflight cache
    optionsSuccessStatus: 204
  })
);

// Register CORS error handler
app.use(handleCorsError);

// ============================================================
// RATE LIMITING
// ============================================================

// Global rate limiter: 100 requests per minute per IP
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'RATE_LIMITED',
    message: 'Too many requests. Please try again later.'
  },
  skip: (req) => req.path === '/health'
});

// Strict rate limiter for auth endpoints: 20 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'RATE_LIMITED',
    message: 'Too many authentication attempts. Please try again in 15 minutes.'
  }
});

// Apply global rate limiting
app.use(globalLimiter);

// ============================================================
// REQUEST LOGGING
// ============================================================

// Morgan for HTTP-standard log format (piped to Winston)
const morganStream = {
  write: (message) => logger.http(message.trim())
};
app.use(morgan('combined', { stream: morganStream }));

// Custom request logger (status codes, duration)
app.use(requestLogger);

// Disable ETags globally to prevent 304 Not Modified responses
// which cause axios to return empty cached data
app.set('etag', false);

// Set cache control headers for API routes
app.use('/api/', (req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/health', async (req, res) => {
  try {
    const dbHealth = await healthCheck();
    const redisHealth = redis ? (redis.status === 'ready' ? 'healthy' : 'unavailable') : 'disabled';
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: NODE_ENV,
      database: dbHealth,
      redis: redisHealth
    });
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'service_unavailable',
      error: 'Service temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================
// API ROUTES (v1)
// ============================================================

// Authentication routes (with strict rate limiting)
app.use('/api/v1/auth', authLimiter, authRoutes);

// Booking routes
app.use('/api/v1/bookings', bookingRoutes);

// Quote estimator routes
app.use('/api/v1/quote', quoteRoutes);

// Products/Gallery routes
app.use('/api/v1/products', productRoutes);

// Order tracking routes
app.use('/api/v1/orders', orderRoutes);

// Payment routes (M-Pesa STK Push + callback webhook)
app.use('/api/v1/payments', paymentRoutes);

// Profile/User settings routes
app.use('/api/v1/profile', profileRoutes);

// Contact routes
app.use('/api/v1/contact', contactRoutes);

// Admin setup routes (one-time use only)
app.use('/api/v1/admin', adminRoutes);

// Analytics routes (admin only)
app.use('/api/v1/admin/analytics', analyticsRoutes);

// Settings routes (admin only)
app.use('/api/v1/admin/settings', settingsRoutes);

// ============================================================
// 404 & ERROR HANDLING
// ============================================================

// 404 handler — catch unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Global error handler (must be registered last)
app.use(errorHandler);

// ============================================================
// SERVER STARTUP & GRACEFUL SHUTDOWN
// ============================================================

const server = app.listen(PORT, async () => {
  try {
    await db.raw('SELECT 1');
    logger.info('The Olan Glass and Aluminium API server started', {
      port: PORT,
      environment: NODE_ENV,
      database: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    });
  } catch (error) {
    logger.error('Database connection failed on startup', { error: error.message });
    process.exit(1);
  }
});

/**
 * Graceful shutdown — close HTTP server, drain connections, close DB.
 * Triggered by SIGTERM (container orchestrator), SIGINT (Ctrl+C),
 * uncaught exceptions, and unhandled promise rejections.
 */
const gracefulShutdown = (signal) => {
  logger.warn(`Shutdown signal received: ${signal}`);

  server.close(async () => {
    try {
      await closeDb();
      await closeRedis();
      logger.info('Database and Redis connections closed. Shutdown complete.');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', { error: error.message });
      process.exit(1);
    }
  });

  // Force kill after 10 seconds if graceful shutdown stalls
  setTimeout(() => {
    logger.error('Forced shutdown — graceful shutdown timed out (10s)');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception — initiating shutdown', {
    error: error.message,
    stack: error.stack
  });
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection — initiating shutdown', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined
  });
  gracefulShutdown('unhandledRejection');
});

export default app;
