# Running OlanAlumint.web with Docker Desktop

## Docker Desktop PATH Issue

If `docker` command is not recognized, Docker Desktop is installed but the PATH environment variable needs to be updated.

### Option 1: Use Docker Desktop PowerShell (Recommended)

Open Docker Desktop's PowerShell terminal or run:
```powershell
# This path may vary - check Docker Desktop installation
$env:PATH += ";C:\Program Files\Docker\Docker\resources\bin"
docker compose up -d
```

### Option 2: Run Services Without Docker

For local development without Docker:

#### Terminal 1 - Backend:
```powershell
cd backend
npm run dev
```

#### Terminal 2 - Frontend:
```powershell
cd frontend
npm run dev
```

### Option 3: Install Docker CLI

1. Open Docker Desktop
2. Go to Settings → General
3. Check "Use the WSL 2 based engine" (if on Windows 10/11)
4. Restart Docker Desktop
5. Try again: `docker compose up -d`

## Docker Compose Services

When running, the following services will be available:

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Database |
| Backend API | 3000 | Express.js API |
| Frontend | 5173 | React dev server |

## Manual Setup (No Docker Required)

### Prerequisites
- Node.js 18+ installed
- PostgreSQL installed locally

### Setup Steps

```powershell
# 1. Create database
createdb -U postgres theolan_dev

# 2. Setup backend
cd backend
npm install
npm run migrate:latest
npm run seed:run
npm run dev

# 3. Setup frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Environment Variables

Backend `.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=theolan_dev

# JWT
JWT_SECRET=your-jwt-secret-at-least-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-at-least-32-characters

# M-Pesa (optional - for dev mode it will simulate)
SAFARICOM_CONSUMER_KEY=your_key
SAFARICOM_SHORTCODE=174379
```

Frontend `.env`:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```