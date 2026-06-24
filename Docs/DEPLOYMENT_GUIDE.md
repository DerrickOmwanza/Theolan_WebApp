# Deployment Guide - Theolan Aluminium International Ltd

**Last Updated:** June 20, 2026

---

## 🚀 Production Deployment Checklist

### Prerequisites
- [ ] Vercel account (for frontend)
- [ ] Railway account (for backend)
- [ ] PostgreSQL database (managed recommended)
- [ ] Sentry account (for error tracking)
- [ ] SendGrid account (for emails)
- [ ] Africa's Talking account (for SMS)
- [ ] Cloudinary account (for image storage)
- [ ] Safaricom Daraja credentials (for M-Pesa)

---

## Frontend Deployment (Vercel)

### 1. Connect Repository
```bash
# In Vercel dashboard
1. Import GitHub repository: DerrickOmwanza/Theolan_WebApp
2. Select frontend/ as root directory
3. Framework preset: Vite
4. Build command: npm run build
5. Output directory: dist
```

### 2. Environment Variables (Vercel Dashboard)
| Key | Value |
|-----|-------|
| VITE_API_BASE_URL | https://api.olanallumint.co.ke/api/v1 |
| VITE_SENTRY_DSN | Your Sentry DSN |

### 3. Deploy
- Automatic deploys from `main` branch
- Preview deploys from feature branches

---

## Backend Deployment (Railway)

### 1. Create Service
```bash
# In Railway dashboard
1. Create new project
2. Select GitHub repo: DerrickOmwanza/Theolan_WebApp
3. Set backend/ as root directory
4. Railway auto-detects Node.js
```

### 2. Environment Variables
| Key | Value |
|-----|-------|
| NODE_ENV | production |
| PORT | 3000 |
| DB_HOST | Your managed DB host |
| DB_PORT | 5432 |
| DB_NAME | theolan_prod |
| DB_USER | postgres |
| DB_PASSWORD | ******** |
| JWT_SECRET | 64+ character random string |
| JWT_REFRESH_SECRET | Different 64+ character string |
| SENTRY_DSN | Your Sentry DSN |
| SENDGRID_API_KEY | Your SendGrid key |
| CLOUDINARY_NAME | Your Cloudinary name |
| CLOUDINARY_KEY | Your Cloudinary key |
| CLOUDINARY_SECRET | Your Cloudinary secret |
| REDIS_HOST | Your Redis host |
| REDIS_PORT | 6379 |
| REDIS_PASSWORD | Your Redis password |

### 3. Deploy
- Railway auto-deploys on push to `main`

---

## Database Migration

### 1. Create Production Database
```bash
# Via Railway/AWS RDS/DigitalOcean
# Ensure PostgreSQL 14+
```

### 2. Run Migrations
```bash
cd backend
npm run migrate:latest
npm run seed:run
```

---

## DNS Configuration

| Record | Type | Value |
|--------|------|-------|
| olanallumint.co.ke | A | Vercel IPs |
| www.olanallumint.co.ke | CNAME | olanallumint.co.ke |
| api.olanallumint.co.ke | CNAME | Railway service |

---

## Monitoring Setup

### Sentry (Error Tracking)
1. Create organization at sentry.io
2. Create project for backend (Node.js)
3. Create project for frontend (React)
4. Add DSN to environment variables

### Alerting Rules
- Backend crash → Alert within 1 minute
- High error rate (>10%) → Alert within 5 minutes
- Database connection failed → Alert immediately

---

## Post-Deployment Verification

| Check | Endpoint | Expected |
|-------|----------|----------|
| Health | /health | 200 OK |
| API | /api/v1/products | 200 OK |
| Auth | /api/v1/auth/login | 401 (without creds) |
| Frontend | / | 200 OK |
| Analytics | /admin/analytics | 401 (without admin auth) |

---

## Rollback Procedures

### Frontend (Vercel)
- Previous deploy versions available in Vercel dashboard
- Click "Rollback" on any successful deployment

### Backend (Railway)
- Previous releases available in Railway dashboard
- Click "Rollback" or redeploy previous commit

### Database
- Restore from backup (Railway/AWS provides point-in-time recovery)
- Use `npm run migrate:rollback` if needed