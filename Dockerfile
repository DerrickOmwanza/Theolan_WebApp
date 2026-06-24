# Backend Dockerfile for Render
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy backend package files
COPY backend/package*.json ./
COPY backend/.gitignore ./

# Install dependencies
RUN npm install --only=production

# Copy backend source code
COPY backend/src ./src
COPY backend/migrations ./migrations
COPY backend/seeds ./seeds
COPY backend/knexfile.js ./
COPY backend/server.js ./

EXPOSE 3000

USER node

CMD ["npm", "start"]
