# Production Deployment Checklist - Final Version

**Last Updated:** June 22, 2026

---

## ✅ COMPLETED TASKS

| Task | Status | Notes |
|------|--------|-------|
| Fix npm vulnerabilities (prod deps) | ✅ | All production dependencies clean (0 vulns) |
| Fix npm vulnerabilities (dev deps) | ⏸️ | 19 moderate in jest/js-yaml chain - deferred, tracked in WEEK_12_DIAGNOSTICS.md |
| Configure Redis | ✅ | Added ioredis, config, Docker service |
| Configure Load Balancer | ✅ | Created nginx.conf |
| Configure Sentry | ✅ | Added initSentry, profiling support |
| Production migrations | ✅ | Created setup script |
| Uptime monitoring | ✅ | Created monitoring docs |

---

## 📋 PRODUCTION DEPLOYMENT STEPS

### 1. Generate Production Secrets

```bash
# Generate secure JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Set these in Railway/Vercel environment variables:
# JWT_SECRET=<64-char-string>
# JWT_REFRESH_SECRET=<different-64-char-string>
```

### 2. Deploy Backend to Railway

1. Create new project in Railway
2. Connect to `DerrickOmwanza/Theolan_WebApp`
3. Set root directory: `backend/`
4. Add environment variables from table below
5. Deploy

### 3. Deploy Frontend to Vercel

1. Import repository in Vercel
2. Set root directory: `frontend/`
3. Set environment variables
4. Deploy

### 4. DNS Configuration

| Record | Type | Value |
|--------|------|-------|
| olanallumint.co.ke | A | Vercel IPs |
| www.olanalumint.co.ke | CNAME | olanallumint.co.ke |
| api.olanalumint.co.ke | CNAME | Railway service |

---

## 🔐 ENVIRONMENT VARIABLES

### Backend (Railway)

| Variable | Value |
|----------|-------|
| NODE_ENV | production |
| PORT | 3000 |
| DB_HOST | [From Railway PostgreSQL] |
| DB_PORT | 5432 |
| DB_NAME | theolan_prod |
| DB_USER | postgres |
| DB_PASSWORD | [Your password] |
| JWT_SECRET | [64+ char random] |
| JWT_REFRESH_SECRET | [Different 64+ char] |
| SENTRY_DSN | [From Sentry] |
| REDIS_HOST | [From Railway Redis] |
| REDIS_PORT | 6379 |
| REDIS_PASSWORD | [Your password] |
| CORS_ORIGIN | https://olanallumint.co.ke |

### Frontend (Vercel)

| Variable | Value |
|----------|-------|
| VITE_API_BASE_URL | https://api.olanallumint.co.ke/api/v1 |
| VITE_SENTRY_DSN | [From Sentry] |

---

## 🚨 POST-DEPLOYMENT CHECKLIST

- [ ] Verify `/health` endpoint returns 200
- [ ] Verify `/api/v1/auth/login` returns 401 without credentials
- [ ] Create admin user with secure password
- [ ] Test complete signup → OTP → login flow
- [ ] Configure Sentry alerting
- [ ] Set up uptime monitoring
- [ ] Update frontend API URL to production
- [ ] Test booking flow end-to-end
- [ ] Test payment flow (M-Pesa STK)
- [ ] **Maintenance:** Fix 19 dev-dependency js-yaml vulnerabilities (see WEEK_12_DIAGNOSTICS.md)
- [ ] Remove this checklist file from repo

---

## 📞 Support Contacts

| Service | Contact |
|---------|---------|
| Railway Support | support@railway.app |
| Vercel Support | support@vercel.com |
| Sentry Support | support@sentry.io |
| UptimeRobot | [Your account] |

---

**Status: Application is production-ready and can be deployed safely.**