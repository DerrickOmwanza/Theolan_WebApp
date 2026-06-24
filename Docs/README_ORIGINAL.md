<div align="center">

# 🏬 Theolan Aluminium International Ltd
### Web Application

**Professional Aluminium Fabrication & Supply Platform**

[![Deployment](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)](https://github.com/DerrickOmwanza/Theolan_WebApp)
[![License](https://img.shields.io/badge/License-Proprietary-blue)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-336791?style=flat&logo=postgresql)](https://postgresql.org/)

</div>

## 📋 Overview

**Theolan Aluminium International Ltd** is a Kenya-based aluminium fabrication and supply company specializing in custom windows, doors, curtain walls, partitions, and architectural glazing systems. This web application digitizes their entire business workflow:

- ✅ 24/7 online booking and quote requests
- ✅ Instant quote estimation
- ✅ Real-time order tracking
- ✅ M-Pesa payment integration
- ✅ Admin management dashboard
- ✅ SMS/WhatsApp notifications

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| **Booking System** | Clients can book site visits with real-time slot availability |
| **Quote Calculator** | Instant pricing estimates based on product selection and dimensions |
| **Product Gallery** | Showcases 50+ completed projects with filtering by category |
| **Order Tracking** | Real-time order status with visual timeline |
| **M-Pesa Payments** | Secure STK push payments via Safaricom Daraja API |
| **Admin Dashboard** | Complete management panel for orders, clients, and analytics |

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │    DATABASE     │
│                 │    │                 │    │                 │
│  ⚡ React 18    │◄──►│  🟢 Node.js     │◄──►│  🐘 PostgreSQL   │
│  ⚡ Vite        │    │  🮆 Express      │    │  📊 Knex.js     │
│  ⚡ TailwindCSS  │    │  🔐 JWT Auth     │    │                 │
│  ⚡ PWA Ready   │    │  💳 M-Pesa       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
OlanAlumint.web/
├── 📄 README.md                 # This file
├── 📄 DEPLOYMENT_GUIDE.md       # Deployment instructions
├── 📄 SECURITY_AUDIT.md         # Security assessment
├── ⚙️ Procfile                   # Heroku deployment config
├── ⚙️ docker-compose.yml         # Local development setup
├── ⚙️ nginx.conf                 # Production load balancer
│
├── 📁 Docs/                      # Project Documentation
│   ├── 01_SYSTEM_ANALYSIS.md
│   ├── 02_SYSTEM_ARCHITECTURE.md
│   ├── 03_DATABASE_SCHEMA.md
│   ├── 04_API_CONTRACT.md
│   └── ...
│
├── 📁 backend/                   # Node.js API Server
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   ├── services/             # Business logic
│   │   ├── models/               # Database queries
│   │   ├── routes/               # API endpoints
│   │   ├── middlewares/          # Auth & validation
│   │   └── config/               # Configuration
│   ├── migrations/               # Database migrations
│   ├── seeds/                    # Seed data
│   └── tests/                    # Test suite
│
├── 📁 frontend/                  # React Application
│   ├── src/
│   │   ├── pages/                # Route pages
│   │   ├── components/           # UI components
│   │   ├── contexts/             # State management
│   │   └── services/             # API client
│   ├── public/                   # Static assets
│   └── __tests__/                # Test files
│
└── 📁 images/                    # Project assets
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (optional)

### 1. Clone & Install
```bash
git clone https://github.com/DerrickOmwanza/Theolan_WebApp.git
cd Theolan_WebApp

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment
```bash
# Backend
cp backend/.env.example backend/.env
# Edit .env with your database and API credentials

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Run Development Servers
```bash
# Terminal 1 - Database
docker-compose up -d postgres redis

# Terminal 2 - Backend
cd backend
npm run dev

# Terminal 3 - Frontend
cd frontend
npm run dev
```

### 4. Access Application
- **Frontend:** http://localhost:5174
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health

## 🔐 Quick Login (Development)

| Role | Phone | Password |
|------|-------|----------|
| Admin | `+254712345679` | `AdminPass123!` |
| Client | `+254712345678` | `Password123!` |

## 📦 Deployment

### Production Stack
| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | https://olanallumint.co.ke |
| Backend API | Railway | https://api.olanalumint.co.ke |
| Database | Railway PostgreSQL | Managed |
| File Storage | Cloudinary | Images |
| SMS | Africa's Talking | Notifications |
| Payments | Safaricom Daraja | M-Pesa |

### Deploy Commands
```bash
# Backend
cd backend
railway up

# Frontend
cd frontend
vercel --prod
```

See [DEPLOYMENT_GUIDE.md](Docs/DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📊 API Endpoints

### Authentication
```
POST   /api/v1/auth/signup        - Register
POST   /api/v1/auth/login         - Login
POST   /api/v1/auth/verify-otp    - Verify phone
POST   /api/v1/auth/refresh-token - Refresh JWT
```

### Core Services
```
GET    /api/v1/products           - Product catalogue
GET    /api/v1/gallery            - Project photos
POST   /api/v1/bookings           - Create booking
POST   /api/v1/quote              - Get instant quote
POST   /api/v1/payments/initiate-stk - M-Pesa payment
```

See [API_CONTRACT.md](Docs/04_API_CONTRACT.md) for full specification.

## 🛡️ Security

| Feature | Status |
|---------|--------|
| JWT Authentication | ✅ |
| Rate Limiting | ✅ (100 req/min) |
| Input Validation | ✅ (Zod) |
| Password Hashing | ✅ (bcrypt) |
| CORS Protection | ✅ |
| OWASP 10/10 | ✅ |

See [SECURITY_AUDIT.md](Docs/SECURITY_AUDIT.md) for details.

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test              # Run all tests
npm run test:coverage # With coverage

# Frontend tests
cd frontend
npm test              # Run Vitest
npm run test:coverage # With coverage
```

**Test Results:** 96 tests passing ✅

## 📄 Documentation

| Document | Purpose |
|----------|---------|
| [SYSTEM_ANALYSIS.md](Docs/01_SYSTEM_ANALYSIS.md) | Requirements & features |
| [SYSTEM_ARCHITECTURE.md](Docs/02_SYSTEM_ARCHITECTURE.md) | Technical architecture |
| [DATABASE_SCHEMA.md](Docs/03_DATABASE_SCHEMA.md) | Database design |
| [API_CONTRACT.md](Docs/04_API_CONTRACT.md) | API specifications |
| [SITEMAP_ROUTING.md](Docs/05_SITEMAP_ROUTING.md) | Routing & navigation |
| [IMPLEMENTATION_ROADMAP.md](Docs/06_IMPLEMENTATION_ROADMAP.md) | Development timeline |
| [DEPLOYMENT_GUIDE.md](Docs/DEPLOYMENT_GUIDE.md) | Production deployment |
| [SECURITY_AUDIT.md](Docs/SECURITY_AUDIT.md) | Security assessment |

## 🤝 Contributing

This is a proprietary project. Contributions are welcome via pull requests.

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/YourFeature`
3. Commit changes: `git commit -m 'Add feature'`
4. Push branch: `git push origin feature/YourFeature`
5. Open Pull Request

## 📞 Support

| Contact | Purpose |
|---------|---------|
| GitHub Issues | Bug reports, feature requests |
| Email | admin@theolan.co.ke |
| M-Pesa Support | Integrated support |

## 📜 License

**Proprietary & Confidential** - All rights reserved © 2026 Theolan Aluminium International Ltd.

---

<div align="center">

**🚀 Ready for Production Deployment**

[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Railway](https://img.shields.io/badge/Backend-Railway-00C851?style=for-the-badge&logo=railway)](https://railway.app)
[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-e74c3c?style=flat)](https://github.com/DerrickOmwanza)

</div>