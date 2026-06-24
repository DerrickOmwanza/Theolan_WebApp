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
COPY backend/knexfile.js ./
COPY backend/jest.config.js ./

CMD ["node", "src/server.js"]
