#!/usr/bin/env node

/**
 * AUTOMATED GALLERY UPLOAD SCRIPT
 * 
 * This script will:
 * 1. Delete all existing gallery images
 * 2. Upload all images from uploads/gallery/ folder
 * 3. Auto-detect category, finish, and location from filenames
 * 4. Save everything to the database
 * 5. Generate a report of what was uploaded
 * 
 * USAGE:
 * node scripts/auto-gallery-upload.js
 * 
 * PREREQUISITES:
 * - Images in: backend/uploads/gallery/
 * - Named with descriptive filenames
 * - .env file with Cloudinary credentials
 */

import fs from 'fs';
import path from 'path';
import { uploadImage } from '../src/services/cloudinary.js';
import ProductModel from '../src/models/productModel.js';
import db from '../src/config/database.js';
import logger from '../src/middlewares/logger.js';
import 'dotenv/config';

// ============================================================
// CATEGORY AND FINISH PATTERNS
// ============================================================

const patterns = {
  categories: {
    'kitchen': 'partitions',
    'cabinet': 'partitions',
    'door': 'doors',
    'frameless': 'doors',
    'sliding': 'doors',
    'swing': 'doors',
    'window': 'windows',
    'shower': 'windows',
    'bathroom': 'windows',
    'partition': 'partitions',
    'gypsum': 'partitions',
    'wall': 'partitions',
    'ceiling': 'partitions',
    'office': 'partitions',
    'shop': 'partitions',
    'counter': 'partitions',
    'display': 'partitions',
    'curtain': 'curtain_walls',
    'balustrade': 'balustrades',
    'rail': 'balustrades'
  },
  
  finishes: {
    'champagne': 'champagne',
    'bronze': 'bronze',
    'wood': 'bronze',
    'gold': 'silver',
    'silver': 'silver',
    'black': 'black',
    'grey': 'black',
    'white': 'mill',
    'natural': 'mill',
    'plain': 'mill',
    'aluminium': 'mill'
  },
  
  locations: {
    'karen': 'Karen Estate, Nairobi',
    'diani': 'Diani, Kwale County',
    'migaa': 'Migaa Golf Estate, Kiambu',
    'westlands': 'Westlands, Nairobi',
    'gtc': 'GTC, Westlands, Nairobi',
    'eastleigh': 'Eastleigh Estate, Nairobi',
    'isiolo': 'Isiolo County',
    'sericho': 'Isiolo County',
    'oyugis': 'Oyugis, Homa Bay County',
    'homa bay': 'Homa Bay County',
    'south c': 'South C, Nairobi',
    'njorome': 'Nairobi',
    'nairobi': 'Nairobi, Kenya'
  }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const getCategoryFromFilename = (filename) => {
  const lower = filename.toLowerCase();
  for (const [keyword, category] of Object.entries(patterns.categories)) {
    if (lower.includes(keyword)) {
      return category;
    }
  }
  return 'partitions'; // Default fallback
};

const getFinishFromFilename = (filename) => {
  const lower = filename.toLowerCase();
  for (const [keyword, finish] of Object.entries(patterns.finishes)) {
    if (lower.includes(keyword)) {
      return finish;
    }
  }
  return 'mill'; // Default fallback
};

const getLocationFromFilename = (filename) => {
  const lower = filename.toLowerCase();
  for (const [keyword, location] of Object.entries(patterns.locations)) {
    if (lower.includes(keyword)) {
      return location;
    }
  }
  return 'Nairobi, Kenya'; // Default fallback
};

const extractProjectName = (filename) => {
  // Remove extension and split by hyphens
  const name = path.parse(filename).name;
  const parts = name.split('-').filter(part => 
    !/^\d{2}$/.test(part) // Remove leading numbers
  );
  
  // Convert to readable format
  return parts.map(p => 
    p.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  ).join(' ');
};

const detectMediaType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
  return videoExtensions.includes(ext) ? 'video' : 'image';
};

// ============================================================
// MAIN FUNCTIONS
// ============================================================

const cleanupGallery = async () => {
  console.log('🗑️  Cleaning up existing gallery...');
  
  const { count: beforeCount } = await db('gallery_photos')
    .count('* as count')
    .first();
  
  await db('gallery_photos').del();
  
  const { count: afterCount } = await db('gallery_photos')
    .count('* as count')
    .first();
  
  console.log(`✅ Deleted ${beforeCount} images, ${afterCount} remaining\n`);
};

const uploadImages = async () => {
  const galleryDir = path.resolve(process.cwd(), 'uploads', 'gallery');
  
  if (!fs.existsSync(galleryDir)) {
    console.error('❌ Gallery directory not found:', galleryDir);
    return [];
  }
  
  const files = fs.readdirSync(galleryDir)
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm'].includes(ext);
    });
  
  console.log(`📁 Found ${files.length} files to upload\n`);
  
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(galleryDir, file);
    
    console.log(`📤 Uploading ${i + 1}/${files.length}: ${file}`);
    
    try {
      // Detect metadata from filename
      const category = getCategoryFromFilename(file);
      const finish = getFinishFromFilename(file);
      const location = getLocationFromFilename(file);
      const projectName = extractProjectName(file);
      const mediaType = detectMediaType(file);
      
      console.log(`   Category: ${category}, Finish: ${finish}, Location: ${location}`);
      
      // Upload to Cloudinary
      const result = await uploadImage(filePath, {
        folder: 'theolan/gallery',
        resource_type: mediaType === 'video' ? 'video' : 'auto',
        public_id: `gallery_${Date.now()}_${i}`
      });
      
      if (!result.success) {
        throw new Error('Cloudinary upload failed');
      }
      
      // Save to database
      const photo = await ProductModel.createGalleryPhoto({
        image_url: result.url,
        category,
        finish,
        project_name: projectName,
        location,
        description: projectName,
        published: true,
        media_type: mediaType
      });
      
      results.push({
        file,
        id: photo.id,
        url: result.url,
        success: true
      });
      
      console.log(`   ✅ Uploaded: ${photo.id.substring(0, 8)}...\n`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
      results.push({
        file,
        error: error.message,
        success: false
      });
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
};

// ============================================================
// MAIN EXECUTION
// ============================================================

const main = async () => {
  console.log('=== AUTOMATED GALLERY UPLOAD ===\n');
  
  try {
    // Step 1: Clean up old images
    await cleanupGallery();
    
    // Step 2: Upload new images
    const results = await uploadImages();
    
    // Step 3: Generate report
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('=== UPLOAD COMPLETE ===');
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Success Rate: ${(successful / results.length * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\nFailed uploads:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.file}: ${r.error}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    error.details && console.error(error.details);
    process.exit(1);
  }
};

main();