#!/bin/bash
# Run migrations on startup
cd backend
npm run migrate:latest
# Start server — seeds run once manually, not on every boot
npm start
