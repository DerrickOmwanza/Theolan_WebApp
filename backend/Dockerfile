# Backend Dockerfile for Render
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Copy package files
COPY backend/package*.json ./

# Install dependencies (production only)
RUN npm install --only=production

# Copy application code
COPY backend/. .

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
