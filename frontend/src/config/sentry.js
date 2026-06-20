// Sentry Error Tracking for Frontend
// Initialize in main.jsx

import * as Sentry from "@sentry/react";

export function initSentry() {
  if (import.meta.env.VITE_SENTRY_DSN && import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION || "1.0.0",
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysBroadcastSampleRate: 0.1,
    });
  }
}

export default Sentry;
