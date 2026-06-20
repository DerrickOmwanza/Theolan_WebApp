# Sitemap & Routing — Theolan Aluminium International Ltd

**Version:** 1.0  
**Framework:** React Router v6  
**Status:** Ready for Implementation

---

## Site Hierarchy

### Public Pages (No Authentication Required)

```
/
├── / (Homepage — hero, features, testimonials, CTA)
├── /products (Product catalogue — filterable by type/finish)
├── /gallery (Project portfolio — public photos)
├── /about (Company history, certifications, values)
├── /contact (Contact form, office details, FAQ)
├── /booking (Booking form — step 1 of 4)
│   ├── /booking?step=1 (Service selection)
│   ├── /booking?step=2 (Date/time picker)
│   ├── /booking?step=3 (Contact details)
│   ├── /booking?step=4 (Review & confirm)
│   └── /booking-confirmation (Success page, ref number)
└── /quote (Quote estimator calculator)
```

### Authentication Pages

```
/auth
├── /auth/login (Phone or email login form)
├── /auth/signup (Registration with OTP)
├── /auth/verify-otp (OTP code entry)
├── /auth/forgot-password (Password reset request)
├── /auth/reset-password (New password entry)
└── /auth/callback (OAuth redirect, if using Google Sign-In)
```

### Protected Pages (Client Dashboard) — Requires Authentication (role: client)

```
/account
├── /account/profile (Edit name, phone, email, addresses)
├── /account/settings (Preferences, notification method, language)
└── /account/security (Change password, phone verification)

/orders
├── /orders (List all client orders — filterable by status)
├── /orders/{order_id} (Order detail with timeline)
└── /orders/{order_id}/track (Installation status tracker)

/bookings
├── /bookings (List upcoming & past visits)
└── /bookings/{booking_id} (Booking detail, reschedule option)

/invoices
└── /invoices (Download past quotations/invoices as PDF)
```

### Protected Pages (Admin Dashboard) — Requires Authentication (role: admin)

```
/admin
├── /admin/dashboard (Analytics overview, KPIs)
├── /admin/orders (Order management table, filter, inline edit)
│   ├── /admin/orders/{order_id} (Order detail modal)
│   ├── /admin/orders/{order_id}/invoice (Generate PDF)
│   └── /admin/orders?status=fabrication (Pre-filtered view)
├── /admin/bookings (Calendar week view, technician assignments)
│   ├── /admin/bookings?week_offset=1 (Next week)
│   ├── /admin/bookings?technician_id=uuid (Single tech view)
│   └── /admin/bookings/{booking_id}/reschedule (Modal)
├── /admin/clients (CRM client list, status, lifetime value)
│   ├── /admin/clients/{client_id} (Client detail + notes)
│   └── /admin/clients/{client_id}/notes (Add note modal)
├── /admin/gallery (Gallery manager upload, publish, categorize)
│   ├── /admin/gallery/upload (Upload new photo)
│   ├── /admin/gallery/{photo_id} (Edit photo metadata)
│   └── /admin/gallery?category=windows (Pre-filtered)
├── /admin/technicians (Technician roster, active/inactive)
│   ├── /admin/technicians/new (Add new technician)
│   └── /admin/technicians/{tech_id} (Edit technician)
├── /admin/products (Product catalogue management)
│   ├── /admin/products/new (Add new product)
│   └── /admin/products/{product_id} (Edit product & pricing)
├── /admin/time-slots (Availability manager)
│   └── /admin/time-slots?date_range=2024-01-15_2024-01-21
├── /admin/analytics (Revenue, conversion, performance dashboards)
│   ├── /admin/analytics/revenue (Revenue trends, payment status)
│   ├── /admin/analytics/bookings (Visit completion rate, technician load)
│   ├── /admin/analytics/orders (Status distribution, conversion funnel)
│   └── /admin/analytics/clients (Lifetime value, repeat rate)
├── /admin/settings (System configuration, integrations)
│   ├── /admin/settings/payments (M-Pesa settings)
│   ├── /admin/settings/notifications (SMS/Email templates)
│   ├── /admin/settings/users (Admin user management)
│   └── /admin/settings/audit-log (System audit trail)
└── /admin/reports (Export, print, batch operations)
```

### Error & Fallback Pages

```
/errors
├── /404 (Page not found)
├── /403 (Forbidden — insufficient permissions)
├── /401 (Unauthorized — session expired)
└── /500 (Server error, contact support)

/maintenance (Scheduled maintenance page)
```

---

## Routing Configuration (React Router v6)

### Root Layout

```jsx
// src/App.jsx
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/quote" element={<QuotePage />} />
        </Route>

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/auth/verify-otp" element={<OtpPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Protected client routes */}
        <Route element={<ProtectedRoute allowedRoles={['client']} />}>
          <Route element={<ClientLayout />}>
            <Route path="/account/*" element={<AccountPages />} />
            <Route path="/orders/*" element={<OrderPages />} />
            <Route path="/bookings/*" element={<BookingPages />} />
            <Route path="/invoices" element={<InvoicesPage />} />
          </Route>
        </Route>

        {/* Protected admin routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/*" element={<AdminPages />} />
          </Route>
        </Route>

        {/* Error routes */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/401" element={<UnauthorizedPage />} />
        <Route path="/500" element={<ErrorPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Public Layout Component

```jsx
// src/layouts/PublicLayout.jsx
export function PublicLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
```

### Client Layout Component

```jsx
// src/layouts/ClientLayout.jsx
export function ClientLayout() {
  const { user } = useAuth();
  return (
    <div className="flex">
      <ClientSidebar user={user} />
      <main className="flex-1">
        <ClientHeader />
        <Outlet />
      </main>
    </div>
  );
}
```

### Admin Layout Component

```jsx
// src/layouts/AdminLayout.jsx
export function AdminLayout() {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1">
        <AdminHeader />
        <Outlet />
      </main>
    </div>
  );
}
```

### Protected Route Component

```jsx
// src/components/ProtectedRoute.jsx
export function ProtectedRoute({ allowedRoles }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
```

---

## Navigation Structure

### Header Navigation (Public Pages)

```
Logo [Home] [Products] [Gallery] [About] [Contact] [Get Quote]
                                                    [Login / Sign Up]
```

### Header Navigation (Client Dashboard)

```
Logo [Orders] [Bookings] [Account]              [Welcome, John!] [Logout]
```

### Header Navigation (Admin Dashboard)

```
Logo [Dashboard] [Orders] [Bookings] [Calendar] [Clients] [Gallery]
     [Products] [Analytics] [Settings]          [Welcome, Admin!] [Logout]
```

### Client Sidebar (Mobile Collapsible)

```
• Dashboard
• My Orders
  - All
  - In Progress
  - Completed
• My Bookings
• Profile
  - Profile Settings
  - Security
  - Addresses
  - Preferences
• Invoices
• Logout
```

### Admin Sidebar (Mobile Collapsible)

```
• Dashboard
• Orders
  - All
  - Quoted
  - Confirmed
  - Fabrication
  - Ready
  - Installed
• Booking Calendar
• Clients (CRM)
• Gallery Manager
• Products
• Technicians
• Time Slots
• Analytics
  - Revenue
  - Bookings
  - Orders
  - Clients
• Settings
  - Payments
  - Notifications
  - Admin Users
  - Audit Log
• Logout
```

---

## Breadcrumb Navigation

### Client Dashboard Examples

```
Orders > Order #ORD001 > Payment Status
Account > Profile > Edit Phone Number
Bookings > BKG001 > Reschedule
```

### Admin Dashboard Examples

```
Orders > Order #ORD001 > Assign Technician
Orders > Filter: Fabrication > Edit Status
Clients > John Doe (CRM) > View Notes
Gallery > Windows > Upload New Photo
```

---

## Query Parameters & Filters

### Orders Page

```
/orders
/orders?status=fabrication          // Filter by status
/orders?technician=uuid             // Admin: filter by assigned tech
/orders?sort=created_at&order=desc  // Sort order
/orders?limit=50&offset=100         // Pagination
/orders?search=ORD001               // Search by reference
```

### Bookings Calendar

```
/admin/bookings
/admin/bookings?week_offset=1       // Next week
/admin/bookings?week_offset=-1      // Previous week
/admin/bookings?technician_id=uuid  // Single technician
/admin/bookings?date=2024-01-15     // Specific date
```

### Gallery

```
/gallery
/gallery?category=windows           // Filter by type
/gallery?finish=black               // Filter by finish
/gallery?category=doors&finish=black // Combined filter
/gallery?search=Karen               // Search by project name
```

### Products

```
/products
/products?category=windows
/products?finish=champagne
/products?sort=price&order=asc
```

---

## Page-Level Navigation (CTAs)

### Booking Form Flow

```
Homepage [Book Site Visit CTA]
  ↓
/booking?step=1 [Service Selection]
  ↓ (Next)
/booking?step=2 [Date & Time]
  ↓ (Next)
/booking?step=3 [Contact Details]
  ↓ (Next)
/booking?step=4 [Review]
  ↓ (Confirm)
/booking-confirmation [Success Page]
  ↓ (Explore Products)
/products [Product Gallery]
  ↓ (Get Quote)
/quote [Quote Calculator]
  ↓ (Place Order)
/auth/login [If not logged in]
```

### Order Management Flow (Admin)

```
/admin/dashboard
  ↓ (Click "Manage Orders")
/admin/orders [Table View, All Orders]
  ↓ (Click Status Badge)
[Inline Modal] Update Status
  ↓ (Click Order Row)
/admin/orders/{order_id} [Detail View]
  ↓ (Click Timeline)
/admin/orders/{order_id} [Add Milestone Modal]
  ↓ (Click "Generate Invoice")
/admin/orders/{order_id}/invoice [Download PDF]
```

### CRM Client Management Flow (Admin)

```
/admin/clients [Client List, Filterable]
  ↓ (Click Client Row)
/admin/clients/{client_id} [Client Detail + Notes]
  ↓ (Click "Add Note")
[Modal] /admin/clients/{client_id}/notes
  ↓ (Click "View Orders")
/admin/orders?client_id={client_id} [Pre-filtered Orders]
```

---

## Deep Links & Shared URLs

### Client-Facing

```
https://olanallumint.co.ke/orders/ORD001
→ Direct link to order tracking page (shareable with family)

https://olanallumint.co.ke/gallery?category=windows&finish=black
→ Direct link to filtered gallery (shareable for inspiration)

https://olanallumint.co.ke/quote?product_id=uuid
→ Direct link to quote calculator for specific product
```

### Admin-Facing

```
https://admin.olanallumint.co.ke/admin/orders?status=fabrication&sort=created_at
→ Pre-filtered order queue (bookmarkable)

https://admin.olanallumint.co.ke/admin/clients/uuid
→ Direct client CRM record link (for team chat sharing)
```

---

## Mobile-Responsive Routing

### Mobile Menu (Hamburger)

**Public Pages:**
```
☰ Menu
  - Home
  - Products
  - Gallery
  - About
  - Contact
  - Get Quote
  - Log In
```

**Client Dashboard:**
```
☰ Menu
  - Dashboard
  - My Orders
  - My Bookings
  - Account
  - Logout
```

**Admin Dashboard:**
```
☰ Menu
  - Dashboard
  - Orders
  - Calendar
  - Clients
  - Gallery
  - Analytics
  - Settings
  - Logout
```

### Mobile Route Simplification

Some modal-based routes on desktop become full pages on mobile:
- `/admin/clients/{id}/notes` → Full page on mobile (not modal)
- `/admin/orders/{id}/invoice` → Full page on mobile
- `/account/security` → Full page (not modal form)

---

## Error Handling & Redirects

### Session Expired

```
User on /account/profile
↓ (API returns 401 Unauthorized)
Redirect to /auth/login?redirect=/account/profile
↓ (After login, redirect to /account/profile)
```

### Insufficient Permissions

```
Client user tries to access /admin/orders
↓ (ProtectedRoute checks role)
Redirect to /403 [Forbidden Page]
```

### Invalid Order ID

```
User visits /orders/invalid-uuid
↓ (API returns 404)
Redirect to /404 with message: "Order not found"
```

---

## Implementation Checklist

- [ ] Create React Router structure with Outlet components
- [ ] Build PublicLayout, ClientLayout, AdminLayout
- [ ] Implement ProtectedRoute component with role checks
- [ ] Create all page components (listed above)
- [ ] Add breadcrumb tracking (useLocation hook)
- [ ] Implement query parameter parsing (useSearchParams)
- [ ] Add deep link support (verify all routes are shareable)
- [ ] Test mobile navigation (hamburger menu, responsive routes)
- [ ] Implement 404/error boundary pages
- [ ] Add route transition animations (optional, using Framer Motion)
- [ ] Test all redirect flows (auth, 403, 404, etc.)

---

**Status:** Routing and sitemap ready for frontend implementation.
