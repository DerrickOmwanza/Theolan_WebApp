#!/usr/bin/env node

/**
 * Gallery Cleanup Script
 * 
 * This script:
 * 1. Deletes all existing gallery images
 * 2. Generates a CSV template for easy metadata entry
 * 
 * USAGE:
 * node scripts/bulk-cleanup.js
 * 
 * After running:
 * - Old images will be deleted
 * - A template CSV file will be created: uploads/gallery-template.csv
 * - Upload your 56 images through the admin dashboard
 * - Import metadata from the CSV
 */

import fs from 'fs';
import path from 'path';
import db from '../src/config/database.js';
import logger from '../src/middlewares/logger.js';
import 'dotenv/config';

// ============================================================
// VALID CATEGORIES AND FINISHES FROM YOUR SYSTEM
// ============================================================

const VALID_CATEGORIES = [
  'windows',
  'doors', 
  'curtain_walls',
  'partitions',
  'balustrades'
];

const VALID_FINISHES = [
  'mill',
  'silver',
  'black',
  'champagne',
  'bronze'
];

// ============================================================
// CSV TEMPLATE GENERATION
// ============================================================

const generateCSVTemplate = () => {
  const header = 'fileName,category,finish,projectName,location,description,uploadToCloudinary (YES/NO)\n';
  
  const exampleLines = VALID_CATEGORIES.map((cat, catIndex) => {
    const finish = VALID_FINISHES[catIndex % VALID_FINISHES.length];
    return `image-${catIndex + 1}.jpg,${cat},${finish},Project Name ${catIndex + 1},City,Description for project ${catIndex + 1},YES`;
  }).join('\n');

  const instructions = `
# ==============================================
# THEOLAN ALUMINIUM - GALLERY IMAGE TEMPLATE
# ==============================================
# 
# INSTRUCTIONS:
# 1. Save this file as: uploads/gallery-images.csv
# 2. Edit each row with your image information
# 3. Make sure image files are in: backend/uploads/gallery/
# 4. Set "uploadToCloudinary" to YES (images will be uploaded via admin dashboard)
#
# COLUMNS:
# - fileName: Exact filename of your image (must match file in uploads/galler/)
# - category: One of: windows, doors, curtain_walls, partitions, balustrades
# - finish: One of: mill, silver, black, champagne, bronze
# - projectName: Name of the project/client
# - location: Location of the project (City, County)
# - description: Brief description of the work done
# - uploadToCloudinary: Set to YES
#
# ==============================================
#
`;
  
  return instructions + header + exampleLines;
};

// ============================================================
// DATABASE OPERATIONS
// ============================================================

const deleteAllGalleryImages = async () => {
  console.log('🗑️  Deleting all existing gallery images...\n');
  
  try {
    // Get count before deletion
    const { count: beforeCount } = await db('gallery_photos')
      .count('* as count')
      .first();
    
    console.log(`Found ${beforeCount} images to delete\n`);
    
    // Delete everything (no WHERE clause)
    const deletedCount = await db('gallery_photos').del();
    
    console.log(`✅ Successfully deleted ${deletedCount} images from gallery_photos table`);
    
    // Verify
    const { count: afterCount } = await db('gallery_photos')
      .count('* as count')
      .first();
    
    console.log(`Verification: ${afterCount} images remaining\n`);
    
  } catch (error) {
    console.error('❌ Error deleting images:', error.message);
    throw error;
  }
};

// ============================================================
// FILE OPERATIONS
// ============================================================

const createUploadDirectories = () => {
  const uploadDir = path.resolve(process.cwd(), 'uploads', 'gallery');
  const templateFile = path.resolve(process.cwd(), 'uploads', 'gallery-template.csv');
  
  // Create uploads/gallery directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`📁 Created upload directory: ${uploadDir}`);
  }
  
  // Create CSV template
  if (!fs.existsSync(templateFile)) {
    const csvContent = generateCSVTemplate();
    fs.writeFileSync(templateFile, csvContent, 'utf8');
    console.log(`📝 Created CSV template: ${templateFile}\n`);
  }
  
  return uploadDir;
};

// ============================================================
// MAIN EXECUTION
// ============================================================

const main = async () => {
  console.log('=== Gallery Cleanup Script ===\n');
  
  try {
    // Step 1: Create directories
    const uploadDir = createUploadDirectories();
    
    // Step 2: Delete existing images
    await deleteAllGalleryImages();
    
    // Step 3: Show next steps
    console.log('✅ Cleanup complete!\n');
    console.log('NEXT STEPS:');
    console.log('1. Place your 56 image files in:', uploadDir);
    console.log('2. Edit the CSV template to match your image metadata');
    console.log('3. Log into the admin dashboard');
    console.log('4. Upload each image through the Admin Gallery page');
    console.log('5. The upload form now supports drag-and-drop file uploads!');
    console.log('\n📁 Directory structure for your images:');
    console.log(`   backend/uploads/gallery/`);
    console.log('   ├── Put all 56 images here (e.g., project-1.jpg, project-2.jpg)');
    console.log('\n📋 CSV Template created at:');
    console.log('   backend/uploads/gallery-template.csv');
    console.log('\n🎉 Good luck with the bulk uploads!');
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
};

main();