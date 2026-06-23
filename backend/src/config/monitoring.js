// Uptime Monitoring Configuration
// Add these endpoints to your monitoring provider (UptimeRobot, Pingdom, etc.)

export const MONITORING_ENDPOINTS = {
  // Main health check
  health: {
    url: '/health',
    method: 'GET',
    expectedStatus: 200,
    interval: 60 // seconds
  },

  // API endpoint check
  api: {
    url: '/api/v1/products',
    method: 'GET',
    expectedStatus: 200,
    interval: 300 // seconds
  },

  // Auth endpoints (return 401 without credentials)
  auth: {
    url: '/api/v1/auth/login',
    method: 'POST',
    expectedStatus: 401,
    body: { phone: '+254712345678', password: 'wrong' },
    interval: 180 // seconds
  },

  // Frontend check (if accessible)
  frontend: {
    url: '/',
    method: 'GET',
    expectedStatus: 200,
    interval: 300 // seconds
  }
};

// Monitoring checklist before production
export const MONITORING_CHECKLIST = [
  '✅ Backend health endpoint responding',
  '✅ API endpoints returning correct status codes',
  '✅ Database connection healthy',
  '✅ Redis connection available (if used)',
  '✅ Rate limiting working',
  '✅ Error logging to Sentry (if configured)',
  '✅ Response times < 2 seconds for 95th percentile',
  '✅ No 5xx errors in last 24 hours',
  '✅ SSL certificate valid'
];

export default MONITORING_ENDPOINTS;
