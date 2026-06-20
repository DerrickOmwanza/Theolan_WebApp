# 🚀 Backend Setup Instructions

## Quick Start

Your Express.js + PostgreSQL backend is now initialized! Follow these steps to get it running.

---

## 📋 Prerequisites

Before proceeding, ensure you have installed:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
- **npm** (comes with Node.js)

---

## 🔧 Setup Steps

### Step 1: Install Dependencies ✅
Dependencies are already installed! Verify with:

```bash
npm list --depth=0
```

### Step 2: Configure PostgreSQL

PostgreSQL needs a database and proper credentials.

#### Option A: Using pgAdmin (GUI)
1. Open pgAdmin (usually available after PostgreSQL install)
2. Right-click on "Databases" → "Create" → "Database"
3. Name: `theolan_dev`
4. Owner: `postgres`
5. Click Save

#### Option B: Using Command Line
```bash
# Open PostgreSQL command line
psql -U postgres

# Create database
CREATE DATABASE theolan_dev;

# Verify
\l

# Exit
\q
```

### Step 3: Update .env Credentials

Edit `.env` file with your PostgreSQL credentials:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=theolan_dev
DB_USER=postgres
DB_PASSWORD=<your_postgres_password>
```

**Common scenarios:**
- **Fresh PostgreSQL install**: Password is usually empty or `postgres`
- **Windows installer**: Often prompts for password during installation
- **Docker/WSL**: Check your PostgreSQL configuration

### Step 4: Run Migrations

This will create all database tables:

```bash
npm run migrate:latest
```

Expected output:
```
✅ Migrations completed successfully!

Applied migrations:
  ✓ 001_create_users_and_auth_tables.js
  ✓ 002_create_products_and_bookings_tables.js
  ✓ 003_create_orders_payments_gallery_tables.js
```

### Step 5: Start Development Server

```bash
npm run dev
```

Expected output:
```
╔════════════════════════════════════════════════════════════════╗
║  🚀 Theolan Aluminium Backend Server Started                   ║
║                                                                ║
║  Server:   http://localhost:3000                               ║
║  Database: localhost:5432/theolan_dev                          ║
║  Environment: development                                      ║
╚════════════════════════════════════════════════════════════════╝
```

### Step 6: Verify Installation

Test the health endpoint:

```bash
# Open another terminal/command prompt
curl http://localhost:3000/health

# Or visit in browser: http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 1.234,
  "database": {
    "status": "healthy",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

---

## 📁 Project Structure

```
backend/
├── migrations/               # Database migrations (Knex.js)
│   ├── 001_create_users_and_auth_tables.js
│   ├── 002_create_products_and_bookings_tables.js
│   └── 003_create_orders_payments_gallery_tables.js
├── src/
│   ├── config/
│   │   └── database.js       # Database configuration
│   ├── controllers/          # Request handlers
│   ├── middlewares/
│   │   ├── errorHandler.js
│   │   └── logger.js
│   ├── models/               # Database models/queries
│   ├── routes/               # API route definitions
│   ├── services/             # Business logic
│   ├── utils/                # Helper functions
│   └── server.js             # Express app entry point
├── tests/                    # Test files
├── .env                      # Environment variables (local)
├── .env.example              # Environment template
├── .gitignore
├── knexfile.js              # Knex configuration
└── package.json             # Dependencies & scripts
```

---

## 🗄️ Database Schema

14 tables created by migrations:

### Auth & Users
- **users** - Client, admin, and technician profiles
- **otp_codes** - OTP verification codes
- **refresh_tokens** - JWT refresh token storage

### Products & Catalog
- **products** - Aluminium product types
- **product_rates** - Pricing by product + finish

### Bookings & Scheduling
- **technicians** - Service team members
- **time_slots** - Available booking slots
- **bookings** - Client site visit bookings

### Orders & CRM
- **clients** - CRM client records
- **client_notes** - Client interaction notes
- **orders** - Fabrication orders
- **order_events** - Order timeline events

### Payments & Media
- **payments** - Payment transaction records
- **gallery_photos** - Project photos gallery

---

## 📝 Available npm Scripts

```bash
# Development
npm run dev                  # Start dev server with auto-reload
npm start                    # Start production server

# Database
npm run migrate:latest       # Run pending migrations
npm run migrate:rollback     # Rollback last migration
npm run migrate:make <name>  # Create new migration
npm run db:reset            # Full reset: rollback + migrate + seed

# Code Quality
npm run lint                # Run ESLint
npm run lint:fix            # Fix linting issues
npm run format              # Format with Prettier

# Testing
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
npm run test:integration   # Integration tests only
```

---

## 🔐 Environment Variables Explained

```env
# Server
NODE_ENV=development           # Environment mode
PORT=3000                      # Server port

# Database
DB_HOST=localhost              # PostgreSQL host
DB_PORT=5432                   # PostgreSQL port
DB_NAME=theolan_dev            # Database name
DB_USER=postgres               # DB username
DB_PASSWORD=                   # DB password
DB_POOL_MIN=2                  # Min connection pool
DB_POOL_MAX=20                 # Max connection pool

# JWT Authentication
JWT_SECRET=<long_random_key>   # Access token secret (min 32 chars)
JWT_REFRESH_SECRET=<key>       # Refresh token secret
JWT_EXPIRE=900                 # Access token expiry (seconds)
JWT_REFRESH_EXPIRE=604800      # Refresh token expiry (7 days)

# External APIs
CLOUDINARY_NAME=               # Image hosting
CLOUDINARY_KEY=
CLOUDINARY_SECRET=

SAFARICOM_CONSUMER_KEY=        # M-Pesa payments
SAFARICOM_CONSUMER_SECRET=
SAFARICOM_SHORTCODE=
SAFARICOM_PASSKEY=

AFRICASTALKING_API_KEY=        # SMS notifications
AFRICASTALKING_USERNAME=

SENDGRID_API_KEY=              # Email service
SENDGRID_FROM_EMAIL=

# CORS
CORS_ORIGIN=                   # Allowed frontend origins
FRONTEND_URL=                  # Frontend URL

# Logging
LOG_LEVEL=debug                # Log verbosity
```

---

## ❌ Troubleshooting

### "Cannot find module 'knex'"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "password authentication failed"
```bash
# Check PostgreSQL password in .env
# Test connection manually:
psql -h localhost -U postgres -d theolan_dev
```

### "database does not exist"
```bash
# Create database using psql or pgAdmin (see Step 2 above)
```

### "Port 3000 is already in use"
```bash
# Either:
# 1. Close the app using port 3000
# 2. Change PORT in .env to another port (3001, 3002, etc.)
```

### "Cannot find psql command"
```bash
# Add PostgreSQL to PATH:
# Windows: Add "C:\Program Files\PostgreSQL\15\bin" to System PATH
# Then restart terminal
```

---

## 🎯 Next Steps

1. ✅ Backend structure initialized
2. ✅ Dependencies installed
3. ✅ Database migrations created
4. ⏭️ **Configure PostgreSQL & run migrations**
5. ⏭️ Implement authentication routes (Week 1)
6. ⏭️ Build booking system (Week 2)
7. ⏭️ Implement quote estimator (Week 3)
8. ⏭️ Build remaining features (Weeks 4-8)

---

## 📚 Reference Documentation

- **API Contract**: See `Docs/04_API_CONTRACT.md` for all endpoints
- **Database Schema**: See `Docs/03_DATABASE_SCHEMA.md` for table details
- **Architecture**: See `Docs/02_SYSTEM_ARCHITECTURE.md` for system design
- **Implementation Plan**: See `Docs/06_IMPLEMENTATION_ROADMAP.md` for timeline

---

## 💬 Support

If you encounter issues:
1. Check troubleshooting section above
2. Verify all prerequisites are installed
3. Review the relevant documentation file
4. Check PostgreSQL is running: `psql -U postgres -c "SELECT 1"`

Happy coding! 🚀
