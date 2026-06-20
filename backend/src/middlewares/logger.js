import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config();

const LOG_LEVEL = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// ============================================================
// Winston Logger Configuration
// ============================================================

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase().padEnd(5)} ${message}${metaStr}`;
  })
);

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: 'theolan-api' },
  transports: [
    // Console transport (colorized in development)
    new winston.transports.Console({
      format: process.env.NODE_ENV !== 'production'
        ? winston.format.combine(winston.format.colorize(), logFormat)
        : logFormat
    }),

    // Error log file (production)
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 10 * 1024 * 1024,
            maxFiles: 10
          })
        ]
      : [])
  ]
});

// ============================================================
// Request Logger Middleware
// ============================================================

/**
 * Express middleware that logs every request with method, path,
 * status code, and response time in milliseconds.
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const meta = {
      method: req.method,
      path: req.originalUrl || req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };

    if (res.statusCode >= 500) {
      logger.error('Server error response', meta);
    } else if (res.statusCode >= 400) {
      logger.warn('Client error response', meta);
    } else {
      logger.info('Request completed', meta);
    }
  });

  next();
};

export default logger;
