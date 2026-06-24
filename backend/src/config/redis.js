/**
 * Redis Client Configuration
 * Used for:
 * - Storing refresh tokens (with expiration)
 * - Caching frequently accessed data
 * - Rate limiting counters
 */

import Redis from 'ioredis';
import logger from '../middlewares/logger.js';

const env = process.env.NODE_ENV || 'development';

// Redis connection configuration - make it optional
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  // Retry strategy for connection failures
  retryStrategy: (times) => {
    if (times > 3) {
      logger.warn('Redis connection failed after 3 retries - continuing without cache');
      return null; // Stop retrying but don't crash
    }
    return Math.min(times * 100, 2000); // Exponential backoff
  }
};

// Create Redis instance only if REDIS_HOST is configured
export const redis = process.env.REDIS_HOST
  ? new Redis(redisConfig)
  : null;

// Event handlers (only if redis exists)
if (redis) {
  redis.on('connect', () => {
    logger.info('Redis connected', { host: redisConfig.host, port: redisConfig.port });
  });

  redis.on('error', (error) => {
    logger.warn('Redis connection error - continuing without cache', { error: error.message });
  });

  redis.on('reconnecting', () => {
    logger.warn('Redis reconnecting...');
  });

  redis.on('ready', () => {
    logger.info('Redis is ready for operations');
  });
}

/**
 * Check if Redis is connected
 * @returns {boolean}
 */
export const isRedisConnected = () => {
  return redis && (redis.status === 'ready' || redis.status === 'connect');
};

/**
 * Gracefully close Redis connection
 */
export const closeRedis = async () => {
  if (!redis) return;
  try {
    await redis.disconnect();
    logger.info('Redis connection closed');
  } catch (error) {
    logger.warn('Error closing Redis connection', { error: error.message });
  }
};

/**
 * Token cache keys
 */
export const REDIS_KEYS = {
  refreshToken: (userId) => `refresh_token:${userId}`,
  userSession: (userId) => `user_session:${userId}`,
  rateLimit: (key) => `rate_limit:${key}`
};

export default redis;
