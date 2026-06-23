// Gallery Image Seeder Script
// Processes local images and imports them into gallery_photos table

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, '../../images');

// Image categories matching migration constraints
const CATEGORIES = ['windows', 'doors', 'curtain_walls', 'partitions', 'balustrades'];

// Finish options matching migration constraints
const FINISHES = ['mill', 'silver', 'black', 'champagne', 'bronze'];

const LOCATIONS = [
  'Nairobi Westlands',
  'Nairobi Kileleshwa',
  'Nairobi Muthaiga',
  'Nairobi Gigiri',
  'Nairobi Karen',
  'Nairobi Industrial Area',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Thika'
];

const CATEGORY_LABELS = {
  windows: 'Windows',
  doors: 'Doors',
  curtain_walls: 'Curtain Walls',
  partitions: 'Partitions',
  balustrades: 'Balustrades'
};

/**
 * Generate category and finish for each image
 */
const generateImageData = (index, filename) => {
  const category = CATEGORIES[index % CATEGORIES.length];
  const finish = FINISHES[Math.floor(index / 5) % FINISHES.length];
  const location = LOCATIONS[index % LOCATIONS.length];

  return {
    project_name: `${CATEGORY_LABELS[category]} - ${location.split(' ')[0]} ${index + 1}`,
    description: `${CATEGORY_LABELS[category]} installation in ${location}`,
    category,
    finish,
    location,
    image_url: `/images/${filename}`,
    published: true,
    created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
  };
};

/**
 * Seed images into gallery_photos table
 */
export async function seed(knex) {
  // Skip seeding - images are already handled by the other seed file
  // or will be added via admin panel
  console.log('Gallery image seeding skipped (handled separately)');
}
