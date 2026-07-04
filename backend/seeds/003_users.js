/**
 * Seed: Users and Admin accounts
 *
 * Creates test users for development and testing.
 * Usage: npm run seed:run
 */

import bcrypt from 'bcryptjs';

const BCRYPT_SALT_ROUNDS = 10;

/**
 * Generate a password hash for testing
 */
const hashPassword = (password) => {
  return bcrypt.hashSync(password, BCRYPT_SALT_ROUNDS);
};

export async function seed(knex) {
  const now = new Date();

  // Create admin account (upsert to handle existing users)
  await knex('users')
    .insert({
      id: '00000000-0000-0000-0000-000000000001',
      phone: '+254713211010',
      email: 'vaddydjones@gmail.com',
      name: 'OlanAdmin',
      password_hash: hashPassword('AdminPass123!'),
      role: 'admin',
      phone_verified: true,
      phone_verified_at: now,
      is_active: true,
      notification_preference: 'sms',
      created_at: now,
      updated_at: now
    })
    .onConflict('id')
    .merge({
      phone: '+254713211010',
      email: 'vaddydjones@gmail.com',
      name: 'OlanAdmin',
      role: 'admin',
      phone_verified: true,
      is_active: true,
      notification_preference: 'sms',
      updated_at: now
    });

  console.log('  Admin account configured: +254713211010');
  console.log('  Admin credentials: +254713211010 / AdminPass123!');
}
