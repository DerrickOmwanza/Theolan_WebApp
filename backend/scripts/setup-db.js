#!/usr/bin/env node

/**
 * Database Setup Script
 * Tests the database connection, runs all migrations, and verifies tables.
 * Usage: node scripts/setup-db.js
 */

import dotenv from 'dotenv';
import knex from 'knex';
import knexfile from '../knexfile.js';

dotenv.config();

async function setupDatabase() {
  const env = process.env.NODE_ENV || 'development';
  const config = knexfile[env];

  console.log('');
  console.log('  Theolan Aluminium — Database Setup');
  console.log('  ===================================');
  console.log('');
  console.log(`  Environment: ${env}`);
  console.log(`  Host:        ${config.connection.host}`);
  console.log(`  Port:        ${config.connection.port}`);
  console.log(`  Database:    ${config.connection.database}`);
  console.log('');

  const db = knex(config);

  try {
    // Step 1: Test connection
    console.log('  [1/4] Testing database connection...');
    await db.raw('SELECT NOW()');
    console.log('        Connection successful.');
    console.log('');

    // Step 2: Run migrations
    console.log('  [2/4] Running migrations...');
    const [batch, migrations] = await db.migrate.latest();
    if (migrations.length > 0) {
      console.log(`        Batch ${batch}: ${migrations.length} migration(s) applied.`);
      migrations.forEach((m) => console.log(`          - ${m}`));
    } else {
      console.log('        No pending migrations. Database is up to date.');
    }
    console.log('');

    // Step 3: Verify tables
    console.log('  [3/4] Verifying tables...');
    const tables = await db.raw(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tables.rows.length === 0) {
      console.log('        WARNING: No tables found!');
    } else {
      tables.rows.forEach((row) => console.log(`        + ${row.table_name}`));
    }
    console.log('');

    // Step 4: Verify triggers
    console.log('  [4/4] Verifying triggers...');
    const triggers = await db.raw(`
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY trigger_name
    `);

    if (triggers.rows.length === 0) {
      console.log('        No triggers found (expected in migration 003).');
    } else {
      triggers.rows.forEach((row) =>
        console.log(`        + ${row.trigger_name} (on ${row.event_object_table})`)
      );
    }
    console.log('');

    console.log('  Setup complete.');
    console.log('');
    console.log('  Next steps:');
    console.log('    1. Configure .env with API credentials');
    console.log('    2. Run: npm run dev');
    console.log('    3. Verify: curl http://localhost:3000/health');
    console.log('');

    await db.destroy();
    process.exit(0);
  } catch (error) {
    console.error(`  ERROR: ${error.message}`);
    console.error('');
    console.error('  Troubleshooting:');
    console.error('    - Is PostgreSQL running? (psql --version)');
    console.error('    - Is the database created? (createdb theolan_dev)');
    console.error('    - Check .env DB_HOST, DB_PORT, DB_USER, DB_PASSWORD');
    console.error('');
    await db.destroy();
    process.exit(1);
  }
}

setupDatabase();
