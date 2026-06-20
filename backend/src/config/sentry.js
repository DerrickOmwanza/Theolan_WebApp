// Sentry Error Tracking Configuration
// For production monitoring and alerting

import Sentry from '@sentry/node';

/**
 * Initialize Sentry
 * Add to server.js after imports to capture all errors
 */
export function initSentry() {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.APP_VERSION || '1.0.0',

      // Performance monitoring
      tracesSampleRate: 0.1, // 10% of transactions

      // Security filtering
      beforeSend(event) {
        // Remove sensitive data
        if (event.request?.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
        return event;
      },

      // Ignore certain errors
      ignoreErrors: [
        'ECONNABORTED', // User cancelled request
        'ECONNRESET' // Connection reset
      ]
    });
  }
}

export default Sentry;
