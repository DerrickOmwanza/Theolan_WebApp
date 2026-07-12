/**
 * Migration: Create settings table
 *
 * This migration creates a settings table for storing system configuration
 * values. The key column is the primary key (no separate id column).
 *
 * Production ground truth:
 * - key: string, NOT NULL, PRIMARY KEY
 * - value: text, nullable
 * - updated_at: timestamptz, nullable, default now()
 *
 * Status: Already applied to production database (per task context)
 */

export async function up(knex) {
  // Check if table already exists (idempotent)
  const exists = await knex.schema.hasTable('settings');
  if (exists) {
    console.log('Settings table already exists - migration is idempotent');
    return;
  }

  await knex.schema.createTable('settings', (table) => {
    table.string('key').notNullable().primary();
    table.text('value').nullable();
    table.timestamp('updated_at', { useTz: true }).nullable().defaultTo(knex.fn.now());
  });

  console.log('Settings table created successfully');
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('settings');
}