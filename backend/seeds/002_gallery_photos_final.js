// Gallery Seeder - 20 images categorized based on analysis
// Admin will update: project_name, location, description

/**
 * @param {import('knex')} knex
 */
exports.seed = async function (knex) {
  await knex('gallery_photos').del();

  // Categorized based on the analysis provided
  const galleryPhotos = [
    // Group 1: Windows (2, 11, 15)
    {
      category: 'windows',
      finish: 'bronze',
      location: '',
      image_url: '/images/image_2.jpg',
      published: true
    },
    {
      category: 'windows',
      finish: 'silver',
      location: '',
      image_url: '/images/image_11.jpg',
      published: true
    },
    {
      category: 'windows',
      finish: 'bronze',
      location: '',
      image_url: '/images/image_15.jpg',
      published: true
    },

    // Group 2: Doors (1, 8, 13)
    {
      category: 'doors',
      finish: 'black',
      location: '',
      image_url: '/images/image_1.jpg',
      published: true
    },
    {
      category: 'doors',
      finish: 'silver',
      location: '',
      image_url: '/images/image_8.jpg',
      published: true
    },
    {
      category: 'doors',
      finish: 'silver',
      location: '',
      image_url: '/images/image_13.jpg',
      published: true
    },

    // Group 3: Curtain Walls (3, 12)
    {
      category: 'curtain_walls',
      finish: 'black',
      location: '',
      image_url: '/images/image_3.jpg',
      published: true
    },
    {
      category: 'curtain_walls',
      finish: 'silver',
      location: '',
      image_url: '/images/image_12.jpg',
      published: true
    },

    // Group 4: Partitions (4, 6, 14)
    {
      category: 'partitions',
      finish: 'white',
      location: '',
      image_url: '/images/image_4.jpg',
      published: true
    },
    {
      category: 'partitions',
      finish: 'white',
      location: '',
      image_url: '/images/image_6.jpg',
      published: true
    },
    {
      category: 'partitions',
      finish: 'white',
      location: '',
      image_url: '/images/image_14.jpg',
      published: true
    },

    // Group 5: Balustrades (7, 9, 10)
    {
      category: 'balustrades',
      finish: 'black',
      location: '',
      image_url: '/images/image_7.jpg',
      published: true
    },
    {
      category: 'balustrades',
      finish: 'black',
      location: '',
      image_url: '/images/image_9.jpg',
      published: true
    },
    {
      category: 'balustrades',
      finish: 'black',
      location: '',
      image_url: '/images/image_10.jpg',
      published: true
    },

    // Group 6: Shower Enclosures (5)
    {
      category: 'shower_enclosures',
      finish: 'silver',
      location: '',
      image_url: '/images/image_5.jpg',
      published: true
    },

    // Group 7: Fabrication & Workshop (16-20)
    {
      category: 'partitions',
      finish: 'mill',
      location: '',
      image_url: '/images/image_16.jpg',
      published: true
    },
    {
      category: 'windows',
      finish: 'mill',
      location: '',
      image_url: '/images/image_17.jpg',
      published: true
    },
    {
      category: 'doors',
      finish: 'mill',
      location: '',
      image_url: '/images/image_18.jpg',
      published: true
    },
    {
      category: 'curtain_walls',
      finish: 'mill',
      location: '',
      image_url: '/images/image_19.jpg',
      published: true
    },
    {
      category: 'balustrades',
      finish: 'mill',
      location: '',
      image_url: '/images/image_20.jpg',
      published: true
    }
  ];

  await knex('gallery_photos').insert(galleryPhotos);

  console.log(`Seeded ${galleryPhotos.length} categorized gallery images`);
  console.log('Admin can update project details via admin panel');
};
