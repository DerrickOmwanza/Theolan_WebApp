// Gallery Seeder - 24 starter images for admin management
// Total images in /public/images/: 24 (plus logo.jpg)

/**
 * @param {import('knex')} knex
 */
exports.seed = async function (knex) {
  // Clear existing gallery photos
  await knex('gallery_photos').del();

  // 24 manageable images - admin will update all details
  const galleryPhotos = [];

  for (let i = 1; i <= 24; i++) {
    const categories = ['windows', 'doors', 'curtain_walls', 'partitions', 'balustrades'];
    const finishes = ['mill', 'silver', 'black', 'bronze', 'champagne'];
    const locations = ['Nairobi', 'Mombasa', 'Kisumu'];

    galleryPhotos.push({
      category: categories[i % categories.length],
      finish: finishes[i % finishes.length],
      location: '', // Admin will fill in
      image_url: `/images/image ${i}.jpg`,
      published: true
    });
  }

  // Insert gallery photos
  await knex('gallery_photos').insert(galleryPhotos);

  console.log(`Seeded ${galleryPhotos.length} starter gallery images`);
  console.log('Admin can now login to update: project_name, location, description for each image');
};
