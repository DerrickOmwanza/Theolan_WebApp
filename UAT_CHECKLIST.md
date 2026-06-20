# Week 12: UAT Testing Checklist

**Date:** June 20, 2026  
**Status:** Ready for Stakeholder Testing

---

## 🎯 UAT Test Scenarios

### Authentication Flow (Client)
| Step | Expected Result | Tested | Notes |
|------|-----------------|--------|-------|
| 1. Navigate to /auth/signup | Signup form displays | ☐ | |
| 2. Enter phone + password | Form validates inputs | ☐ | Zod validation |
| 3. Submit signup | OTP sent (simulated) | ☐ | Console log in dev |
| 4. Enter OTP | Account created | ☐ | |
| 5. Auto-login to dashboard | Client dashboard loads | ☐ | |

### Booking Flow
| Step | Expected Result | Tested | Notes |
|------|-----------------|--------|-------|
| 1. Navigate to /booking | Booking form loads | ☐ | |
| 2. Select service type | Options update | ☐ | |
| 3. Pick date/time | Calendar shows availability | ☐ | Mock data |
| 4. Enter details | Form validates | ☐ | |
| 5. Submit booking | Confirmation shown | ☐ | Reference # |

### Quote Estimator
| Step | Expected Result | Tested | Notes |
|------|-----------------|--------|-------|
| 1. Navigate to /quote | Product selector loads | ☐ | |
| 2. Select product + dimensions | Price calculated | ☐ | ±8-10% range |
| 3. Change finish multiplier | Price updates | ☐ | |
| 4. Download PDF | Quote downloads | ☐ | Mock endpoint |

### Order Tracking
| Step | Expected Result | Tested | Notes |
|------|-----------------|--------|-------|
| 1. View /orders | Order list loads | ☐ | |
| 2. Click order | Timeline displayed | ☐ | |
| 3. Payment status | Badge shows status | ☐ | Unpaid/Deposit/Paid |

### M-Pesa Payment
| Step | Expected Result | Tested | Notes |
|------|-----------------|--------|-------|
| 1. Click "Pay Deposit" | STK prompt triggered | ☐ | Sandbox mode |
| 2. Payment confirmation | Status updates to "Deposit Received" | ☐ | |

### Admin Features
| Step | Expected Result | Tested | Notes |
|------|-----------------|--------|-------|
| 1. Admin login | Admin dashboard loads | ☐ | |
| 2. /admin/orders | Orders table displays | ☐ | |
| 3. Change order status | Timeline updates | ☐ | |
| 4. /admin/calendar | Week view calendar | ☐ | |
| 5. /admin/analytics | Revenue/bookings/orders charts | ☐ | Mock data |
| 6. /admin/settings | M-Pesa config form | ☐ | SettingsPage.jsx |

---

## 📱 Mobile Testing

| Device | Page | Issue | Status |
|--------|------|-------|--------|
| iPhone 12 | All pages | - | ☐ |
| iPad | Calendar view | - | ☐ |
| Pixel 6 | Booking form | - | ☐ |
| Desktop | All features | - | ☐ |

**Mobile checklist:**
- [ ] No horizontal scroll
- [ ] Touch targets ≥ 44px
- [ ] iOS zoom prevention on inputs
- [ ] PWA install prompt (if enabled)

---

## 🧪 Automated Test Coverage

| Component | Coverage | Tests |
|-----------|----------|-------|
| Auth Service | 80%+ | 43 tests |
| Analytics Service | 100% | 15 tests |
| Integration Tests | - | 15 tests |
| E2E Tests | - | 18 tests |
| **Total** | | **68 backend + 28 frontend = 96 tests** |

---

## 🐛 Known Issues (Non-blocking)

| Issue | Severity | Notes |
|-------|----------|-------|
| cloudinary nodemailer vulnerabilities | High | Will fix in production |
| Some unused imports | Low | Warning only, no runtime impact |
| OAuth2 fallback | Low | Africa's Talking primary, M-Pesa secondary configured |

---

## ✅ Sign-off

| Stakeholder | Role | Date | Approved |
|-------------|------|------|----------|
| | | | ☐ |
| | | | ☐ |
| | | | ☐ |