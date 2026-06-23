/**
 * Production Database Setup Script
 * Run this script before deploying to production
 *
 * Usage: node scripts/setup-production-db.js
 */

import { db } from '../src/config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const BCRYPT_SALT_ROUNDS = 10;

async function setupProductionDatabase() {
  console.log('Setting up production database...\n');

  try {
    // Test connection
    await db.raw('SELECT 1');
    console.log('✅ Database connection successful');

    // Check if admin user exists
    const adminExists = await db('users').where({ role: 'admin' }).first();

    if (!adminExists) {
      console.log('Creating admin user...');

      // Create default admin user
      // IMPORTANT: Change this password immediately after deployment!
      const adminPassword = 'AdminPass123!';
      const passwordHash = bcrypt.hashSync(adminPassword, BCRYPT_SALT_ROUNDS);

      await db('users').insert({
        id: uuidv4(),
        phone: '+254712345679',
        email: 'admin@olanallumint.co.ke',
        name: 'System Administrator',
        password_hash: passwordHash,
        role: 'admin',
        is_active: true,
        phone_verified: true,
        phone_verified_at: new Date()
      });

      console.log('✅ Admin user created');
      console.log('   Phone: +254712345679');
      console.log('   Password: ' + adminPassword);
      console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY AFTER DEPLOYMENT!');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Check if products exist
    const productCount = await db('products').count('* as count').first();

    if (productCount.count === 0) {
      console.log('Running seed data...');
      // Seeds will be run separately
    } else {
      console.log(`✅ Products table has ${productCount.count} records`);
    }

    console.log('\n✅ Production database setup complete!');
    console.log('\nNext steps:');
    console.log('1. Verify admin password and change if needed');
    console.log('2. Configure all API keys in environment variables');
    console.log('3. Run: npm run migrate:latest');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

setupProductionDatabase();
