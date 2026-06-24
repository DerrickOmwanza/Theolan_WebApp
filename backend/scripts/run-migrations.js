// Run migrations before starting server (for Render free tier)
import knex from 'knex';
import knexfile from '../knexfile.js';

const env = process.env.NODE_ENV || 'production';
const config = knexfile[env];

const db = knex(config);

async function runMigrations() {
  try {
    console.log('Running migrations...');
    await db.migrate.latest();
    console.log('✓ Migrations complete');
  } catch (error) {
    console.error('Migration error:', error.message);
  } finally {
    await db.destroy();
  }
}

await runMigrations();
