# Dockerfile for Backend (Node.js Express)

FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g nodemon

# Install dependencies
FROM base AS dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build development
FROM base AS development
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Production build
FROM base AS production
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run format
EXPOSE 3000
CMD ["npm", "start"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })" || exit 1
