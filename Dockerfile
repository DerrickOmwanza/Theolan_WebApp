# Minimal Dockerfile for Render
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
EXPOSE 3000

COPY backend/package*.json ./

RUN npm install --only=production

COPY backend/src ./src
COPY backend/migrations ./migrations
COPY backend/seeds ./seeds
COPY backend/scripts ./scripts
COPY backend/knexfile.js ./
COPY backend/jest.config.js ./

# Run migrations then seeds, then start server
CMD ["sh", "-c", "npm run migrate:latest && npm run seed:run && node src/server.js"]
