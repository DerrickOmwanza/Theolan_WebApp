import knex from 'knex';
import knexfile from '../../knexfile.js';
import dotenv from 'dotenv';

dotenv.config();

const environment = process.env.NODE_ENV || 'development';
const config = knexfile[environment];

export const db = knex(config);

/**
 * Database health check — runs SELECT 1 to verify connectivity.
 * Used by the /health endpoint.
 */
export async function healthCheck() {
  try {
    await db.raw('SELECT 1');
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Gracefully close the database connection pool.
 * Called during server shutdown.
 */
export async function closeDb() {
  await db.destroy();
}

export default db;
