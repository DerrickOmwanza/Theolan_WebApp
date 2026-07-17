import { db } from '../config/database.js';

/**
 * Product Model
 * Data access layer for products, product rates, and gallery photos.
 */
const ProductModel = {

  // ============================================================
  // Product Catalogue Queries
  // ============================================================

  /**
   * Get published products with optional filters.
   *
   * @param {Object} options - { category, finish, sort_by, limit, offset }
   * @returns {Promise<{data: Array, total: number}>}
   */
  findProducts: async ({ category, finish, sort_by, limit = 20, offset = 0 } = {}) => {
    let query = db('products')
      .where({ published: true });

    let countQuery = db('products')
      .where({ published: true })
      .count('id as total');

    if (category) {
      query = query.where({ category });
      countQuery = countQuery.where({ category });
    }

    if (finish) {
      query = query.where({ finish });
      countQuery = countQuery.where({ finish });
    }

    // Sorting
    switch (sort_by) {
      case 'price_asc':
        query = query.orderBy('base_price_per_sqm_kes', 'asc');
        break;
      case 'price_desc':
        query = query.orderBy('base_price_per_sqm_kes', 'desc');
        break;
      case 'name':
        query = query.orderBy('name', 'asc');
        break;
      default:
        query = query.orderBy('category', 'asc').orderBy('name', 'asc');
    }

    const [data, countResult] = await Promise.all([
      query.limit(limit).offset(offset),
      countQuery.first()
    ]);

    return {
      data,
      total: parseInt(countResult.total, 10)
    };
  },

  /**
   * Find a product by ID.
   *
   * @param {string} id - Product UUID
   * @returns {Promise<Object|null>}
   */
  findById: (id) => {
    return db('products').where({ id, published: true }).first();
  },

  // ============================================================
  // Product Rates Queries
  // ============================================================

  /**
   * Get the current active rate for a product.
   * Uses the most recent effective_from date that is <= today.
   *
   * @param {string} productId - Product UUID
   * @returns {Promise<Object|null>} Rate record
   */
  getCurrentRate: (productId) => {
    return db('product_rates')
      .where({ product_id: productId })
      .where('effective_from', '<=', db.fn.now())
      .orderBy('effective_from', 'desc')
      .first();
  },

  /**
   * Get all active rates for all products (used by quote engine cache).
   *
   * @returns {Promise<Array>}
   */
  getAllCurrentRates: () => {
    return db.raw(`
      SELECT DISTINCT ON (product_id) *
      FROM product_rates
      WHERE effective_from <= CURRENT_DATE
      ORDER BY product_id, effective_from DESC
    `);
  },

  // ============================================================
  // Gallery Queries
  // ============================================================

  /**
   * Get published gallery photos with optional filters.
   *
   * @param {Object} options - { category, finish, search, limit, offset }
   * @returns {Promise<{data: Array, total: number}>}
   */
  findGalleryPhotos: async ({ category, finish, search, limit = 20, offset = 0 } = {}) => {
    let query = db('gallery_photos')
      .select(
        'gallery_photos.*',
        db.raw('u.name as uploaded_by_name')
      )
      .leftJoin('users as u', 'gallery_photos.uploaded_by', 'u.id')
      .where('gallery_photos.published', true);

    let countQuery = db('gallery_photos')
      .where('published', true)
      .count('id as total');

    if (category) {
      query = query.where('gallery_photos.category', category);
      countQuery = countQuery.where('category', category);
    }

    if (finish) {
      query = query.where('gallery_photos.finish', finish);
      countQuery = countQuery.where('finish', finish);
    }

    if (search) {
      const searchTerm = `%${search}%`;
      query = query.where(function () {
        this.whereILike('gallery_photos.project_name', searchTerm)
          .orWhereILike('gallery_photos.description', searchTerm)
          .orWhereILike('gallery_photos.location', searchTerm);
      });
      countQuery = countQuery.where(function () {
        this.whereILike('project_name', searchTerm)
          .orWhereILike('description', searchTerm)
          .orWhereILike('location', searchTerm);
      });
    }

    query = query.orderBy('gallery_photos.created_at', 'desc');

    const [data, countResult] = await Promise.all([
      query.limit(limit).offset(offset),
      countQuery.first()
    ]);

    return {
      data,
      total: parseInt(countResult.total, 10)
    };
  },

  // ============================================================
  // Gallery Management (Admin)
  // ============================================================

  createGalleryPhoto: async (photoData) => {
    const [photo] = await db('gallery_photos').insert(photoData).returning('*');
    return photo;
  },

  findGalleryPhotoById: async (id) => {
    return db('gallery_photos').where({ id }).first();
  },

  deleteGalleryPhoto: async (id) => {
    const [photo] = await db('gallery_photos').where({ id }).del().returning('*');
    return photo;  // Returns the photo record or undefined
  },

  updateGalleryPhoto: async (id, updates) => {
    const [photo] = await db('gallery_photos')
      .where({ id })
      .update(updates)
      .returning('*');
    return photo;
  }
};

export default ProductModel;
