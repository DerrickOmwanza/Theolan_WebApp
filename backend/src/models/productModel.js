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
  },

  // ============================================================
  // Product CRUD (Admin)
  // ============================================================

  /**
   * Create a new product.
   * @param {Object} data - Product data
   * @returns {Promise<Array>} - Returns array with created record
   */
  createProduct: async (data) => {
    return db('products').insert(data).returning('*');
  },

  /**
   * Find ALL products (including unpublished) for admin view.
   * @param {Object} options - { limit, offset, category, finish, sort_by }
   * @returns {Promise<{data: Array, total: number}>}
   */
  findAllProducts: async ({ limit = 100, offset = 0, category, finish, sort_by = 'category' } = {}) => {
    let query = db('products');
    let countQuery = db('products').count('id as total');

    if (category) {
      query = query.where({ category });
      countQuery = countQuery.where({ category });
    }

    if (finish) {
      query = query.where({ finish });
      countQuery = countQuery.where({ finish });
    }

    // Sorting for admin view
    // Note: useProductsSelect is set before the switch to handle price-based sorting
    // which requires a LEFT JOIN with product_rates. Without explicit column selection,
    // the joined table's id/created_at/updated_at would overwrite the products table's.
    let useProductsSelect = false;

    switch (sort_by) {
      case 'name':
        query = query.orderBy('name', 'asc');
        break;
      case 'price_asc':
        query = query.leftJoin('product_rates', 'products.id', 'product_rates.product_id')
                     .orderBy('product_rates.base_rate_per_sqm_kes', 'asc');
        useProductsSelect = true;
        break;
      case 'price_desc':
        query = query.leftJoin('product_rates', 'products.id', 'product_rates.product_id')
                     .orderBy('product_rates.base_rate_per_sqm_kes', 'desc');
        useProductsSelect = true;
        break;
      default:
        query = query.orderBy('category', 'asc').orderBy('name', 'asc');
    }

    const [data, countResult] = await Promise.all([
      query.limit(limit).offset(offset)
        .select(useProductsSelect
          ? {
              id: 'products.id',
              name: 'products.name',
              category: 'products.category',
              finish: 'products.finish',
              description: 'products.description',
              base_price_per_sqm_kes: 'product_rates.base_rate_per_sqm_kes',
              image_url: 'products.image_url',
              published: 'products.published',
              created_at: 'products.created_at',
              updated_at: 'products.updated_at'
            }
          : '*'
        ),
      countQuery.first()
    ]);

    return {
      data,
      total: parseInt(countResult.total, 10)
    };
  },

  /**
   * Find a product by ID (any published status).
   * @param {string} id - Product UUID
   * @returns {Promise<Object|null>}
   */
  findProductById: async (id) => {
    return db('products').where({ id }).first();
  },

  /**
   * Update a product (partial update).
   * @param {string} id - Product UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Array>} - Returns array with updated record
   */
  updateProduct: async (id, updates) => {
    return db('products')
      .where({ id })
      .update({ ...updates, updated_at: db.fn.now() })
      .returning('*');
  },

  /**
   * Delete a product.
   * Note: product_rates row will be auto-deleted via ON DELETE CASCADE FK.
   * @param {string} id - Product UUID
   * @returns {Promise<void>}
   */
  deleteProduct: async (id) => {
    await db('products').where({ id }).del();
    // product_rates deleted automatically via FK CASCADE
  },

  // ============================================================
  // Product Rates (Admin)
  // ============================================================

  /**
   * Create a product rate for a newly created product.
   * Called automatically after product creation to ensure quotability.
   * @param {string} productId - Product UUID
   * @param {number} baseRate - base_rate_per_sqm_kes
   * @param {number} doubleGlazingMultiplier - Default 1.35
   * @param {number} finishMultiplier - Default 1.0
   * @returns {Promise<Object>} Created rate record
   */
  createProductRate: async (productId, baseRate, doubleGlazingMultiplier = 1.35, finishMultiplier = 1.0) => {
    const [rate] = await db('product_rates').insert({
      product_id: productId,
      base_rate_per_sqm_kes: baseRate,
      double_glazing_multiplier: doubleGlazingMultiplier,
      finish_multiplier: finishMultiplier,
      effective_from: db.fn.now()
    }).returning('*');
    return rate;
  },

  /**
   * Update a product's rate in place.
   * Used when product price changes.
   * @param {string} productId - Product UUID
   * @param {number} baseRate - New base_rate_per_sqm_kes
   * @returns {Promise<Object>} Updated rate record
   */
  updateProductRate: async (productId, baseRate) => {
    const [rate] = await db('product_rates')
      .where({ product_id: productId })
      .update({ base_rate_per_sqm_kes: baseRate })
      .returning('*');
    return rate;
  }
};

export default ProductModel;
