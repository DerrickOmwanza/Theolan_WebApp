import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { db, healthCheck, closeDb } from './config/database.js';
import { errorHandler } from './middlewares/errorHandler.js';
import logger, { requestLogger } from './middlewares/logger.js';
import { authRoutes } from './routes/auth.js';
import { bookingRoutes } from './routes/bookings.js';
import { quoteRoutes } from './routes/quote.js';
import { productRoutes } from './routes/products.js';
import { orderRoutes } from './routes/orders.js';
import { paymentRoutes } from './routes/payments.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

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

// CORS — restricted to configured origins
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 86400 // 24 hours preflight cache
  })
);

// Body parsing — limited payload size
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/health', async (req, res) => {
  try {
    const dbHealth = await healthCheck();
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: NODE_ENV,
      database: dbHealth
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

// Analytics routes (admin only)
app.use('/api/v1/admin/analytics', analyticsRoutes);

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
    logger.info(`Theolan Aluminium API server started`, {
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
const gracefulShutdown = async (signal) => {
  logger.warn(`Shutdown signal received: ${signal}`);

  server.close(async () => {
    try {
      await closeDb();
      logger.info('Database connection closed. Shutdown complete.');
      process.exit(0);
    } catch (error) {
      logger.error('Error during database shutdown', { error: error.message });
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

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection — initiating shutdown', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined
  });
  gracefulShutdown('unhandledRejection');
});

export default app;
