// Gallery Seeder - Based on Image Analysis
// Updated with client-confirmed featured projects structure

/**
 * @param {import('knex')} knex
 */
exports.seed = async function (knex) {
  // Clear existing gallery photos
  await knex('gallery_photos').del();

  // KEEPER IMAGES (32 total) - Gallery ready
  // Uses original flat image naming since files remain in /public/images/
  const galleryPhotos = [
    // === WINDOWS ===
    {
      category: 'windows',
      finish: 'bronze',
      project_name: 'Apartment Casement - Westlands',
      location: 'TBD (Client to confirm)',
      image_url: '/images/image 1.jpg',
      description: 'Double casement window with natural light - Strongest image in batch',
      published: true
    },
    {
      category: 'windows',
      finish: 'black',
      project_name: 'Villa Staircase Interior',
      location: 'TBD (Client to confirm)',
      image_url: '/images/image 29.jpg',
      description: 'Interior glazing with staircase view - Featured project',
      published: true
    },
    {
      category: 'windows',
      finish: 'black',
      project_name: 'Multistorey Windows',
      location: 'TBD (Client to confirm)',
      image_url: '/images/image 48.jpg',
      description: 'Black-framed windows across multiple floors on unfinished facade',
      published: true
    },
    {
      category: 'windows',
      finish: 'bronze',
      project_name: 'Bungalow Front View',
      location: 'TBD (Client to confirm)',
      image_url: '/images/image 59.jpg',
      description: 'Finished home with bronze windows - strong marketing shot - Featured project',
      published: true
    },
    {
      category: 'windows',
      finish: 'white',
      project_name: 'Lodge Cottage Window',
      location: 'TBD (Client to confirm)',
      image_url: '/images/image 63.jpg',
      description: 'Window detail on tropical lodge cottage - Featured project',
      published: true
    },
    {
      category: 'windows',
      finish: 'black',
      project_name: 'Interior Window View',
      location: 'TBD (Client to confirm)',
      image_url: '/images/image 73.jpg',
      description: 'Large windows with natural interior light',
      published: true
    },

    // === DOORS ===
    {
      category: 'doors',
      finish: 'silver',
      project_name: 'Office Swing Door',
      location: 'TBD (Client to confirm)',
      image_url: '/images/image 41.jpg',
      description: 'Glass swing door with city skyline view',
      published: true
    },
    {
      category: 'doors',
      finish: 'silver',
      project_name: 'Office Corridor Doors',
      location: 'TBD (Client to confirm)',
      image_url: '/images/image 42.jpg',
      description: 'Multiple double-leaf glass doors along corridor',
      published: true
    },
    {
      category: 'doors',
      finish: 'white',
      project_name: 'Commercial Swing Door',
      location: 'TBD (Client to confirm)',
      image_url: '/images/image 57.jpg',
      description: 'Single glazed swing door in commercial space',
      published: true
    },
    {
      category: 'doors',
      finish: 'black',
      project_name: 'Storefront Entrance',
      location: 'TBD (Client to confirm)',
      image_url: '/images/image 72.jpg',
      description: 'Black-framed commercial storefront entrance',
      published: true
    },

    // === PARTITIONS ===
    {
      category: 'partitions',
      finish: 'white',
      project_name: 'Office Glass Partition',
      location: 'TBD (Client to confirm)',
      image_url: '/images/image 2.jpg',
      description: 'Office partition with oak panel detail',
      published: true
    },
    {
      category: 'partitions',
      finish: 'white',
      project_name: 'Office Partition Corner',
      location: 'TBD (Client to confirm)',
      image_url: '/images/image 3.jpg',
      description: 'Corner view showing panel intersection',
      published: true
    },

    // === CURTAIN WALLS ===
    {
      category: 'curtain_walls',
      finish: 'black',
      project_name: 'Modern Villa Curtain Wall',
      location: 'TBD (Client to confirm)',
      image_url: '/images/image 24.jpg',
      description: 'Large villa with black curtain walls - Featured project',
      published: true
    },
    {
      category: 'curtain_walls',
      finish: 'black',
      project_name: 'Building Curved Facade',
      location: 'TBD (Client to confirm)',
      image_url: '/images/image 64.jpg',
      description: 'Modern building with curved fascia glazing - Featured project',
      published: true
    },

    // === BALAUSTRADES ===
    {
      category: 'balustrades',
      finish: 'black',
      project_name: 'Villa Balustrade',
      location: 'TBD (Client to confirm)',
      image_url: '/images/image 31.jpg',
      description: 'Glass balustrade with black mullions - Featured project',
      published: true
    },
    {
      category: 'balustrades',
      finish: 'black',
      project_name: 'Balcony Railing Detail',
      location: 'TBD (Client to confirm)',
      image_url: '/images/image 70.jpg',
      description: 'Modern glass balcony railing close-up',
      published: true
    },

    // === PROJECT SPOTLIGHT - Terrace combo ===
    {
      category: 'windows',
      finish: 'black',
      project_name: 'Terrace Window Door Combo',
      location: 'TBD (Client to confirm)',
      image_url: '/images/image 58.jpg',
      description: 'Terrace glazing with door combination',
      published: true
    }
  ];

  // Insert gallery photos
  await knex('gallery_photos').insert(galleryPhotos);

  console.log(`Seeded ${galleryPhotos.length} gallery photos`);
  console.log('Note: Location fields marked as TBD - requires client confirmation');
};
