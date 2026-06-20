# 📋 Backend Quick Reference

## 🚀 Get Started (5 Minutes)

```bash
# 1. Navigate to backend directory
cd "C:\Users\ADMIN\Web&Standalone Applications\OlanAlumint.web\backend"

# 2. Create PostgreSQL database (one-time)
createdb -U postgres theolan_dev

# 3. Update .env with your PostgreSQL password
# Edit .env and set: DB_PASSWORD=<your_password>

# 4. Run migrations
npm run migrate:latest

# 5. Start development server
npm run dev

# 6. In another terminal, test the server
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "database": {
    "status": "healthy"
  }
}
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/server.js` | Express server entry point |
| `src/config/database.js` | Database connection |
| `src/routes/auth.js` | Authentication routes (Week 1) |
| `migrations/001_*.js` | User/auth tables |
| `migrations/002_*.js` | Product/booking tables |
| `migrations/003_*.js` | Order/payment tables |
| `.env` | Your local secrets (never commit!) |
| `knexfile.js` | Database configuration |
| `package.json` | Dependencies & scripts |

---

## 🛠️ Common Commands

```bash
# Development
npm run dev                    # Start with auto-reload
npm run start                  # Production start

# Database
npm run migrate:latest         # Create all tables
npm run migrate:rollback       # Undo last migration
npm run db:reset              # Full reset (use carefully!)

# Code Quality
npm run lint                   # Check code style
npm run format                 # Auto-format code
npm test                       # Run tests
npm run test:coverage         # Coverage report
```

---

## 🗄️ Database Tables (14 Total)

### Authentication (3)
- `users` - Client, admin, technician profiles
- `otp_codes` - One-time password codes
- `refresh_tokens` - JWT token storage

### Products (2)
- `products` - Aluminium product catalog
- `product_rates` - Pricing by type & finish

### Bookings (3)
- `technicians` - Service team members
- `time_slots` - Available appointment slots
- `bookings` - Customer site visit bookings

### Orders & CRM (4)
- `clients` - Customer records
- `client_notes` - Interaction history
- `orders` - Fabrication orders
- `order_events` - Order timeline

### Payments & Media (2)
- `payments` - Transaction records
- `gallery_photos` - Project images

---

## 🔐 Environment Variables

```env
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=theolan_dev
DB_USER=postgres
DB_PASSWORD=<your_password>

# JWT
JWT_SECRET=<random_32_chars_min>
JWT_REFRESH_SECRET=<random_32_chars_min>
JWT_EXPIRE=900                 # 15 minutes
JWT_REFRESH_EXPIRE=604800      # 7 days

# CORS
CORS_ORIGIN=http://localhost:5173

# External APIs (add later)
SAFARICOM_CONSUMER_KEY=
SAFARICOM_CONSUMER_SECRET=
AFRICASTALKING_API_KEY=
CLOUDINARY_NAME=
SENDGRID_API_KEY=
```

---

## ✅ Database Connection Test

```javascript
// Quick test in Node REPL or test file
const { db } = require('./src/config/database.js');

async function test() {
  try {
    const result = await db.raw('SELECT NOW()');
    console.log('✅ Connected!', result.rows[0]);
  } catch (err) {
    console.error('❌ Failed:', err.message);
  }
}

test();
```

---

## 📝 API Endpoints (Week 1)

All endpoints start with `/api/v1/`

### Auth (To Implement Week 1)
```
POST   /auth/signup           - Register new user
POST   /auth/verify-otp       - Verify OTP code
POST   /auth/login            - Login with credentials
POST   /auth/refresh-token    - Get new access token
POST   /auth/logout           - Revoke refresh token
POST   /auth/forgot-password  - Request password reset
```

### Other Routes (Scaffolded, ready for future weeks)
```
POST   /bookings              - Create site visit booking
GET    /bookings/:id          - Get booking details

GET    /quote                 - Get quote estimate
POST   /quote/submit          - Submit formal quote request

GET    /products              - Get product catalog
GET    /products/:id          - Get product details

GET    /orders                - List client orders
GET    /orders/:id            - Get order details
```

---

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Check database exists
psql -U postgres -l | grep theolan_dev

# If missing, create it:
createdb -U postgres theolan_dev
```

### Port 3000 Already in Use
```bash
# Change port in .env
PORT=3001

# Then restart npm run dev
```

### Migration Failed
```bash
# Check database connection
npm run migrate:latest

# See migration status
knex migrate:status

# Rollback if needed
npm run migrate:rollback
```

### Dependencies Not Found
```bash
# Reinstall
rm -r node_modules package-lock.json
npm install
```

---

## 📚 Full Documentation

- **SETUP.md** - Complete setup guide with detailed steps
- **BACKEND_STATUS.md** - Infrastructure overview
- **Docs/03_DATABASE_SCHEMA.md** - Table DDL and relationships
- **Docs/04_API_CONTRACT.md** - API specifications
- **Docs/02_SYSTEM_ARCHITECTURE.md** - System design

---

## 🎯 Week 1 Success Criteria

- [x] Backend project initialized
- [x] Dependencies installed
- [x] Database migrations written
- [ ] PostgreSQL database configured
- [ ] Migrations run successfully
- [ ] Server starts and health endpoint works
- [ ] Auth routes implemented (signup, OTP, login)
- [ ] Auth service tests written
- [ ] JWT middleware protecting routes
- [ ] Ready for Week 2 (bookings)

---

**Last Updated**: 2024-01-01
**Status**: Ready for PostgreSQL setup
**Next Phase**: Week 1 Auth Implementation
