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
  // Check if users already exist
  const existingCount = await knex('users').count('* as count');
  if (existingCount[0].count > 0) {
    console.log('  Users already exist, skipping seed');
    return;
  }

  const now = new Date();

  // Create admin and test client accounts
  const users = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      phone: '+254712345679',
      email: 'admin@theolan.co.ke',
      name: 'Admin',
      password_hash: hashPassword('AdminPass123!'),
      role: 'admin',
      phone_verified: true,
      phone_verified_at: now,
      is_active: true,
      notification_preference: 'email',
      created_at: now,
      updated_at: now
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      phone: '+254712345678',
      email: 'client@test.co.ke',
      name: 'Test Client',
      password_hash: hashPassword('Password123!'),
      role: 'client',
      phone_verified: true,
      phone_verified_at: now,
      is_active: true,
      notification_preference: 'sms',
      created_at: now,
      updated_at: now
    }
  ];

  await knex('users').insert(users);

  console.log(`  Seeded ${users.length} admin user`);
  console.log('  Admin credentials: +254712345679 / AdminPass123!');
  console.log('  Create additional accounts via the signup flow.');
}
