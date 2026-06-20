# THEOLAN ALUMINIUM INTERNATIONAL LTD — SYSTEM ANALYSIS DOCUMENT

**Project:** OlanAlumint.web  
**Client:** Theolan Aluminium International Ltd  
**Status:** MVP Development Phase  
**Date:** June 2026  
**Analyst:** Full-Stack System Engineer

---

## EXECUTIVE SUMMARY

**Project Overview:**  
Theolan Aluminium International Ltd is a Kenyan aluminium fabrication & supply company (Nairobi-based) specializing in custom windows, doors, curtain walls, partitions, and architectural glazing systems. The proposed web application digitizes their entire business workflow: client onboarding → site survey booking → design gallery → instant quote estimation → order tracking → admin management.

**Current Maturity Level:** 0 (Greenfield — design-stage, no code)

**Key Objectives:**
1. Transition from Facebook-only presence to professional web platform
2. Enable 24/7 online booking and quote requests
3. Replace manual quotation process with instant estimator
4. Provide clients real-time order tracking
5. Equip admin team with operational dashboards (orders, gallery, CRM, technician scheduling)
6. Integrate M-Pesa for deposit payments (Kenya-specific)
7. Enable SMS/WhatsApp notifications via Africa's Talking

**Top 3 Priorities (MVP):**
1. Client booking → payment deposit → order tracking (full pipeline)
2. Admin order management + technician calendar
3. Product gallery + instant quote estimator

**Estimated Effort to MVP:** 8–12 weeks (2–3 developers, full-time)

---

## CURRENT STATE AUDIT

### 1. **Project Scope & Maturity**

**Status:** Pre-development (design & requirements complete)

- **Existing Assets:** UI mockups, design system, feature list, tech stack recommendation
- **Missing Code:** 0% implemented (greenfield build)
- **Documentation:** Design mockups + written specs provided
- **Team:** Designer (completed mockups), Developer(s) needed (TBD)

### 2. **Technology Stack (Recommended)**

#### Frontend
- **Framework:** React.js (with Hooks)
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **State Management:** React Context API (booking, auth, orders) + localStorage for cart/draft quotes
- **HTTP Client:** Axios or React Query
- **Form Handling:** React Hook Form
- **Validation:** Zod
- **Components:** Custom component library (no shadcn—all designed from scratch per brand)
- **Deployment:** Vercel (frontend only)

#### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **API Style:** REST (JSON)
- **Authentication:** JWT + refresh tokens
- **Database:** PostgreSQL (relational, structured order/booking data)
- **Image Storage:** Cloudinary (for gallery photos) or AWS S3
- **Hosting:** Railway.app or AWS EC2 (backend API)

#### Integrations
- **Payments:** Safaricom Daraja API (M-Pesa STK Push for deposits)
- **SMS/WhatsApp:** Africa's Talking API (booking confirmations, order updates)
- **Email:** SendGrid (formal quotations, account notifications)
- **PDF Generation:** Puppeteer or ReportLab (quotation PDFs)
- **Domain:** .co.ke (Kenyan domain)

#### Database
- **Primary:** PostgreSQL (orders, bookings, clients, payments)
- **Caching:** Redis (optional, for quote estimator performance)
- **File Storage:** Cloudinary (images) or S3 (media)

### 3. **Feature Completeness Assessment**

| Feature | Status | Coverage |
|---------|--------|----------|
| Account Registration (phone/email/Google) | Planned | 100% |
| OTP Verification | Planned | 100% |
| Booking Scheduler (date/time picker) | Planned | 100% |
| Instant Quote Estimator | Planned | 100% |
| Product Gallery (filtered, live search) | Planned | 100% |
| Order Tracking Dashboard (client view) | Planned | 100% |
| Admin Order Management Panel | Planned | 100% |
| Technician Booking Calendar | Planned | 100% |
| Gallery Manager + Client CRM | Planned | 100% |
| M-Pesa Payment Integration | Planned | 100% |
| SMS/WhatsApp Notifications | Planned | 100% |
| PDF Quotation Generator | Planned | 100% |
| Analytics Dashboard (revenue, bookings) | Planned | 0% (Phase 2) |
| Multi-language Support | Not Planned | 0% |
| **Overall Feature Completeness** | **MVP Ready** | **~90%** |

### 4. **Architecture Assessment**

**Proposed Architecture Style:** Layered (3-tier) with clear separation

```
┌─────────────────────────────────────┐
│       CLIENT LAYER (React)          │
│  - Pages, Components, Forms         │
│  - State (Context + localStorage)   │
│  - HTTP requests via Axios          │
└──────────────┬──────────────────────┘
               │ REST API (JSON)
┌──────────────▼──────────────────────┐
│    API LAYER (Express.js)           │
│  - Routes, Controllers              │
│  - Middleware (auth, validation)    │
│  - Business Logic, Payment flows    │
└──────────────┬──────────────────────┘
               │ SQL queries
┌──────────────▼──────────────────────┐
│   DATA LAYER (PostgreSQL)           │
│  - Tables: users, bookings, orders  │
│  - Relationships, constraints       │
│  - Indexes for performance          │
└─────────────────────────────────────┘
```

**Key Design Patterns:**
- **Authentication:** JWT (stateless, suitable for REST)
- **Order Pipeline:** State machine (Quoted → Confirmed → Fabrication → Ready → Installed)
- **Quote Estimation:** Server-side pricing logic (rates table, live recalc)
- **Notifications:** Event-driven (order status change → trigger SMS via Africa's Talking)

### 5. **Design System Assessment**

**Palette (Per Designs):**
- **Primary Background:** Deep charcoal (#1A1F26) — dark, professional
- **Primary Accent:** Electric cobalt (#0055CC) — CTAs, active states
- **Secondary Accent:** Burnished gold (#B8872A) — premium finishes, highlights
- **Neutral (Text):** Warm white (#F5F4F0) — body text on dark
- **Neutral (Borders):** Brushed steel silver (#C8D0D9) — dividers, subtle elements

**Typography (Per Designs):**
- **Headings:** Cormorant Garant (architectural, structural, premium)
- **Body:** DM Sans (clean, legible, mobile-optimized)
- **No serif/cream/terracotta:** Strictly charcoal/cobalt/gold palette

**Component Library (To Build):**
- Buttons (primary, secondary, ghost)
- Form inputs (text, phone, password, select)
- Cards (product, order, testimonial)
- Modals/Drawers (booking form, quote details)
- Stepper (booking flow)
- Tables (admin: orders, clients, gallery)
- Chips/Tags (filters, status badges)
- Calendar widget (booking scheduler, admin calendar)

### 6. **User Journey Assessment**

**Client Flow (Happy Path):**
1. **Homepage** → Browse, see CTA "Book consultation"
2. **Register/Login** → Phone-first, OTP verification
3. **Booking Form** → Service type, property, location, date/time
4. **Confirmation** → SMS + email receipt, reference number
5. **Quote Estimator** → Input dimensions, get ballpark KES price
6. **Product Gallery** → Filter by type/finish, see project photos
7. **Order Tracking Dashboard** → View order status, milestones, payment
8. **Account Dashboard** → Manage bookings, previous orders, profile

**Admin Flow (Happy Path):**
1. **Login** → Admin-only authentication
2. **Order Management** → View all orders, update status inline, track payments
3. **Booking Calendar** → View technician schedule, assign visits, reschedule
4. **Gallery Manager** → Upload photos, categorize by product/finish, publish/draft
5. **Client CRM** → View all clients, contact history, repeat client status
6. **Analytics (Phase 2)** → Revenue, bookings this month, popular products

### 7. **Technical Debt & Risk Assessment**

**Risks (Low Risk for Greenfield):**
- **Database concurrency:** Multiple admins editing same order simultaneously (mitigation: optimistic locking)
- **Payment security:** M-Pesa integration must follow PCI compliance (use Safaricom Daraja securely)
- **Image handling:** Large gallery uploads need async processing (queue + background job)
- **SMS cost:** Africa's Talking charges per SMS; set notification preferences to control spam
- **Technician conflicts:** Overbooking same technician (mitigation: validation in booking form)

**Compliance & Security Considerations:**
- **Data Privacy:** GDPR-adjacent (client data stored, right to deletion)
- **Payment:** PCI DSS (M-Pesa STK Push is tokenized, but handle carefully)
- **SMS Consent:** Explicitly capture opt-in for notifications at signup
- **SSL/TLS:** All traffic HTTPS; .co.ke domain + SSL cert required

---

## GAP ANALYSIS

### 1. **Requirements vs. Implementation**

All core features are **spec'd but not yet coded**.

| Feature | Specified | Implemented | Gap |
|---------|-----------|-------------|-----|
| Client registration (phone/email) | ✅ Yes | ❌ No | Build auth system |
| OTP verification | ✅ Yes | ❌ No | Integrate Twilio/Africa's Talking |
| Booking scheduler | ✅ Yes | ❌ No | Build calendar widget + slot management |
| Quote estimator | ✅ Yes | ❌ No | Build pricing engine, rate tables |
| Product gallery | ✅ Yes | ❌ No | Build catalog, filter UI, photo uploads |
| Order tracking | ✅ Yes | ❌ No | Build status pipeline, timeline |
| Admin orders panel | ✅ Yes | ❌ No | Build table, status editor, detail modal |
| Technician calendar | ✅ Yes | ❌ No | Build week-view calendar, assignments |
| Gallery manager | ✅ Yes | ❌ No | Build photo management UI |
| Client CRM | ✅ Yes | ❌ No | Build client table, notes, order history |
| M-Pesa payments | ✅ Yes | ❌ No | Integrate Daraja API, handle callbacks |
| SMS notifications | ✅ Yes | ❌ No | Integrate Africa's Talking API |
| **Overall Gap** | **100%** | **0%** | **Full build required** |

### 2. **Architecture Gaps**

- ❌ No database schema designed yet
- ❌ No API contract/OpenAPI spec
- ❌ No authentication flow documented
- ❌ No payment flow diagram
- ❌ No notification/email templates
- ❌ No error handling strategy

**Mitigation:** These will be addressed in System Architecture, API Contract, and Database Schema documents.

### 3. **Code Quality Gaps (Preventive)**

- ❌ No linter/formatter config (add ESLint + Prettier)
- ❌ No testing framework (add Jest + React Testing Library)
- ❌ No TypeScript (add TS to backend + frontend)
- ❌ No environment management (.env templates)
- ❌ No CI/CD pipeline (add GitHub Actions)

### 4. **Non-Functional Gaps**

| Area | Requirement | Gap | Mitigation |
|------|-------------|-----|-----------|
| Performance | Booking form <2s load time | ❌ TBD | Test on 3G, optimize images |
| Security | HTTPS, JWT auth, input validation | ❌ TBD | Use middleware, Zod schemas |
| Reliability | 99.5% uptime (business hours) | ❌ TBD | Staging env, smoke tests, monitoring |
| Scalability | Support 1,000 concurrent users | ❌ TBD | PostgreSQL indexes, caching layer |
| Mobile | Responsive design (iOS/Android) | ✅ Mobile-first design provided | Build & test on devices |
| Accessibility | WCAG 2.1 AA compliance | ⚠️ Partial (design provided, code TBD) | Audit component library |

### 5. **DevOps/Infrastructure Gaps**

- ❌ No Docker containers defined
- ❌ No database backup strategy
- ❌ No monitoring/logging (add Sentry, LogRocket)
- ❌ No staging environment
- ❌ No deployment runbook

---

## QUALITY & ARCHITECTURE REVIEW

### 1. **Design Pattern Compliance**

**SOLID Principles Assessment (Planned Code):**

- **Single Responsibility:** Each component (Booking, Quote, Order) will have isolated state management
- **Open/Closed:** API routes parameterized for extensibility (filters, pagination)
- **Liskov Substitution:** Payment providers (M-Pesa, card) follow same interface
- **Interface Segregation:** Separate endpoints for client vs. admin operations
- **Dependency Inversion:** Controllers depend on services, not directly on database

### 2. **Security Posture (CIA Triad)**

**Confidentiality:**
- ✅ JWT tokens expire (15 min access, 7-day refresh)
- ✅ Phone numbers masked in admin logs
- ✅ Payment data never stored locally (PCI compliance)
- ⚠️ Images in gallery are public (design intent)
- ❌ TBD: Email encryption at rest

**Integrity:**
- ✅ All user inputs validated (Zod schemas)
- ✅ Order status transitions guarded (state machine)
- ✅ Payment amounts verified server-side
- ⚠️ TBD: Order event audit log

**Availability:**
- ✅ Stateless API (scales horizontally)
- ⚠️ TBD: Rate limiting on booking form (prevent spam)
- ⚠️ TBD: Database failover / backup strategy
- ⚠️ TBD: SMS fallback if Africa's Talking down

### 3. **Performance Bottlenecks (Expected)**

| Component | Risk | Mitigation |
|-----------|------|-----------|
| Product gallery (18+ products, filters live) | Large JSON payload on filter change | Paginate, lazy-load images |
| Quote estimator (real-time recalc) | 100s of dimension changes = 100s of API calls | Debounce input (500ms), cache rates server-side |
| Order tracking (timeline fetch) | Timeline has 10+ events per order, many orders | Index order_id in order_events table, paginate timeline |
| Admin orders table (6+ columns, 1000s of orders) | Table scan slow, sorting slow | Add database indexes, implement server-side pagination |
| Image uploads (admin gallery) | Large files, slow network (Kenyan 3G) | Compress on client, resize on server, async queue |

### 4. **Technical Debt Prevention**

**Preventive Measures (Built-in from Day 1):**

1. **Code organization:** Feature-based folder structure (features/booking, features/orders, etc.)
2. **Component naming:** Consistent conventions (use [ComponentName].tsx, [index].ts patterns)
3. **API versioning:** Routes prefixed /api/v1 (future-proof)
4. **Error handling:** Standardized error response format (code + message)
5. **Logging:** Structured logs with correlation IDs for debugging

### 5. **Maintainability Score: 8/10 (Design-Stage)**

**Strengths:**
- Clear feature separation (booking, orders, admin are distinct)
- Design system provided (consistent UI, no free-styling)
- User flows documented with screenshots
- Tech stack is modern & popular (React, Node, PostgreSQL)

**Weaknesses:**
- No database schema vet'd by DBA yet
- No performance budgets defined
- No automated testing strategy in place (to be added)
- No documentation templates for code comments

---

## IMPROVEMENT ROADMAP

### **Phase 1: MVP (Weeks 1–8)**

**Priority 1: Authentication & Data Layer** (Weeks 1–2)
- [ ] Set up PostgreSQL, design core schema (users, bookings, orders, products)
- [ ] Build JWT auth (login, signup, OTP via Africa's Talking)
- [ ] Create Express middleware (auth, error handling, validation)
- [ ] Test auth flow end-to-end (phone signup → OTP → dashboard)

**Priority 2: Client Booking Flow** (Weeks 2–4)
- [ ] Build booking form UI (4-step: service, date, contact, confirm)
- [ ] Implement date/time picker + slot availability logic
- [ ] Integrate M-Pesa STK Push for deposit (Safaricom Daraja)
- [ ] Send booking confirmation SMS (Africa's Talking)
- [ ] Client receives reference number, can view booking in dashboard

**Priority 3: Quote Estimator & Gallery** (Weeks 3–5)
- [ ] Build quote estimator (product selector, dimension inputs, live calc)
- [ ] Design pricing rate table, populate with Kenyan market rates
- [ ] Build product gallery (filter by type/finish, search, pagination)
- [ ] Upload project photos to Cloudinary, integrate in gallery
- [ ] Create "custom design" request flow from gallery

**Priority 4: Order Tracking & Admin Orders Panel** (Weeks 4–6)
- [ ] Build client order tracking dashboard (status stepper, timeline)
- [ ] Build admin order management table (inline status edit, search, filters)
- [ ] Implement order status state machine (Quoted → Confirmed → Fabrication → Ready → Installed)
- [ ] Add detail modals for both client and admin views
- [ ] Test status transitions + audit trail

**Priority 5: Technician Calendar & Gallery Manager** (Weeks 6–8)
- [ ] Build admin booking calendar (week view, technician color-coding)
- [ ] Implement drag-to-reschedule visits (basic MVP)
- [ ] Build gallery manager (upload photos, tag by product/finish, publish/draft)
- [ ] Build client CRM table (client list, lead/active/repeat status, order count)
- [ ] Add photo upload queue with progress feedback

**Phase 1 Deliverables:**
- ✅ Fully functional client journey: signup → booking → quote → tracking
- ✅ Fully functional admin dashboard: orders, calendar, gallery, CRM
- ✅ M-Pesa deposits + Africa's Talking SMS notifications
- ✅ Product gallery with 18+ designs, filterable by type & finish
- ✅ All pages match brand design (charcoal/cobalt/gold)
- ✅ Mobile-responsive (tested on iOS & Android)
- ✅ Staging environment + manual testing checklist

---

### **Phase 2: Polish & Analytics (Weeks 9–12)**

- Analytics dashboard (revenue this month, bookings, popular products, lead source)
- PDF quotation generator (formal quote as downloadable PDF)
- Payment history in client account (all deposits/invoices)
- Technician app (basic, mobile-optimized calendar view)
- Email notifications (formal quote, order updates)
- Appointment reminders (SMS 24h before site visit)

---

## EXECUTION CHECKLIST

✅ **Analysis Complete When:**
- [x] Current system state fully understood (greenfield, design-ready)
- [x] All major features mapped to user flows
- [x] Architecture style chosen (3-tier REST)
- [x] Security/compliance risks identified
- [x] Performance bottlenecks anticipated
- [x] Tech stack validated (React, Node, PostgreSQL, M-Pesa, Africa's Talking)
- [x] Improvement roadmap prioritized (8-week MVP, 4-week polish)
- [x] Development can begin immediately

**Next Steps:**
1. **System Architecture Doc** → Database schema, API contracts, auth flow
2. **System Design Doc** → Component specs, design tokens, responsive breakpoints
3. **Database Schema Doc** → Detailed tables, relationships, indexes
4. **API Contract Doc** → All endpoints, request/response formats
5. **Implementation Roadmap** → Task breakdown, dependencies, effort estimates

---

## APPENDIX

### A. **Stakeholder & User Personas**

**Primary Users:**
1. **Homeowners (Residential):** Browse gallery, book site visit, track order
2. **Architects/Developers (Commercial):** Request custom quotes, manage multiple projects
3. **Admin/Sales:** Manage bookings, track orders, update gallery, handle CRM

**Stakeholders:**
- Theolan Aluminium management (business owner)
- Field technicians (site survey, installation)
- Sales team (quote generation, client follow-up)
- Fabrication team (indirectly — see order status)

### B. **Competitive Analysis (Kenyan Fabrication Market)**

**Existing Competitors:** Mostly Facebook + WhatsApp (manual quotes, no online booking)  
**Advantage of OlanAlumint.web:** First-mover digital platform in Nairobi aluminium market; mobile-first design; instant quote estimator; 24/7 booking.

### C. **Success Metrics (Post-Launch)**

- Bookings/month (target: 20+ from website in month 1)
- Quote conversions (target: 40% of quotes → deposits)
- Customer satisfaction (target: >4.5/5 on Google)
- Page load time (target: <2s on 3G)
- Mobile traffic (target: >60% of sessions)

---

**Document Version:** 1.0  
**Last Updated:** June 2026  
**Next Review:** After MVP launch (Week 8)
