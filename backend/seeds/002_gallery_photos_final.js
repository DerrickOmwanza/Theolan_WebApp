// Gallery Seeder - Initial placeholder data for admin management
// Admin can edit/update all details through the web application

/**
 * @param {import('knex')} knex
 */
exports.seed = async function (knex) {
  // Clear existing gallery photos
  await knex('gallery_photos').del();

  // Initial 18 placeholder images - admin will update location/project details
  // All images in /public/images/ folder ready for admin review
  const galleryPhotos = [
    // WINDOWS
    {
      category: 'windows',
      finish: 'bronze',
      location: '',
      image_url: '/images/image 1.jpg',
      published: true
    },
    {
      category: 'windows',
      finish: 'black',
      location: '',
      image_url: '/images/image 29.jpg',
      published: true
    },
    {
      category: 'windows',
      finish: 'black',
      location: '',
      image_url: '/images/image 48.jpg',
      published: true
    },
    {
      category: 'windows',
      finish: 'bronze',
      location: '',
      image_url: '/images/image 59.jpg',
      published: true
    },
    {
      category: 'windows',
      finish: 'white',
      location: '',
      image_url: '/images/image 63.jpg',
      published: true
    },
    {
      category: 'windows',
      finish: 'black',
      location: '',
      image_url: '/images/image 73.jpg',
      published: true
    },

    // DOORS
    {
      category: 'doors',
      finish: 'silver',
      location: '',
      image_url: '/images/image 41.jpg',
      published: true
    },
    {
      category: 'doors',
      finish: 'silver',
      location: '',
      image_url: '/images/image 42.jpg',
      published: true
    },
    {
      category: 'doors',
      finish: 'white',
      location: '',
      image_url: '/images/image 57.jpg',
      published: true
    },
    {
      category: 'doors',
      finish: 'black',
      location: '',
      image_url: '/images/image 72.jpg',
      published: true
    },

    // PARTITIONS
    {
      category: 'partitions',
      finish: 'white',
      location: '',
      image_url: '/images/image 2.jpg',
      published: true
    },
    {
      category: 'partitions',
      finish: 'white',
      location: '',
      image_url: '/images/image 3.jpg',
      published: true
    },

    // CURTAIN WALLS
    {
      category: 'curtain_walls',
      finish: 'black',
      location: '',
      image_url: '/images/image 24.jpg',
      published: true
    },
    {
      category: 'curtain_walls',
      finish: 'black',
      location: '',
      image_url: '/images/image 64.jpg',
      published: true
    },

    // BALUSTRADES
    {
      category: 'balustrades',
      finish: 'black',
      location: '',
      image_url: '/images/image 31.jpg',
      published: true
    },
    {
      category: 'balustrades',
      finish: 'black',
      location: '',
      image_url: '/images/image 70.jpg',
      published: true
    },

    // MIXED USE
    {
      category: 'windows',
      finish: 'black',
      location: '',
      image_url: '/images/image 58.jpg',
      published: true
    }
  ];

  // Insert gallery photos
  await knex('gallery_photos').insert(galleryPhotos);

  console.log(`Seeded ${galleryPhotos.length} gallery placeholder images`);
  console.log('Admin can now log in to update: location, project_name, description');
  console.log(
    'Images available: 74 total in /public/images/, admin can add/remove via admin panel'
  );
};
