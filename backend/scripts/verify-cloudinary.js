// Cloudinary Verification Script
// Run: node scripts/verify-cloudinary.js

import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME;
const CLOUDINARY_KEY = process.env.CLOUDINARY_KEY;
const CLOUDINARY_SECRET = process.env.CLOUDINARY_SECRET;

console.log('=== Cloudinary Verification ===\n');

// Check if credentials exist
if (!CLOUDINARY_NAME || !CLOUDINARY_KEY || !CLOUDINARY_SECRET) {
  console.log('❌ MISSING CREDENTIALS:');
  console.log('   CLOUDINARY_NAME:', CLOUDINARY_NAME || 'NOT SET');
  console.log('   CLOUDINARY_KEY:', CLOUDINARY_KEY ? 'SET' : 'NOT SET');
  console.log('   CLOUDINARY_SECRET:', CLOUDINARY_SECRET ? 'SET' : 'NOT SET');
  console.log('\n💡 Add these to your .env file:');
  console.log('   CLOUDINARY_NAME=your_cloud_name');
  console.log('   CLOUDINARY_KEY=your_cloudinary_key');
  console.log('   CLOUDINARY_SECRET=your_cloudinary_secret');
  process.exit(1);
}

console.log('✅ Credentials found in .env');
console.log('   CLOUDINARY_NAME:', CLOUDINARY_NAME);
console.log('   CLOUDINARY_KEY:', CLOUDINARY_KEY.substring(0, 4) + '...');
console.log('   CLOUDINARY_SECRET:', CLOUDINARY_SECRET.substring(0, 4) + '...\n');

// Configure Cloudinary
cloudinary.v2.uploader
  .destroy('test_image')
  .then(() => {
    console.log('✅ Cloudinary API connection successful!');
    console.log('   Account is accessible and responsive.');
    console.log('\n=== VERIFICATION COMPLETE ===');
    console.log('Cloudinary credentials are valid and ready to use.');
  })
  .catch((error) => {
    console.log('❌ Cloudinary connection failed:');
    console.log('   Error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check CLOUDINARY_NAME matches your Cloudinary account');
    console.log('   2. Verify API_KEY and API_SECRET are correct');
    console.log('   3. Ensure you have an active Cloudinary account');
    process.exit(1);
  });
