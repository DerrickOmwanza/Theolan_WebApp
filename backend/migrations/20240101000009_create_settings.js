/**
 * Migration: Create settings table
 *
 * This migration creates a settings table for storing system configuration
 * values that the admin can manage through the SettingsPage.
 *
 * Status: Already applied to production database (per task context)
 */

export async function up(knex) {
  // Check if table already exists
  const exists = await knex.schema.hasTable('settings');
  if (exists) {
    console.log('Settings table already exists - migration is idempotent');
    return;
  }

  await knex.schema.createTable('settings', (table) => {
    table.increments('id').primary();
    table.string('key', 100).notNullable().unique();
    table.text('value').nullable();
    table.string('type', 50).notNullable().defaultTo('string');
    table.string('category', 50).notNullable().defaultTo('general');
    table.string('label').notNullable();
    table.text('description').nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Create index for faster lookups by key
  await knex.raw('CREATE INDEX idx_settings_key ON settings(key)');
  await knex.raw('CREATE INDEX idx_settings_category ON settings(category)');
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('settings');
}