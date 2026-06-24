FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY backend/package*.json ./

RUN npm install --only=production

COPY backend/. .

EXPOSE 3000

USER node

CMD ["npm", "start"]
