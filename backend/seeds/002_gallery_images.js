// Gallery Image Seeder Script
// Processes local images and imports them into gallery_photos table
// Uses CommonJS for Knex seed compatibility

const fs = require('fs');
const path = require('path');

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
exports.seed = async function (knex) {
  try {
    // Read all image files
    const files = fs
      .readdirSync(IMAGES_DIR)
      .filter((f) => f.endsWith('.jpg') && f !== 'logo.jpg')
      .sort();

    console.log(`Found ${files.length} images to seed into gallery`);

    // Generate image data
    const imageRecords = files.map((file, index) => generateImageData(index, file));

    // Insert into database using Knex
    for (const record of imageRecords) {
      await knex('gallery_photos').insert(record).onConflict('image_url').ignore();
    }

    const total = await knex('gallery_photos').count('id as total');
    console.log(`Seeded ${imageRecords.length} gallery images. Total in DB: ${total[0].total}`);
  } catch (error) {
    console.error('Error seeding gallery images:', error.message);
    throw error;
  }
};
