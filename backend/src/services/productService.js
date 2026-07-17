import ProductModel from '../models/productModel.js';
import { NotFoundError, ValidationError } from '../middlewares/errorHandler.js';
import logger from '../middlewares/logger.js';

// ============================================================
// Finish Multipliers (applied on top of product_rates)
// ============================================================

const FINISH_MULTIPLIERS = {
  mill: 1.0,
  silver: 1.05,
  black: 1.15,
  champagne: 1.1,
  bronze: 1.12,
  clear: 1.0,
  brushed: 1.05,
  white: 1.02,
  wood_effect: 1.10,
  natural: 1.0
};

// ============================================================
// Quote Service
// ============================================================

const QuoteService = {
  /**
   * Calculate an instant estimate for a product.
   *
   * Formula:
   *   area_sqm = width_m × height_m
   *   total_area = area_sqm × quantity
   *   base_cost = total_area × base_rate_per_sqm_kes
   *   glazing_adjusted = base_cost × double_glazing_multiplier (if applicable)
   *   finish_adjusted = glazing_adjusted × finish_multiplier
   *   estimate_range = ±8% of finish_adjusted (covers installation variability)
   *
   * @param {Object} input - Validated quote request
   * @returns {Promise<Object>} Quote estimate with range
   */
  calculateQuote: async (input) => {
    const { product_id, width_meters, height_meters, quantity, double_glazing, finish } = input;

    // Step 1: Fetch the product
    const product = await ProductModel.findById(product_id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Step 2: Fetch the current rate for this product
    const rate = await ProductModel.getCurrentRate(product_id);
    if (!rate) {
      logger.error('No active rate found for product', { productId: product_id });
      throw new ValidationError(
        'Pricing is not yet available for this product. Please contact us for a custom quote.'
      );
    }

    // Step 3: Calculate area
    const area_sqm = parseFloat((width_meters * height_meters).toFixed(2));
    const total_area_sqm = parseFloat((area_sqm * quantity).toFixed(2));

    // Step 4: Get base rate
    const base_rate_per_sqm = parseFloat(rate.base_rate_per_sqm_kes);

    // Step 5: Apply double glazing multiplier
    const glazing_multiplier = double_glazing ? parseFloat(rate.double_glazing_multiplier) : 1.0;

    // Step 6: Apply finish multiplier
    const finish_multiplier = FINISH_MULTIPLIERS[finish] || 1.0;

    // Step 7: Calculate subtotal
    const subtotal_kes = parseFloat(
      (total_area_sqm * base_rate_per_sqm * glazing_multiplier * finish_multiplier).toFixed(2)
    );

    // Step 8: Apply ±8% range for installation variability
    const variance = 0.08;
    const estimate_min_kes = Math.round(subtotal_kes * (1 - variance));
    const estimate_max_kes = Math.round(subtotal_kes * (1 + variance));

    logger.info('Quote calculated', {
      productId: product_id,
      productName: product.name,
      totalAreaSqm: total_area_sqm,
      subtotalKes: subtotal_kes,
      range: `${estimate_min_kes} - ${estimate_max_kes}`
    });

    return {
      success: true,
      data: {
        product_name: product.name,
        dimensions: {
          width_m: width_meters,
          height_m: height_meters,
          area_sqm: area_sqm
        },
        quantity,
        total_area_sqm: total_area_sqm,
        base_rate_per_sqm: base_rate_per_sqm,
        double_glazing_multiplier: glazing_multiplier,
        finish_multiplier: finish_multiplier,
        finish: finish,
        double_glazing: double_glazing,
        subtotal_kes: subtotal_kes,
        estimate_kes: subtotal_kes,
        estimate_min_kes: estimate_min_kes,
        estimate_max_kes: estimate_max_kes,
        estimate_range_kes: {
          min: estimate_min_kes,
          max: estimate_max_kes
        },
        disclaimer:
          'This is an estimate. Final quote after site survey may vary based on exact measurements, structural requirements, and installation complexity.'
      }
    };
  }
};

// ============================================================
// Product Service
// ============================================================

const ProductService = {
  /**
   * Get product catalogue with filters and pagination.
   *
   * @param {Object} options - { category, finish, sort_by, limit, offset }
   * @returns {Promise<Object>} Paginated product list
   */
  getProducts: async (options) => {
    const { data, total } = await ProductModel.findProducts(options);

    // Fetch current rates for all products to include double_glazing_multiplier
    const rates = await ProductModel.getAllCurrentRates();
    const ratesMap = {};
    if (rates.rows) {
      rates.rows.forEach(r => { ratesMap[r.product_id] = r; });
    }

    const products = data.map((p) => {
      const rate = ratesMap[p.id];
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        finish: p.finish,
        description: p.description,
        base_price_per_sqm_kes: parseFloat(p.base_price_per_sqm_kes),
        double_glazing_multiplier: rate ? parseFloat(rate.double_glazing_multiplier) : 1.35,
        image_url: p.image_url
      };
    });

    return {
      success: true,
      data: products,
      pagination: {
        total,
        limit: options.limit || 20,
        offset: options.offset || 0
      }
    };
  },

  /**
   * Get gallery photos with filters and pagination.
   *
   * @param {Object} options - { category, finish, search, limit, offset }
   * @returns {Promise<Object>} Paginated gallery list
   */
  getGallery: async (options) => {
    const { data, total } = await ProductModel.findGalleryPhotos(options);

    const photos = data.map((p) => ({
      id: p.id,
      category: p.category,
      finish: p.finish,
      project_name: p.project_name,
      location: p.location,
      description: p.description,
      image_url: p.image_url,
      published: p.published,
      uploaded_at: p.created_at,
      media_type: p.media_type || 'image'
    }));

    return {
      success: true,
      data: photos,
      pagination: {
        total,
        limit: options.limit || 20,
        offset: options.offset || 0
      }
    };
  },

  /**
   * Upload a new gallery photo (admin only).
   *
   * @param {Object} data - Photo data (image_url, category, etc.)
   * @param {string} adminId - Admin user UUID
   * @param {string} mediaType - 'image' or 'video'
   * @returns {Promise<Object>} Created photo record
   */
  uploadGalleryPhoto: async (data, adminId, mediaType = 'image') => {
    const { image_url, category, finish, project_name, location, description, published } = data;

    const photo = await ProductModel.createGalleryPhoto({
      image_url,
      category,
      finish: finish || null,
      project_name: project_name || null,
      location: location || null,
      description: description || null,
      published,
      uploaded_by: adminId,
      media_type: mediaType
    });

    logger.info('Gallery photo uploaded', {
      photoId: photo.id,
      category,
      adminId,
      mediaType
    });

    return {
      success: true,
      message: 'Gallery photo uploaded successfully',
      data: {
        id: photo.id,
        image_url: photo.image_url,
        category: photo.category,
        project_name: photo.project_name,
        published: photo.published,
        media_type: photo.media_type
      }
    };
  },

  /**
   * Delete a gallery photo (admin only).
   *
   * @param {string} photoId - Photo UUID
   * @returns {Promise<Object>} Success response
   */
  deleteGalleryPhoto: async (photoId) => {
    // Import Cloudinary delete function (dynamic import to avoid circular deps)
    const { deleteImage } = await import('./cloudinary.js');

    // Fetch the photo record BEFORE deletion to get image_url
    const photo = await ProductModel.findGalleryPhotoById(photoId);
    if (!photo) {
      throw new NotFoundError('Gallery photo not found');
    }

    // Delete from database (model now returns the deleted record)
    await ProductModel.deleteGalleryPhoto(photoId);

    // Extract public_id from image_url for Cloudinary deletion (non-blocking)
    // image_url could be a Cloudinary URL or a local path like /media/...
    if (photo.image_url) {
      const isCloudinaryUrl = photo.image_url.startsWith('http') && photo.image_url.includes('cloudinary');

      if (isCloudinaryUrl) {
        // Extract public_id from Cloudinary URL
        // Format: https://res.cloudinary.com/<cloud_name>/image/upload/<path>/<public_id>.<format>
        try {
          const urlParts = photo.image_url.split('/');
          const uploadIndex = urlParts.findIndex((part, i) => 
            i > 0 && urlParts[i-1] === 'upload'
          );
          
          if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
            // Get everything after 'upload' and before extension
            const publicIdWithExtension = urlParts.slice(uploadIndex + 1).join('/');
            // Remove file extension
            const dotIndex = publicIdWithExtension.lastIndexOf('.');
            const publicId = dotIndex > -1 ? publicIdWithExtension.substring(0, dotIndex) : publicIdWithExtension;

            // Non-blocking Cloudinary deletion
            deleteImage(publicId).catch((err) => {
              logger.warn('Cloudinary delete failed for gallery photo (non-blocking)', {
                photoId,
                publicId,
                error: err.message
              });
            });

            logger.info('Scheduled Cloudinary deletion for gallery photo', { photoId, publicId });
          }
        } catch (err) {
          logger.warn('Failed to extract/execute Cloudinary delete', { photoId, error: err.message });
        }
      } else {
        logger.info('Gallery photo has non-Cloudinary image, skipping remote delete', { photoId, image_url: photo.image_url });
      }
    }

    logger.info('Gallery photo deleted', { photoId });

    return {
      success: true,
      message: 'Gallery photo deleted successfully'
    };
  },

  /**
   * Update gallery photo metadata (admin only).
   *
   * @param {string} photoId - Photo UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated photo
   */
  updateGalleryPhoto: async (photoId, updates) => {
    const updated = await ProductModel.updateGalleryPhoto(photoId, updates);
    if (!updated) {
      throw new NotFoundError('Gallery photo not found');
    }

    logger.info('Gallery photo updated', { photoId });

    return {
      success: true,
      message: 'Gallery photo updated successfully',
      data: {
        id: updated.id,
        project_name: updated.project_name,
        description: updated.description,
        published: updated.published
      }
    };
  }
};

export { QuoteService, ProductService };
export default { QuoteService, ProductService };
