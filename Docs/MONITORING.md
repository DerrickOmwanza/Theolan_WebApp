# Monitoring Setup Guide

## Recommended Monitoring Services

| Service | Purpose | Cost |
|---------|---------|------|
| UptimeRobot | Uptime monitoring | Free tier available |
| Sentry | Error tracking | Free tier: 10k events/month |
| DataDog | Infrastructure + APM | Paid |
| New Relic | APM + Infrastructure | Paid |
| Prometheus + Grafana | Self-hosted | Free |

---

## Health Check Endpoint

The `/health` endpoint provides comprehensive system status:

```bash
curl https://api.olanallumint.co.ke/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-06-22T23:45:00.000Z",
  "uptime": 3600.5,
  "environment": "production",
  "database": { "status": "healthy", "timestamp": "..." },
  "redis": "healthy"
}
```

---

## Monitoring Endpoints

| Endpoint | Method | Expected | Frequency |
|----------|--------|----------|-----------|
| `/health` | GET | 200 | 60s |
| `/api/v1/products` | GET | 200 | 5min |
| `/api/v1/auth/login` | POST | 401 | 3min |
| `/` (frontend) | GET | 200 | 5min |

---

## Alert Configuration

### Critical Alerts (Immediate)
- Backend service down
- Database connection failed
- Redis unavailable
- Response time > 5 seconds

### Warning Alerts (5 min)
- Error rate > 5%
- Memory usage > 80%
- CPU usage > 80%

### Info Alerts (Daily)
- New error types
- Rate limit exceeded

---

## Setup Instructions

### UptimeRobot (Free)
1. Sign up at https://uptimerobot.com
2. Add HTTP(s) monitor
3. URL: `https://api.olanallumint.co.ke/health`
4. Set alert contacts

### Sentry (Error Tracking)
1. Create account at https://sentry.io
2. Create organization: `olan-aluminium`
3. Create project: `theolan-backend`
4. Copy DSN to `SENTRY_DSN` environment variable

### Grafana Cloud (Metrics)
1. Sign up at https://grafana.com/cloud
2. Add Prometheus data source
3. Import Node.js dashboard template

---

## Log Analysis

### Key Metrics to Track
- Request count (by endpoint)
- Error count (by type)
- Response time (p50, p95, p99)
- Database connection pool usage
- Redis hit/miss ratio

### Log Format
```
[LEVEL] [timestamp] [request_id] [user_id] message
INFO    2026-06-22T23:45:00Z  req-123    usr-456    User logged in
```

---

## Incident Response

### Backend Down
1. Check Railway status
2. Check database connectivity
3. Check environment variables
4. Restart service if needed

### Database Issues
1. Check PostgreSQL logs
2. Verify connection pool
3. Check for lock contention
4. Restore from backup if needed

### High Error Rate
1. Check Sentry for error patterns
2. Review recent deployments
3. Rollback if necessary
4. Communicate with stakeholders