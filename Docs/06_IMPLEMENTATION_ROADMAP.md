# Implementation Roadmap — Theolan Aluminium International Ltd

**Version:** 1.0  
**Duration:** 8 weeks (MVP), 4 weeks (Polish & Launch)  
**Team Size:** 2-3 developers (1 backend, 1-2 frontend)  
**Status:** Ready to Execute

---

## Phase Overview

### Phase 1: MVP Foundation (Weeks 1-8) — 8 Story Points per Week

Core client-facing functionality + admin tools for operations. Deliverable: Fully functional web app with booking, order tracking, and internal management.

### Phase 2: Polish & Launch (Weeks 9-12) — 6-8 Story Points per Week

Performance optimization, testing automation, admin analytics, mobile refinement, deployment pipeline.

---

## Week 1: Backend Setup & Authentication

**Goal:** Establish backend infrastructure, database, authentication flow.

**Epics & Stories:**

| Story | Title | Effort | Owner | Acceptance Criteria |
|-------|-------|--------|-------|------------------|
| TASK-101 | Initialize Node.js Express app | 3 points | Backend | Express server running, middleware stack configured, .env setup |
| TASK-102 | PostgreSQL setup & migrations | 3 points | Backend | Database created, all tables migrated, indexes applied, seed data loaded |
| TASK-103 | User authentication (signup) | 5 points | Backend | Phone/email signup, password hashing, OTP generation, user record created |
| TASK-104 | User authentication (login) | 5 points | Backend | JWT token generation, refresh token logic, password verification |
| TASK-105 | OTP verification flow | 3 points | Backend | OTP validation, expiry checks, phone verification flag set |
| TASK-106 | JWT middleware & role checks | 3 points | Backend | Auth middleware validates tokens, role-based authorization working |

**Deliverable:** Backend can authenticate users, issue tokens, manage sessions.

**Testing:**
- Unit tests: Password hashing, JWT generation
- Integration tests: Auth flow end-to-end (signup → OTP → login)

---

## Week 2: Booking System (Backend + Frontend)

**Goal:** Full booking flow from form submission to confirmation.

**Epics & Stories:**

| Story | Title | Effort | Owner | Acceptance Criteria |
|-------|-------|--------|-------|------------------|
| TASK-201 | Booking form validation (Zod) | 3 points | Frontend | Form validates phone, date, service type; shows inline errors |
| TASK-202 | Multi-step booking UI (4 screens) | 5 points | Frontend | Steps render correctly, progress bar works, back/next buttons functional |
| TASK-203 | Time slot availability endpoint | 5 points | Backend | GET /api/v1/bookings/available-slots returns next 7 days, correctly filters taken slots |
| TASK-204 | Create booking endpoint | 5 points | Backend | POST /api/v1/bookings creates record, marks slot unavailable, returns reference number |
| TASK-205 | SMS confirmation (Africa's Talking) | 5 points | Backend | Integration test: SMS sent after booking, client receives confirmation within 2 seconds |
| TASK-206 | Booking confirmation page | 3 points | Frontend | Displays reference #, date, technician (if assigned), next steps CTA |

**Deliverable:** Client can book site visits end-to-end.

**Testing:**
- E2E test: Fill form → submit → receive SMS confirmation
- Load test: Simulate 50 concurrent booking submissions

---

## Week 3: Quote Estimator & Product Catalogue

**Goal:** Pricing engine + public product gallery.

**Epics & Stories:**

| Story | Title | Effort | Owner | Acceptance Criteria |
|-------|-------|--------|-------|------------------|
| TASK-301 | Product rates seeding (seed data) | 2 points | Backend | All products, categories, finishes loaded with pricing |
| TASK-302 | Quote calculator endpoint | 5 points | Backend | POST /api/v1/quote calculates price with multipliers, returns ±8-10% range |
| TASK-303 | Quote calculator UI | 5 points | Frontend | Product selector, dimension inputs, live price update, breakdown display |
| TASK-304 | Product gallery endpoint | 3 points | Backend | GET /api/v1/products filters by category/finish, returns paginated results |
| TASK-305 | Product gallery UI | 5 points | Frontend | Gallery grid, category/finish chips, search, sort; responsive images |
| TASK-306 | Product detail modals | 3 points | Frontend | Click product → modal shows full spec, pricing, typical room size |

**Deliverable:** Clients can view products, get instant quotes, explore gallery.

**Testing:**
- Unit test: Quote calculation logic (multipliers, rounding)
- E2E test: Filter gallery → select product → get quote
- Performance test: Gallery loads in <2 seconds with 50+ images

---

## Week 4: Client Account & Authentication (Frontend)

**Goal:** Client login/signup on frontend, profile management.

**Epics & Stories:**

| Story | Title | Effort | Owner | Acceptance Criteria |
|-------|-------|--------|-------|------------------|
| TASK-401 | Login page (phone-first) | 3 points | Frontend | Phone input with +254 prefix, password input, toggle to email, error handling |
| TASK-402 | Signup page (with OTP) | 3 points | Frontend | Phone/name inputs, password requirements displayed, OTP entry modal |
| TASK-403 | OTP verification UI | 2 points | Frontend | Auto-advancing 4-digit input, resend timer, error messages |
| TASK-404 | Forgot password flow | 3 points | Frontend | Phone entry → OTP → new password entry, inline validation |
| TASK-405 | Client profile page | 3 points | Frontend | Display user info (phone, name, email), edit capability, save to backend |
| TASK-406 | Client security settings | 2 points | Frontend | Change password form, phone verification status, session management |
| TASK-407 | API client setup (React Query) | 3 points | Frontend | Centralized axios instance, JWT interceptors, error handling, retry logic |

**Deliverable:** Clients can create accounts, log in, manage profiles.

**Testing:**
- E2E test: Full signup flow (phone → OTP → profile creation)
- E2E test: Login flow with invalid/valid credentials
- Unit test: Form validation schemas (Zod)

---

## Week 5: Client Order Tracking & Payment

**Goal:** Order management for clients, M-Pesa payment integration.

**Epics & Stories:**

| Story | Title | Effort | Owner | Acceptance Criteria |
|-------|-------|--------|-------|------------------|
| TASK-501 | Order creation endpoint | 5 points | Backend | POST /api/v1/orders creates with confirmed status, calculates price, assigns tech if available |
| TASK-502 | Order listing endpoint (client) | 3 points | Backend | GET /api/v1/orders returns client's orders, filterable by status, paginated |
| TASK-503 | Order detail endpoint (with timeline) | 3 points | Backend | GET /api/v1/orders/{id} includes order_events timeline, payment status |
| TASK-504 | M-Pesa STK Push initiator | 5 points | Backend | POST /api/v1/payments/initiate-stk calls Safaricom Daraja API, returns checkout ID |
| TASK-505 | M-Pesa webhook handler | 5 points | Backend | POST /api/v1/payments/mpesa-callback processes Safaricom callback, updates payment_status, sends SMS |
| TASK-506 | Client order tracking UI | 5 points | Frontend | List orders with status stepper, payment badges, click to view timeline |
| TASK-507 | Order detail timeline UI | 3 points | Frontend | Render timeline events with dates, milestone descriptions, payment status |
| TASK-508 | Payment trigger UI | 3 points | Frontend | "Pay Deposit" button → M-Pesa prompt → confirmation SMS shown |

**Deliverable:** Clients can place orders, track progress, pay deposits via M-Pesa.

**Testing:**
- Integration test: Booking → Order creation → Payment flow
- Test M-Pesa sandbox: Initiate STK Push, verify callback processing
- E2E test: Full order lifecycle (quoted → confirmed → fabrication → ready → installed)

---

## Week 6: Admin Order Management

**Goal:** Admin tools for order lifecycle, technician assignment.

**Epics & Stories:**

| Story | Title | Effort | Owner | Acceptance Criteria |
|-------|-------|--------|-------|------------------|
| TASK-601 | Admin order listing endpoint | 3 points | Backend | GET /api/v1/admin/orders returns all orders, filterable, with metrics aggregates |
| TASK-602 | Order status transition endpoint | 3 points | Backend | PATCH /api/v1/admin/orders/{id} updates status, appends timeline event, validates state machine |
| TASK-603 | Technician assignment endpoint | 2 points | Backend | PATCH /api/v1/admin/orders/{id} assigns technician_id, sends notification |
| TASK-604 | Order detail modal (admin) | 4 points | Frontend | Show order, current status, timeline, reassign tech dropdown, add milestone form |
| TASK-605 | Admin orders table | 5 points | Frontend | List view with columns (client, product, status, price, payment status, tech), inline status edit |
| TASK-606 | Status filter & search | 3 points | Frontend | Filter by status/payment/tech, search by order reference or client name |
| TASK-607 | Generate invoice/PDF endpoint | 5 points | Backend | POST /api/v1/admin/invoices generates PDF with order details, terms, signature line |

**Deliverable:** Admins can manage order lifecycle, assign technicians, generate invoices.

**Testing:**
- E2E test: Admin views orders → changes status → timeline updates → client sees it
- Performance test: Load test with 500+ orders, ensure filtering responsive

---

## Week 7: Admin Booking Calendar & CRM

**Goal:** Calendar for site visits, client relationship management.

**Epics & Stories:**

| Story | Title | Effort | Owner | Acceptance Criteria |
|-------|-------|--------|-------|------------------|
| TASK-701 | Booking calendar endpoint (week view) | 5 points | Backend | GET /api/v1/admin/bookings-calendar returns visits for date range, includes technician colors |
| TASK-702 | Reschedule booking endpoint | 3 points | Backend | PATCH /api/v1/bookings/{id} updates scheduled_at, sends SMS to client |
| TASK-703 | Admin calendar UI (week view) | 5 points | Frontend | Week grid, visits as colored blocks by tech, click to detail, drag-to-reschedule (optional Phase 2) |
| TASK-704 | Technician filter chips | 2 points | Frontend | Toggle techs on/off to filter calendar, shows workload metrics |
| TASK-705 | CRM clients endpoint | 3 points | Backend | GET /api/v1/admin/clients returns clients with status, LTV, last contact, order count |
| TASK-706 | Client detail endpoint | 3 points | Backend | GET /api/v1/admin/clients/{id} includes order history and all notes |
| TASK-707 | Add client note endpoint | 2 points | Backend | POST /api/v1/admin/clients/{id}/notes creates note entry |
| TASK-708 | CRM client list UI | 5 points | Frontend | Table with status pills, LTV sorting, last contact date, search by name/phone |
| TASK-709 | Client detail panel | 4 points | Frontend | Full record, order history, notes accumulator, inline note addition |

**Deliverable:** Admins can manage site visit calendar, maintain client relationships via CRM.

**Testing:**
- E2E test: Reschedule booking → client receives SMS → calendar updates
- E2E test: Admin adds note to client → note appears in CRM record

---

## Week 8: Admin Gallery Manager & Polish

**Goal:** Complete admin tooling, final MVP features.

**Epics & Stories:**

| Story | Title | Effort | Owner | Acceptance Criteria |
|-------|-------|--------|-------|------------------|
| TASK-801 | Gallery upload endpoint | 5 points | Backend | POST /api/v1/gallery uploads to Cloudinary, saves metadata, defaults to published=false |
| TASK-802 | Gallery publish/unpublish | 2 points | Backend | PATCH /api/v1/gallery/{id} toggles published flag |
| TASK-803 | Gallery delete | 1 point | Backend | DELETE /api/v1/gallery/{id} removes from Cloudinary and database |
| TASK-804 | Gallery manager UI | 5 points | Frontend | Photo grid with upload tile, each card shows published status, category, finish, edit/delete buttons |
| TASK-805 | Gallery edit modal | 3 points | Frontend | Category/finish reassignment, publish toggle, delete confirmation |
| TASK-806 | Client dashboard layout | 4 points | Frontend | Sidebar with nav (orders, bookings, account), responsive mobile menu |
| TASK-807 | Admin dashboard layout | 4 points | Frontend | Sidebar with nav (orders, calendar, clients, gallery, analytics), responsive menu |
| TASK-808 | Error boundaries & error pages | 3 points | Frontend | 404, 403, 401, 500 pages, error boundary components |
| TASK-809 | Loading spinners & skeletons | 3 points | Frontend | Consistent loading states across all pages |
| TASK-810 | Manual testing & bug fixes | 5 points | Full Team | QA pass, browser compatibility (Chrome, Safari, Firefox), mobile responsiveness check |

**Deliverable:** MVP feature-complete (all 8 week stories done), ready for testing.

**Testing:**
- Full regression test suite
- Manual E2E flows (signup → booking → order → payment)
- Mobile responsiveness QA

---

## Week 9-12: Phase 2 — Polish, Testing, Launch Prep

### Week 9: Automated Testing & Performance

| Story | Title | Effort | Owner | Acceptance Criteria |
|-------|-------|--------|-------|------------------|
| TASK-901 | Unit tests (backend services) | 8 points | Backend | Auth, Quote, Payment services 80%+ coverage |
| TASK-902 | Integration tests (API routes) | 8 points | Backend | Auth, Booking, Order, Payment flows tested |
| TASK-903 | E2E tests (critical user flows) | 6 points | Frontend | Signup, Booking, Order tracking, Admin order management |
| TASK-904 | Performance testing (k6 load test) | 5 points | Full Team | Quote endpoint handles 100 req/sec, Booking form < 2s load, Order list < 1s |
| TASK-905 | React Query optimization | 3 points | Frontend | Caching strategies, invalidation on mutations, prefetching |
| TASK-906 | Lighthouse audit & optimization | 4 points | Frontend | Target: 90+ Performance, 95+ Accessibility, 90+ Best Practices |

**Deliverable:** Automated tests passing, performance benchmarks met.

---

### Week 10: Admin Analytics & Advanced Features

| Story | Title | Effort | Owner | Acceptance Criteria |
|-------|-------|--------|-------|------------------|
| TASK-1001 | Analytics dashboard (revenue) | 5 points | Full Team | Total revenue, revenue by product/tech, payment status breakdown, trend chart |
| TASK-1002 | Analytics dashboard (bookings) | 4 points | Full Team | Completion rate, no-show rate, technician utilization, busiest days |
| TASK-1003 | Analytics dashboard (orders) | 4 points | Full Team | Order funnel, avg fabrication time, repeat customer rate |
| TASK-1004 | Admin settings page | 3 points | Frontend | M-Pesa config, email templates, admin user management |
| TASK-1005 | Audit log (system events) | 3 points | Backend | Log order state changes, payments, user actions, query via admin UI |
| TASK-1006 | Email integration (SendGrid) | 4 points | Backend | Quotation PDFs emailed, order status emails, admin alerts |
| TASK-1007 | SMS template management | 2 points | Backend | Admin configurable booking, payment, order update SMS templates |

**Deliverable:** Admin analytics, email/SMS templating, audit logging.

---

### Week 11: Mobile Optimization & Deployment Prep

| Story | Title | Effort | Owner | Acceptance Criteria |
|-------|-------|--------|-------|------------------|
| TASK-1101 | Mobile-first form refinements | 4 points | Frontend | Touch-friendly inputs, optimized keyboard display, proper spacing |
| TASK-1102 | Responsive design audit | 3 points | Frontend | All pages tested on iPhone 12, iPad, Android (Pixel 6), no layout breaks |
| TASK-1103 | PWA setup (optional, Phase 2+) | 3 points | Frontend | Service worker for offline support, installable, push notifications ready |
| TASK-1104 | Environment config management | 2 points | Backend | .env setup for dev/staging/production, secrets manager setup |
| TASK-1105 | CI/CD pipeline (GitHub Actions) | 5 points | DevOps | Auto-run tests on PR, lint checks, build frontend, deploy to staging on merge to main |
| TASK-1106 | Docker containerization (optional) | 3 points | DevOps | Backend & frontend Docker images, docker-compose for local dev |
| TASK-1107 | Deployment to production (Vercel + Railway) | 4 points | DevOps | Frontend on Vercel, backend on Railway, database backups configured, monitoring setup |

**Deliverable:** Mobile-optimized, CI/CD pipeline, ready for production deployment.

---

### Week 12: Final Testing, Monitoring, Launch

| Story | Title | Effort | Owner | Acceptance Criteria |
|-------|-------|--------|-------|------------------|
| TASK-1201 | UAT (user acceptance testing) | 8 points | Full Team | Test all 8-week MVP features with stakeholder, document feedback |
| TASK-1202 | Security audit & penetration testing (external) | 5 points | External | No OWASP Top 10 vulnerabilities, SQL injection/XSS tests pass |
| TASK-1203 | Performance baseline & monitoring setup | 4 points | DevOps | Datadog/NewRelic configured, alerting rules set, error tracking enabled |
| TASK-1204 | Documentation (README, deployment guide) | 3 points | Full Team | Setup instructions, API docs, deployment runbook, troubleshooting guide |
| TASK-1205 | Go/No-Go checklist & launch | 3 points | Lead | Final sign-off, production deploy, monitoring verification, stakeholder notification |
| TASK-1206 | Post-launch support (on-call, bug fixes) | 8 points | Full Team | 24/7 support window, hot-fix any critical issues |

**Deliverable:** Production-ready, launched, monitored, documented.

---

## Dependency Graph

```
Week 1 (Backend Setup) ─┐
                        ├─→ Week 2 (Booking)
                        └─→ Week 3 (Quote)
Week 2 (Booking) ───────→ Week 4 (Client Auth)
                        ├─→ Week 5 (Order + Payment)
                        └─→ Week 6 (Admin Orders)
Week 5 (Order + Payment)─→ Week 6 (Admin Orders)
Week 6 (Admin Orders) ──→ Week 7 (Calendar + CRM)
Week 7 (Calendar + CRM) → Week 8 (Gallery + Polish)

Weeks 1-8 (MVP) ────────→ Weeks 9-12 (Phase 2: Polish, Test, Launch)
```

---

## Team & Roles

### Backend Developer (1 FTE)
- Weeks 1-8: API endpoints, database, auth, payments, integrations
- Weeks 9-12: API tests, performance optimization, deployment

**Skills:** Node.js, Express, PostgreSQL, REST API design, M-Pesa/Africa's Talking APIs, JWT

### Frontend Developer(s) (1-2 FTE)
- Weeks 1-8: UI components, forms, pages, state management
- Weeks 9-12: E2E tests, performance optimization, mobile refinement

**Skills:** React, Tailwind CSS, React Router, React Query, Zod validation, React Hook Form

### DevOps / Full-Stack Lead (0.5 FTE)
- Weeks 1-8: Environment setup, database migrations, CI/CD foundation
- Weeks 9-12: Full CI/CD pipeline, Docker, deployment, monitoring

**Skills:** Docker, GitHub Actions, Railway/AWS, PostgreSQL, shell scripting

---

## Tools & Infrastructure

### Development

- **IDE:** VSCode / Zed (configured with ESLint, Prettier, TypeScript)
- **Version Control:** Git + GitHub (feature branches, PR reviews)
- **Package Management:** npm (yarn optional)
- **Testing:** Jest (backend), Vitest (frontend), React Testing Library, Supertest

### Staging & Production

- **Frontend Hosting:** Vercel (automatic deployments from main branch)
- **Backend Hosting:** Railway or AWS EC2
- **Database:** PostgreSQL managed (Railway, AWS RDS, or DigitalOcean)
- **File Storage:** Cloudinary (images)
- **Email:** SendGrid
- **SMS:** Africa's Talking (production) / Safaricom Daraja (M-Pesa)
- **Monitoring:** Datadog or New Relic
- **Error Tracking:** Sentry

---

## Definition of Done

Each story is **done** when:

1. ✅ Code written & reviewed (peer reviewed via PR)
2. ✅ Tests passing (unit + integration tests)
3. ✅ No linter warnings (ESLint, Prettier)
4. ✅ Manual testing completed
5. ✅ Documentation updated (README, inline comments)
6. ✅ Merged to `main` branch
7. ✅ Deployed to staging environment
8. ✅ Stakeholder sign-off (if applicable)

---

## Risk Mitigation

### Risk: M-Pesa API Integration Complexity
**Mitigation:** Start with Safaricom sandbox in Week 5, allocate 1-2 day buffer, have fallback manual payment entry form.

### Risk: Database Migration Issues
**Mitigation:** Use Knex.js migrations with version control, test migrations on staging first, have rollback plan.

### Risk: Scope Creep
**Mitigation:** Strict MVP scope (8 weeks), defer Phase 2+ features to after MVP launch, use Jira to track scope requests.

### Risk: Team Member Unavailability
**Mitigation:** Pair programming on critical paths, documentation, modular architecture for parallel work.

### Risk: Third-Party API Downtime
**Mitigation:** Cloudinary failover (alternative file storage), M-Pesa fallback (manual payment entry), Africa's Talking failover (email notifications).

---

## Success Criteria (MVP Launch)

By end of Week 8:

✅ All 8-week user stories completed & tested  
✅ Client can: sign up → book visit → get quote → place order → track progress → pay via M-Pesa  
✅ Admin can: manage orders → assign technicians → update timelines → upload gallery → manage CRM  
✅ Zero critical bugs, <5 known minor issues  
✅ Lighthouse score >85 on mobile  
✅ Mobile responsiveness QA passed  
✅ Production environment configured  
✅ Documentation complete  

By end of Week 12 (Launch):

✅ Full test suite passing (unit + integration + E2E)  
✅ Performance benchmarks met (p95 <500ms, p99 <1s)  
✅ Security audit cleared  
✅ Monitoring & alerting live  
✅ Deployed to production  
✅ Team trained on operations & support  
✅ Stakeholder sign-off  

---

## Next Steps

1. **Week 1 Kickoff:** Confirm team, set up dev environments, provision infrastructure
2. **Daily Standups:** 15min sync (9am), async updates in Slack
3. **Weekly Demos:** Friday 2pm, show working features to stakeholder
4. **Retros:** Weekly 30-min team reflection, adjust next week's plan
5. **Blocking Issues:** Escalate within 24h if a story is stuck

---

**Status:** Roadmap finalized and ready for execution. All documentation prepared. Begin Week 1 backend setup.
