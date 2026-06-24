/**
 * Expired Payment Processor - Cron Job
 * Processes abandoned STK Push payments that never received a callback.
 * Should be run every 5-10 minutes in production.
 *
 * Usage: node scripts/process-expired-payments.js
 * Cron: Run every 10 minutes via cron-job.org or similar scheduler
 */

import dotenv from 'dotenv';
dotenv.config();

import { db, closeDb } from '../src/config/database.js';
import { closeRedis } from '../src/config/redis.js';
import PaymentService from '../src/services/paymentService.js';

const run = async () => {
  try {
    // Verify DB connection
    await db.raw('SELECT 1');
    console.log('Database connected');

    console.log('Processing expired payments...');
    const result = await PaymentService.processExpiredPayments();

    console.log(`Processed: ${result.processed}`);
    console.log(`Cancelled: ${result.cancelled}`);
    console.log(`Errors:    ${result.errors}`);

    await closeDb();
    await closeRedis();
    process.exit(0);
  } catch (error) {
    console.error('Failed to process expired payments:', error.message);
    process.exit(1);
  }
};

run();
