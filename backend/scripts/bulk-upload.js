#!/usr/bin/env node

/**
 * Bulk Upload Script for Gallery Images
 * 
 * This script:
 * 1. Deletes existing gallery images (except specified IDs)
 * 2. Uploads new images to Cloudinary with metadata
 * 3. Saves the URLs to the database
 * 
 * USAGE:
 * node scripts/bulk-upload.js
 * 
 * Before running:
 * 1. Set CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env
 * 2. Fill in the IMAGES array with file paths and metadata
 * 3. Set DELETE_EXISTING to true to remove old images
 */

import fs from 'fs';
import path from 'path';
import { uploadImage } from '../src/services/cloudinary.js';
import ProductModel from '../src/models/productModel.js';
import db from '../src/config/database.js';
import logger from '../src/middlewares/logger.js';
import 'dotenv/config';

// ============================================================
// CONFIGURATION
// ============================================================

// Set to true to delete existing images first
const DELETE_EXISTING = true;

// ID of the test image to keep (if any)
const KEEP_IMAGE_IDS = []; // Add image IDs to preserve, empty array = delete all

// ============================================================
// IMAGE DATA - Fill this with your actual image files and metadata
// ============================================================

const IMAGES = [
  // Format: { fileName, category, finish, projectName, location, description }
  // Example:
  {
    fileName: 'image1.jpg',
    category: 'windows',
    finish: 'champagne',
    projectName: 'Kitchen Cabinets',
    location: 'South C, Nairobi',
    description: 'Modern kitchen cabinets with aluminium frames'
  },
  // Add all 56 images here with their metadata
  // ...
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Map project names to categories based on metadata patterns
 */
const detectCategory = (projectName) => {
  const name = projectName.toLowerCase();
  if (name.includes('kitchen') || name.includes('cabinet')) return 'partitions';
  if (name.includes('door')) return 'doors';
  if (name.includes('window')) return 'windows';
  if (name.includes('shower') || name.includes('bathroom')) return 'windows';
  if (name.includes('office') || name.includes('partition')) return 'partitions';
  if (name.includes('wall') || name.includes('ceiling')) return 'partitions';
  if (name.includes('shop') || name.includes('counter')) return 'partitions';
  return 'windows'; // default
};

/**
 * Map finish descriptions to finish types
 */
const detectFinish = (projectName, description) => {
  const text = `${projectName || ''} ${description || ''}`.toLowerCase();
  if (text.includes('wood')) return 'bronze';
  if (text.includes('champagne')) return 'champagne';
  if (text.includes('gold')) return 'silver';
  if (text.includes('black')) return 'black';
  if (text.includes('grey')) return 'black';
  return 'mill'; // default
};

/**
 * Detect location from project name
 */
const detectLocation = (projectName) => {
  const name = projectName.toLowerCase();
  if (name.includes('karen')) return 'Karen Estate, Nairobi';
  if (name.includes('diani')) return 'Diani, Kwale County';
  if (name.includes('migaa') || name.includes('kiambu')) return 'Migaa Golf Estate, Kiambu';
  if (name.includes('westlands') || name.includes('gtc')) return 'Westlands, Nairobi';
  if (name.includes('eastleigh')) return 'Eastleigh Estate, Nairobi';
  if (name.includes('isiolo')) return 'Isiolo County';
  if (name.includes('homa bay') || name.includes('oyugis')) return 'Homa Bay County';
  return 'Nairobi, Kenya'; // default
};

// ============================================================
// MAIN FUNCTIONS
// ============================================================

/**
 * Delete all existing gallery images (except those to keep)
 */
const deleteExistingImages = async () => {
  console.log('Deleting existing gallery images...');
  
  const deleted = await db('gallery_photos')
    .whereNotIn('id', KEEP_IMAGE_IDS)
    .del();
  
  console.log(`Deleted ${deleted} existing images`);
};

/**
 * Upload a single image to Cloudinary and save to database
 */
const uploadImageToGallery = async (imageData, index) => {
  const filePath = path.resolve(process.cwd(), imageData.fileName);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return null;
  }

  try {
    console.log(`📤 Uploading image ${index + 1}/${IMAGES.length}: ${imageData.fileName}`);
    
    // Upload to Cloudinary
    const result = await uploadImage(filePath, {
      folder: 'theolan/gallery',
      resource_type: 'auto',
      public_id: `gallery_${Date.now()}_${index}`
    });

    if (!result.success) {
      throw new Error('Cloudinary upload failed');
    }

    // Prepare gallery photo data
    const galleryData = {
      image_url: result.url,
      category: imageData.category || detectCategory(imageData.projectName),
      finish: imageData.finish || detectFinish(imageData.projectName, imageData.description),
      project_name: imageData.projectName,
      location: imageData.location || detectLocation(imageData.projectName),
      description: imageData.description || imageData.projectName,
      published: true,
      media_type: result.media_type || 'image'
    };

    // Save to database
    const photo = await ProductModel.createGalleryPhoto({
      ...galleryData,
      uploaded_by: null // Will be set to system user ID if needed
    });

    console.log(`✅ Uploaded: ${photo.id} - ${photo.project_name}`);
    return photo;

  } catch (error) {
    console.error(`❌ Failed to upload ${imageData.fileName}:`, error.message);
    return null;
  }
};

/**
 * Main execution
 */
const main = async () => {
  console.log('=== Bulk Gallery Upload Script ===\n');

  try {
    // Step 1: Delete existing images (except those to keep)
    if (DELETE_EXISTING) {
      await deleteExistingImages();
    }

    // Step 2: Upload new images
    console.log('\n📸 Starting bulk upload...\n');
    
    const results = [];
    for (let i = 0; i < IMAGES.length; i++) {
      const result = await uploadImageToGallery(IMAGES[i], i);
      if (result) {
        results.push(result);
      }
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n✅ Complete! ${results.length}/${IMAGES.length} images uploaded successfully`);
    
    // Summary
    const stats = await db('gallery_photos').count('* as count').first();
    console.log(`Total gallery images in database: ${stats.count}`);

  } catch (error) {
    console.error('❌ Bulk upload failed:', error.message);
    throw error;
  }
};

// ============================================================
// RUN SCRIPT
// ============================================================

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });