# OlanAlumint.web — Development Documentation

**Project:** Theolan Aluminium International Ltd — MVP Web Application  
**Status:** Ready for Development  
**Target Launch:** Week 12 (12 weeks from start)  

---

## 📋 Documentation Index

All documentation is version-controlled in `/Docs` directory:

1. **[01_SYSTEM_ANALYSIS.md](./01_SYSTEM_ANALYSIS.md)** (19.4 KB)
   - Executive summary, current state audit, gap analysis
   - Quality & architecture review, improvement roadmap
   - **Start here** to understand business context & feature completeness

2. **[02_SYSTEM_ARCHITECTURE.md](./02_SYSTEM_ARCHITECTURE.md)** (24.8 KB)
   - 3-tier architecture (presentation, API, data layers)
   - JWT authentication & role-based authorization flows
   - M-Pesa payment integration, SMS notifications (Africa's Talking)
   - Database schema overview, error handling strategy, deployment topology
   - **For:** Backend architects, API contract negotiation

3. **[03_DATABASE_SCHEMA.md](./03_DATABASE_SCHEMA.md)** (24.4 KB)
   - Complete DDL for 14 tables (users, orders, bookings, payments, etc.)
   - Foreign key relationships, indexes, constraints
   - Triggers for auto-computed fields (client status, lifetime value)
   - Migration strategy, backup/recovery procedures
   - **For:** Database engineers, data modeling decisions

4. **[04_API_CONTRACT.md](./04_API_CONTRACT.md)** (19.9 KB)
   - REST API specification: 30+ endpoints across 8 domains
   - Request/response schemas with real examples
   - Auth (signup/login/OTP), bookings, orders, payments, admin CRM
   - Error codes, rate limiting, rate limits policy
   - **For:** Frontend developers, API integration, testing

5. **[05_SITEMAP_ROUTING.md](./05_SITEMAP_ROUTING.md)** (14.3 KB)
   - Full site hierarchy (public, auth, client dashboard, admin dashboard)
   - React Router v6 configuration & route structure
   - Breadcrumb navigation, query parameters, deep links
   - Mobile-responsive routing considerations
   - **For:** Frontend architects, page structure, navigation design

6. **[06_IMPLEMENTATION_ROADMAP.md](./06_IMPLEMENTATION_ROADMAP.md)** (22.3 KB)
   - 12-week sprint plan: 8 weeks MVP, 4 weeks polish/launch
   - 60+ story cards across backend, frontend, DevOps
   - Weekly sprint breakdown with effort estimates (story points)
   - Dependency graph, risk mitigation, success criteria
   - **For:** Project managers, developers, sprint planning

7. **[07_SYSTEM_ANALYSIS_REPORT.md](./07_SYSTEM_ANALYSIS_REPORT.md)** (12 KB)
   - Full system analysis using Node.js-React, Security Audit, and Testing Strategy skills
   - Architecture maturity assessment, security audit findings
   - Frontend/backend code quality review
   - Testing strategy assessment and recommendations
   - **For:** Technical team reference, project health overview

8. **[08_WEEK_1_PROGRESS.md](./08_WEEK_1_PROGRESS.md)** (2 KB)
   - Week 1 completion status
   - Manual setup steps required
   - API endpoints ready for testing
   - Next steps for Week 2

9. **[09_WEEK_2_PROGRESS.md](./09_WEEK_2_PROGRESS.md)** (NEW)
   - Week 2 status: Booking System
   - Booking API endpoints ready
   - SMS service integration
   - Frontend booking form complete

10. **[10_WEEK_3_PROGRESS.md](./10_WEEK_3_PROGRESS.md)** (NEW)
    - Week 3 status: Quote Estimator & Product Gallery
    - Quote API with pricing formula verified
    - Products endpoint with filters
    - Frontend pages ready

11. **[11_WEEK_4_PROGRESS.md](./11_WEEK_4_PROGRESS.md)** (NEW)
    - Week 4 status: Order Management
    - Order state machine implemented
    - Admin-only status transitions
    - Timeline events for order progress

12. **[12_WEEK_5_PROGRESS.md](./12_WEEK_5_PROGRESS.md)** (NEW)
    - Week 5 status: M-Pesa Payment Integration
    - STK Push service implemented
    - Webhook callback processing
    - Payment status tracking

13. **[13_WEEK_6_PROGRESS.md](./13_WEEK_6_PROGRESS.md)** (NEW)
    - Week 6 status: Admin Dashboard
    - AdminLayout with sidebar navigation
    - AdminOrdersPage with status management
    - Admin-only API endpoints

14. **[14_WEEK_7_PROGRESS.md](./14_WEEK_7_PROGRESS.md)** (NEW)
    - Week 7 status: Admin Calendar & CRM
    - Calendar view for booking management
    - Admin bookings API endpoint
    - Date picker and status filters

15. **[15_WEEK_8_PROGRESS.md](./15_WEEK_8_PROGRESS.md)** (NEW)
    - Week 8 status: MVP Complete
    - All features implemented and verified
    - Production readiness checklist
    - Ready for deployment

---

## 🚀 Quick Start

### Prerequisites

```bash
# Node.js & npm
node --version  # v18+ required
npm --version   # v9+ required

# Git
git --version   # v2.30+ required

# Database
psql --version  # PostgreSQL 14+ required (local or managed)
```

### Development Environment Setup

**1. Clone repository & install dependencies:**
```bash
cd OlanAlumint.web
npm install

# Backend setup
cd backend
npm install
cp .env.example .env  # Configure dev database, API keys

# Frontend setup
cd ../frontend
npm install
cp .env.example .env  # Configure API base URL
```

**2. Database initialization:**
```bash
# Create database
createdb theolan_dev

# Run migrations
cd backend
npm run migrate:latest

# Seed initial data (products, technicians, time slots)
npm run seed
```

**3. Start development servers:**
```bash
# Terminal 1: Backend (port 3000)
cd backend
npm run dev

# Terminal 2: Frontend (port 5173 via Vite)
cd frontend
npm run dev

# Terminal 3 (optional): Database GUI
pgAdmin or DBeaver connection to localhost:5433
```

**4. Verify setup:**
- Backend health: `curl http://localhost:3001/health`
- Frontend: Open `http://localhost:5173` in browser
- Test auth: Use dev credentials (phone: +254712345678, password: TestPass123!)

---

## 📁 Repository Structure

```
OlanAlumint.web/
├── Docs/                          # This documentation suite
│   ├── 01_SYSTEM_ANALYSIS.md
│   ├── 02_SYSTEM_ARCHITECTURE.md
│   ├── 03_DATABASE_SCHEMA.md
│   ├── 04_API_CONTRACT.md
│   ├── 05_SITEMAP_ROUTING.md
│   ├── 06_IMPLEMENTATION_ROADMAP.md
│   ├── 07_SYSTEM_ANALYSIS_REPORT.md
│   ├── 08_WEEK_1_PROGRESS.md
│   └── README.md (this file)
├── backend/
│   ├── src/
│   │   ├── routes/               # Express route handlers
│   │   ├── controllers/          # Business logic
│   │   ├── services/             # Business logic (Auth, Quote, Payment, etc.)
│   │   ├── models/               # Database ORM models
│   │   ├── middlewares/          # Auth, error handling, logging
│   │   ├── config/               # Environment, database, external APIs
│   │   └── utils/                # Helpers (validators, formatters)
│   ├── migrations/               # Database migrations (Knex.js)
│   ├── seeds/                    # Seed data (products, technicians)
│   ├── tests/                    # Unit & integration tests
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── package.json
│   └── server.js                 # Entry point
├── frontend/
│   ├── src/
│   │   ├── pages/                # Page components (Home, Booking, Account, etc.)
│   │   ├── components/           # Reusable UI components
│   │   ├── layouts/              # Layout wrappers (PublicLayout, ClientLayout, AdminLayout)
│   │   ├── hooks/                # Custom React hooks (useAuth, useOrders, etc.)
│   │   ├── services/             # API client, external integrations
│   │   ├── contexts/             # Context API (AuthContext, etc.)
│   │   ├── styles/               # Tailwind config, global styles
│   │   ├── utils/                # Helpers (formatters, validators)
│   │   └── main.jsx              # React entry point
│   ├── tests/                    # Unit & E2E tests (Vitest, React Testing Library)
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── .gitignore                    # Exclude .env, node_modules, etc.
```

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React.js 18 (Hooks, Context API)
- **Styling:** Tailwind CSS (utility-first, mobile-first)
- **Build Tool:** Vite (fast HMR, optimized production builds)
- **Routing:** React Router v6 (client-side navigation)
- **State Management:** React Query (server state), Context API (app state)
- **Form Handling:** React Hook Form + Zod (validation)
- **HTTP Client:** Axios (interceptors for JWT)
- **Testing:** Vitest (unit), React Testing Library (component), Cypress (E2E)

### Backend
- **Runtime:** Node.js 18+ (async, clustering)
- **Framework:** Express.js (REST API, middleware)
- **Database:** PostgreSQL 14+ (ACID, relational)
- **ORM:** Knex.js (query builder, migrations)
- **Authentication:** JWT (stateless, refresh tokens)
- **Validation:** Zod (schema validation)
- **Testing:** Jest (unit), Supertest (integration)
- **External APIs:** Safaricom Daraja (M-Pesa), Africa's Talking (SMS), Cloudinary (images), SendGrid (email)

### DevOps & Hosting
- **Version Control:** Git + GitHub (feature branches, PR reviews)
- **CI/CD:** GitHub Actions (test, lint, build, deploy)
- **Frontend Hosting:** Vercel (automatic deployments)
- **Backend Hosting:** Railway or AWS EC2
- **Database:** PostgreSQL managed (Railway, AWS RDS, DigitalOcean)
- **Containerization:** Docker (optional, for local consistency)
- **Monitoring:** Datadog or New Relic (performance, errors)

### Design System
- **Palette:** Charcoal (#1A1F26), Cobalt (#0055CC), Gold (#B8872A), Silver (#C8D0D9), Warm White (#F5F4F0)
- **Typography:** Cormorant Garant (headings), DM Sans (body)
- **Breakpoints:** Mobile (320px), Tablet (768px), Desktop (1024px+)
- **Spacing:** 4px-based scale (4, 8, 12, 16, 24, 32, 48, 64px)

---

## 📋 Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/booking-form

# Implement feature following story definition
# → Backend: Create API endpoint, tests
# → Frontend: Build UI, integrate API, tests

# Commit with descriptive message
git commit -m "feat: implement booking form with multi-step validation"

# Push to GitHub
git push origin feature/booking-form

# Open Pull Request, request review
# → CI/CD runs tests, linter, builds
# → Peer review feedback
# → Merge to main when approved
```

### 2. Testing Strategy

**Unit Tests (Per Component/Function)**
```bash
# Backend
npm run test -- src/services/QuoteService.test.js

# Frontend
npm run test -- src/components/BookingForm.test.jsx
```

**Integration Tests (Cross-Service)**
```bash
# Backend API routes
npm run test:integration -- tests/auth.integration.test.js
```

**E2E Tests (Critical User Flows)**
```bash
npm run test:e2e -- tests/booking-complete-flow.spec.js
```

**Coverage Reporting**
```bash
npm run test:coverage  # Generate coverage report
```

### 3. Code Quality

**Linting & Formatting**
```bash
# Check code style (ESLint)
npm run lint

# Auto-fix issues
npm run lint:fix

# Format code (Prettier)
npm run format

# Type checking (TypeScript optional)
npm run type-check
```

### 4. Deployment

**Staging (Automatic on PR merge to develop)**
```bash
# GitHub Actions automatically:
# 1. Runs tests & linting
# 2. Builds frontend (Vite → optimized bundle)
# 3. Builds backend (Docker image optional)
# 4. Deploys frontend to Vercel staging
# 5. Deploys backend to Railway staging
# 6. Runs smoke tests
```

**Production (Manual trigger)**
```bash
# After staging validation:
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions automatically:
# 1. Builds & runs full test suite
# 2. Builds production frontend & backend
# 3. Deploys to Vercel & Railway production
# 4. Runs production smoke tests
# 5. Notifies team via Slack
```

---

## 🔒 Security Checklist

Before merging any PR:
- [ ] No hardcoded secrets (API keys, passwords, DB credentials)
- [ ] All inputs validated (Zod schemas enforced)
- [ ] SQL injection prevention (parameterized queries via Knex)
- [ ] XSS prevention (React escaping, sanitized HTML)
- [ ] CSRF protection (SameSite cookies, CORS restrictions)
- [ ] JWT tokens validated on every protected route
- [ ] Sensitive data not logged (passwords, tokens)
- [ ] HTTPS enforced (redirect http → https in production)

---

## 🧪 Testing Coverage Targets

**Backend:**
- Unit tests: 80%+ coverage (services, utilities)
- Integration tests: 70%+ coverage (API routes, auth flows)
- E2E tests: Critical paths only (signup → booking → order)

**Frontend:**
- Component tests: 70%+ coverage (form components, modals)
- Integration tests: 60%+ coverage (page flows, API integration)
- E2E tests: Critical paths only (booking, order tracking, CRM)

**Command to check:**
```bash
npm run test:coverage
# Target: lines >70%, branches >60%, functions >70%
```

---

## 📊 Performance Targets

- **Frontend:** Lighthouse >85 (Performance, Accessibility, Best Practices)
- **API Response Times:** p95 <500ms, p99 <1s (excluding external APIs)
- **Database Queries:** <100ms per query (with proper indexing)
- **Page Load:** < 2s (Time to Interactive)
- **Mobile Load:** < 3s (on 4G)

**Monitor with:**
```bash
npm run lighthouse -- http://localhost:5173
npm run k6:load-test  # Load test with k6
```

---

## 🐛 Issue Tracking & Labels

Issues tracked in GitHub with labels:
- `bug` — Defect (priority: high)
- `feature` — New feature (backlog)
- `enhancement` — Improvement to existing feature
- `documentation` — Docs or comments needed
- `spike` — Research or investigation task
- `dependencies` — Dependency updates
- `security` — Security vulnerability (priority: critical)

**Severity levels (for bugs):**
- `critical` — System down, data loss, security breach
- `high` — Feature broken, workaround exists
- `medium` — Annoying behavior, cosmetic issue
- `low` — Minor edge case, no user impact

---

## 📞 Getting Help

### Common Issues

**Database Connection Failed**
```bash
# Check PostgreSQL is running
psql -U postgres -h localhost

# Verify .env has correct DB_HOST, DB_PORT, DB_PASSWORD
cat .env | grep DB_

# Test connection with Knex
npm run knex:debug
```

**Build Failures**
```bash
# Clear cache & reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node version (should be 18+)
node --version
```

**M-Pesa Sandbox Errors**
- Verify `SAFARICOM_CONSUMER_KEY` in .env is correct
- Check sandbox account has available balance (1 KES min)
- Test with provided test phone `254712345678`

### Documentation Links

- **Design System:** See [05_SITEMAP_ROUTING.md](./05_SITEMAP_ROUTING.md) for color palette, typography, component specs
- **API Endpoint Details:** See [04_API_CONTRACT.md](./04_API_CONTRACT.md) for all request/response examples
- **Database Queries:** See [03_DATABASE_SCHEMA.md](./03_DATABASE_SCHEMA.md) for table structures & relationships
- **Architecture Deep Dive:** See [02_SYSTEM_ARCHITECTURE.md](./02_SYSTEM_ARCHITECTURE.md) for 3-tier design & auth flows
- **Feature Backlog:** See [06_IMPLEMENTATION_ROADMAP.md](./06_IMPLEMENTATION_ROADMAP.md) for sprint breakdown & effort estimates

### Escalation Path

1. **Stuck on a task?** → Slack #dev-support channel (async first)
2. **Blocker preventing progress?** → Slack @tech-lead (synchronous)
3. **Security or data issue?** → Email security@olanallumint.co.ke (confidential)

---

## 🎯 Success Criteria (MVP Launch)

By **Week 8 (MVP Complete):**
- ✅ All core features working end-to-end
- ✅ Client can: signup → book → quote → order → track → pay
- ✅ Admin can: manage orders, assign techs, update timelines, manage CRM
- ✅ Mobile responsive, Lighthouse >85
- ✅ <5 known bugs (none critical)
- ✅ Tests passing (>70% coverage)
- ✅ Documentation complete
- ✅ Ready for UAT

By **Week 12 (Launch):**
- ✅ Security audit cleared
- ✅ Performance benchmarks met
- ✅ Monitoring & alerting live
- ✅ Production deployed
- ✅ Team trained
- ✅ Stakeholder sign-off

---

## 📅 Key Milestones

| Week | Milestone | Owner |
|------|-----------|-------|
| 1 | Backend & DB setup, Auth working | Backend Lead |
| 2 | Booking system end-to-end | Full Team |
| 3 | Quote estimator & Product gallery | Full Team |
| 4 | Client login & profile management | Frontend Lead |
| 5 | Order tracking & M-Pesa integration | Full Team |
| 6 | Admin order management complete | Full Team |
| 7 | Admin calendar & CRM complete | Full Team |
| 8 | MVP feature-complete, manual QA pass | Full Team |
| 9 | Automated tests & performance optimization | QA + Backend |
| 10 | Admin analytics & email/SMS templating | Full Team |
| 11 | Mobile optimization & CI/CD pipeline | DevOps |
| 12 | Security audit, UAT, production launch | Full Team |

---

## 📖 How to Read This Documentation

**If you're...**

- **Starting a backend task:** Read [02_SYSTEM_ARCHITECTURE.md](./02_SYSTEM_ARCHITECTURE.md) (architecture) + [03_DATABASE_SCHEMA.md](./03_DATABASE_SCHEMA.md) (schema) + [04_API_CONTRACT.md](./04_API_CONTRACT.md) (your endpoint spec)

- **Starting a frontend task:** Read [05_SITEMAP_ROUTING.md](./05_SITEMAP_ROUTING.md) (page structure) + [04_API_CONTRACT.md](./04_API_CONTRACT.md) (API integration) + [02_SYSTEM_ARCHITECTURE.md](./02_SYSTEM_ARCHITECTURE.md) (auth flows)

- **Planning sprints:** Read [06_IMPLEMENTATION_ROADMAP.md](./06_IMPLEMENTATION_ROADMAP.md) (full roadmap)

- **New to the project:** Read [01_SYSTEM_ANALYSIS.md](./01_SYSTEM_ANALYSIS.md) first (context + overview)

- **Doing design/UX work:** All wireframes & designs are referenced in conversation history; see [01_SYSTEM_ANALYSIS.md](./01_SYSTEM_ANALYSIS.md) for visual design specs

---

## 📄 License

Proprietary — Theolan Aluminium International Ltd. All rights reserved.

---

## 🎉 Let's Build!

This documentation is your north star. Keep it updated as requirements evolve. When in doubt, refer back to the relevant doc, and if it's unclear, raise an issue or Slack the team.

**Start coding Week 1 backend setup. Godspeed! 🚀**

---

**Documentation Version:** 1.1  
**Last Updated:** June 20, 2026  
**Next Review:** After Week 4 (MVP features locked in)
**Note:** 07_SYSTEM_ANALYSIS_REPORT.md added for comprehensive system health overview
