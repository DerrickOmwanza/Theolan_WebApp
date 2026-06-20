/**
 * Migration: Create users, otp_codes, and refresh_tokens tables
 *
 * Reconciled against:
 * - docs/03_DATABASE_SCHEMA.md (original spec)
 * - src/models/userModel.js (actual code expectations)
 * - src/services/authService.js (field usage)
 *
 * Key divergences from schema doc (code-driven additions):
 * - users: added is_active, deleted_at, notification_preference, last_login_at, phone_verified (boolean)
 * - otp_codes: added type, is_used, used_at (code uses these instead of verified_at)
 * - refresh_tokens: added is_revoked (code uses this instead of revoked_at)
 */

export async function up(knex) {
  // ============================================================
  // USERS
  // ============================================================
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('phone', 20).notNullable().unique();
    table.string('email', 255).unique();
    table.string('name', 255).notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('role', 50).notNullable().defaultTo('client');
    table.boolean('phone_verified').notNullable().defaultTo(false);
    table.timestamp('phone_verified_at');
    table.boolean('is_active').notNullable().defaultTo(true);
    table.string('notification_preference', 20).defaultTo('sms');
    table.timestamp('last_login_at');
    table.timestamp('deleted_at');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Constraints
    table.check('role IN (\'client\', \'admin\')', [], 'users_role_check');
    table.check('phone ~ \'^\\+254[0-9]{9}$\'', [], 'users_phone_format_check');
  });

  await knex.raw('CREATE INDEX idx_users_phone ON users(phone)');
  await knex.raw('CREATE INDEX idx_users_email ON users(email)');
  await knex.raw('CREATE INDEX idx_users_role ON users(role)');
  await knex.raw('CREATE INDEX idx_users_created_at ON users(created_at DESC)');

  // ============================================================
  // OTP CODES
  // ============================================================
  await knex.schema.createTable('otp_codes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('phone', 20).notNullable();
    table.string('code', 10).notNullable();
    table.string('type', 30).notNullable(); // 'signup', 'password_reset'
    table.timestamp('expires_at').notNullable();
    table.boolean('is_used').notNullable().defaultTo(false);
    table.timestamp('used_at');
    table.integer('attempts').defaultTo(0);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.check('code ~ \'^[0-9]{4,6}$\'', [], 'otp_codes_code_format_check');
  });

  await knex.raw('CREATE INDEX idx_otp_codes_phone_type_expires ON otp_codes(phone, type, expires_at DESC)');
  await knex.raw('CREATE INDEX idx_otp_codes_is_used ON otp_codes(is_used)');

  // ============================================================
  // REFRESH TOKENS
  // ============================================================
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token', 500).notNullable().unique();
    table.timestamp('expires_at').notNullable();
    table.boolean('is_revoked').notNullable().defaultTo(false);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.check('LENGTH(token) > 100', [], 'refresh_tokens_token_length_check');
  });

  await knex.raw('CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id)');
  await knex.raw('CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token)');
  await knex.raw('CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at DESC)');
  await knex.raw('CREATE INDEX idx_refresh_tokens_active ON refresh_tokens(user_id, expires_at DESC) WHERE is_revoked = false');
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('otp_codes');
  await knex.schema.dropTableIfExists('users');
}
