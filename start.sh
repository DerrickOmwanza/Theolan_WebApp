#!/bin/bash
# Run migrations on startup
cd backend
npm run migrate:latest
npm run seed:run
# Start server
npm start
