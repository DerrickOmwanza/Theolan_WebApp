import Joi from 'joi';
import path from 'path';
import { QuoteService, ProductService } from '../services/productService.js';
import ProductModel from '../models/productModel.js';
import { asyncHandler, ValidationError, NotFoundError } from '../middlewares/errorHandler.js';
import { uploadImage, uploadVideo } from '../services/cloudinary.js';
import logger from '../middlewares/logger.js';

// ============================================================
// Constants
// ============================================================

const CATEGORIES = [
  'windows', 
  'doors', 
  'curtain_walls', 
  'partitions', 
  'balustrades',
  'stainless_steel_railings',
  'frameless_glass',
  'gypsum_ceilings',
  'kitchen_cabinets',
  'floor_tiling'
];
const FINISHES = ['mill', 'silver', 'black', 'champagne', 'bronze', 'clear', 'brushed', 'white', 'wood_effect', 'natural'];
const SORT_OPTIONS = ['price_asc', 'price_desc', 'name'];

// ============================================================
// Validation Schemas
// ============================================================

const quoteSchema = Joi.object({
  product_id: Joi.string()
    .uuid()
    .required()
    .messages({ 'string.guid': 'product_id must be a valid UUID' }),
  width_meters: Joi.number().min(0.5).max(10).required().messages({
    'number.min': 'Width must be at least 0.5 meters',
    'number.max': 'Width cannot exceed 10 meters'
  }),
  height_meters: Joi.number().min(0.5).max(10).required().messages({
    'number.min': 'Height must be at least 0.5 meters',
    'number.max': 'Height cannot exceed 10 meters'
  }),
  quantity: Joi.number().integer().min(1).max(100).required().messages({
    'number.min': 'Quantity must be at least 1',
    'number.max': 'Quantity cannot exceed 100'
  }),
  double_glazing: Joi.boolean().optional().default(false),
  finish: Joi.string()
    .valid(...FINISHES)
    .required()
    .messages({ 'any.only': 'Finish must be one of: ' + FINISHES.join(', ') })
});

const productsQuerySchema = Joi.object({
  category: Joi.string()
    .valid(...CATEGORIES)
    .optional(),
  finish: Joi.string()
    .valid(...FINISHES)
    .optional(),
  sort_by: Joi.string()
    .valid(...SORT_OPTIONS)
    .optional(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0)
});

const galleryQuerySchema = Joi.object({
  category: Joi.string()
    .valid(...CATEGORIES)
    .optional(),
  finish: Joi.string()
    .valid(...FINISHES)
    .optional(),
  search: Joi.string().trim().max(200).allow('').optional(),
  limit: Joi.number().integer().min(1).max(1000).default(20),
  offset: Joi.number().integer().min(0).default(0)
});

const uploadGallerySchema = Joi.object({
  image_url: Joi.string().uri().max(500).allow('').optional(),
  category: Joi.string()
    .valid(...CATEGORIES)
    .required()
    .messages({ 'any.only': 'Category must be one of: ' + CATEGORIES.join(', ') }),
  finish: Joi.string()
    .valid(...FINISHES)
    .optional()
    .allow(null),
  project_name: Joi.string().trim().max(255).allow('', null).optional(),
  location: Joi.string().trim().max(255).allow('', null).optional(),
  description: Joi.string().trim().max(2000).allow('', null).optional(),
  published: Joi.boolean().optional().default(true)
});

const updateGallerySchema = Joi.object({
  project_name: Joi.string().trim().max(255).allow('', null).optional(),
  location: Joi.string().trim().max(255).allow('', null).optional(),
  description: Joi.string().trim().max(2000).allow('', null).optional(),
  published: Joi.boolean().optional()
});

const createProductSchema = Joi.object({
  name: Joi.string().trim().max(255).required(),
  category: Joi.string()
    .valid(...CATEGORIES)
    .required()
    .messages({ 'any.only': 'Category must be one of: ' + CATEGORIES.join(', ') }),
  finish: Joi.string()
    .valid(...FINISHES)
    .required()
    .messages({ 'any.only': 'Finish must be one of: ' + FINISHES.join(', ') }),
  description: Joi.string().trim().max(2000).allow('', null).optional(),
  base_price_per_sqm_kes: Joi.number().positive().required(),
  image_url: Joi.string().uri().max(500).allow('').optional(),
  published: Joi.boolean().optional().default(true)
});

const updateProductSchema = Joi.object({
  name: Joi.string().trim().max(255).optional(),
  category: Joi.string()
    .valid(...CATEGORIES)
    .optional()
    .messages({ 'any.only': 'Category must be one of: ' + CATEGORIES.join(', ') }),
  finish: Joi.string()
    .valid(...FINISHES)
    .optional()
    .messages({ 'any.only': 'Finish must be one of: ' + FINISHES.join(', ') }),
  description: Joi.string().trim().max(2000).allow('', null).optional(),
  base_price_per_sqm_kes: Joi.number().positive().optional(),
  image_url: Joi.string().uri().max(500).allow('').optional(),
  published: Joi.boolean().optional()
});

/**
 * Validate request data against a Joi schema.
 */
const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = error.details.map((d) => ({
      field: d.context?.key,
      issue: d.message
    }));
    throw new ValidationError(error.details[0].message, details);
  }
  return value;
};

// ============================================================
// Product Controller
// ============================================================

const ProductController = {
  /**
   * POST /api/v1/quote
   * Calculate instant estimate for a product.
   * @access Public
   */
  calculateQuote: asyncHandler(async (req, res) => {
    const input = validate(quoteSchema, req.body);
    const result = await QuoteService.calculateQuote(input);
    res.status(200).json(result);
  }),

  /**
   * GET /api/v1/products
   * Get product catalogue (public, filtered, paginated).
   * @access Public
   */
  getProducts: asyncHandler(async (req, res) => {
    const options = validate(productsQuerySchema, req.query);
    const result = await ProductService.getProducts(options);
    res.status(200).json(result);
  }),

  /**
   * GET /api/v1/products/gallery
   * Get published gallery photos (public, filtered, paginated).
   * @access Public
   */
  getGallery: asyncHandler(async (req, res) => {
    const options = validate(galleryQuerySchema, req.query);
    const result = await ProductService.getGallery(options);
    res.status(200).json(result);
  }),

  /**
   * POST /api/v1/products/gallery
   * Upload a new gallery photo (admin only).
   * Supports both file upload and direct URL.
   * @access Private (admin)
   */
  uploadGalleryPhoto: asyncHandler(async (req, res) => {
    // Validate the form fields (image_url is now optional since file upload is allowed)
    const data = validate(uploadGallerySchema, req.body);

    let imageUrl = data.image_url;
    let mediaType = 'image';

    // Handle file upload if present
    if (req.file) {
      const tempFilePath = req.file.path;
      let cleanupError = null;

      try {
        // Determine if it's a video or image based on MIME type and extension
        const isVideoMimeType = req.file.mimetype.startsWith('video/');
        const isVideoExt = req.file.originalname ? 
          ['.mp4', '.webm', '.mov', '.avi', '.mkv'].includes(
            path.extname(req.file.originalname).toLowerCase()
          ) : false;
        const isVideo = isVideoMimeType || isVideoExt;

        // Upload to Cloudinary
        let result;
        if (isVideo) {
          result = await uploadVideo(tempFilePath, {
            folder: 'theolan/gallery',
            resource_type: 'video'
          });
        } else {
          result = await uploadImage(tempFilePath, {
            folder: 'theolan/gallery',
            resource_type: 'auto'
          });
        }

        if (!result.success) {
          throw new ValidationError('Failed to upload media to Cloudinary');
        }

        imageUrl = result.url;
        mediaType = isVideo ? 'video' : 'image';

        logger.info('Media uploaded to Cloudinary', {
          url: imageUrl,
          mediaType,
          fileSize: req.file.size
        });
      } catch (error) {
        logger.error('Cloudinary upload failed', {
          error: error.message,
          filePath: tempFilePath
        });
        cleanupError = error;
      } finally {
        // ALWAYS clean up the temporary file - both on success and failure
        try {
          const fs = await import('fs');
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        } catch (cleanupErr) {
          logger.warn('Failed to cleanup temp file', {
            filePath: tempFilePath,
            error: cleanupErr.message
          });
        }
      }

      // Re-throw the original error if it occurred
      if (cleanupError) {
        throw new ValidationError('Failed to upload media file: ' + cleanupError.message);
      }
    }

    // At least one of image_url or file is required
    if (!imageUrl) {
      throw new ValidationError('Either upload a file or provide an image URL');
    }

    // Create the gallery photo record
    const result = await ProductService.uploadGalleryPhoto(
      {
        ...data,
        image_url: imageUrl
      },
      req.user.id,
      mediaType
    );

    res.status(201).json(result);
  }),

  /**
   * DELETE /api/v1/products/gallery/:id
   * Delete a gallery photo (admin only).
   * @access Private (admin)
   */
  deleteGalleryPhoto: asyncHandler(async (req, res) => {
    const result = await ProductService.deleteGalleryPhoto(req.params.id);
    res.status(200).json(result);
  }),

  /**
   * PATCH /api/v1/products/gallery/:id
   * Update gallery photo metadata (admin only).
   * @access Private (admin)
   */
  updateGalleryPhoto: asyncHandler(async (req, res) => {
    const data = validate(updateGallerySchema, req.body);
    const result = await ProductService.updateGalleryPhoto(req.params.id, data);
    res.status(200).json(result);
  }),

  // ============================================================
  // Product CRUD (Admin)
  // ============================================================

  /**
   * POST /api/v1/products
   * Create a new product (admin only).
   * Supports both file upload and direct image_url.
   * @access Private (admin)
   */
  createProduct: asyncHandler(async (req, res) => {
    const data = validate(createProductSchema, req.body);

    let imageUrl = data.image_url;

    // Handle file upload if present
    if (req.file) {
      const tempFilePath = req.file.path;
      let uploadError = null;

      try {
        const result = await uploadImage(tempFilePath, {
          folder: 'theolan/products',
          resource_type: 'auto'
        });

        if (!result.success) {
          throw new ValidationError('Failed to upload image to Cloudinary');
        }

        imageUrl = result.url;

        logger.info('Product image uploaded to Cloudinary', {
          url: imageUrl,
          productId: data.name,
          fileSize: req.file.size
        });
      } catch (error) {
        uploadError = error;
      } finally {
        // Cleanup temp file
        try {
          const fs = await import('fs');
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        } catch (cleanupErr) {
          logger.warn('Failed to cleanup temp file', {
            filePath: tempFilePath,
            error: cleanupErr.message
          });
        }
      }

      if (uploadError) {
        throw uploadError;
      }
    }

    // Create product with initial rates
    const { product, rate } = await ProductService.createProduct({
      ...data,
      image_url: imageUrl
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product,
        rate: {
          id: rate.id,
          base_rate_per_sqm_kes: parseFloat(rate.base_rate_per_sqm_kes),
          double_glazing_multiplier: parseFloat(rate.double_glazing_multiplier),
          finish_multiplier: parseFloat(rate.finish_multiplier),
          effective_from: rate.effective_from
        }
      }
    });
  }),

  /**
   * GET /api/v1/products/admin
   * List all products (including unpublished) for admin view.
   * @access Private (admin)
   */
  getAllProducts: asyncHandler(async (req, res) => {
    const result = await ProductService.getAllProducts();
    res.status(200).json(result);
  }),

  /**
   * PATCH /api/v1/products/:id
   * Update a product (admin only).
   * Supports both file upload and direct image_url.
   * Deletes old Cloudinary image when replacing with new one.
   * @access Private (admin)
   */
  updateProduct: asyncHandler(async (req, res) => {
    // Fetch existing product to get old image_url for cleanup
    const existingProduct = await ProductModel.findProductById(req.params.id);
    if (!existingProduct) {
      throw new NotFoundError('Product not found');
    }
    const oldImageUrl = existingProduct.image_url;

    const data = validate(updateProductSchema, req.body);

    let imageUrl = data.image_url;
    let newImageUrl = null;

    // Handle file upload if present (replaces existing image)
    if (req.file) {
      const tempFilePath = req.file.path;
      let uploadError = null;

      try {
        const result = await uploadImage(tempFilePath, {
          folder: 'theolan/products',
          resource_type: 'auto'
        });

        if (!result.success) {
          throw new ValidationError('Failed to upload image to Cloudinary');
        }

        imageUrl = result.url;
        newImageUrl = result.url;

        logger.info('Product image uploaded to Cloudinary', {
          url: imageUrl,
          updateId: req.params.id,
          fileSize: req.file.size
        });
      } catch (error) {
        uploadError = error;
      } finally {
        // Cleanup temp file
        try {
          const fs = await import('fs');
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        } catch (cleanupErr) {
          logger.warn('Failed to cleanup temp file', {
            filePath: tempFilePath,
            error: cleanupErr.message
          });
        }
      }

      if (uploadError) {
        throw uploadError;
      }
    }

    // Build update object (only include fields that are present)
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.finish !== undefined) updateData.finish = data.finish;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.base_price_per_sqm_kes !== undefined) updateData.base_price_per_sqm_kes = data.base_price_per_sqm_kes;
    if (data.published !== undefined) updateData.published = data.published;
    if (imageUrl !== undefined) updateData.image_url = imageUrl;

    const product = await ProductService.updateProduct(req.params.id, updateData);
    
    // Clean up old Cloudinary image if a new one was uploaded
    if (newImageUrl && oldImageUrl) {
      const isCloudinaryUrl = oldImageUrl.startsWith('http') && oldImageUrl.includes('cloudinary');
      if (isCloudinaryUrl) {
        try {
          const urlParts = oldImageUrl.split('/');
          const uploadIndex = urlParts.findIndex((part, i) => 
            i > 0 && urlParts[i-1] === 'upload'
          );
          
          if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
            const publicIdWithExtension = urlParts.slice(uploadIndex + 1).join('/');
            const dotIndex = publicIdWithExtension.lastIndexOf('.');
            const publicId = dotIndex > -1 ? publicIdWithExtension.substring(0, dotIndex) : publicIdWithExtension;
            
            // Non-blocking Cloudinary deletion
            const { deleteImage } = await import('./cloudinary.js');
            deleteImage(publicId).catch(err => {
              logger.warn('Cloudinary delete failed for old product image (non-blocking)', {
                productId: req.params.id,
                oldPublicId: publicId,
                error: err.message
              });
            });
            
            logger.info('Deleting old product image from Cloudinary', {
              productId: req.params.id,
              oldPublicId: publicId
            });
          }
        } catch (err) {
          logger.warn('Failed to extract/execute Cloudinary delete for old image', {
            productId: req.params.id,
            oldImageUrl,
            error: err.message
          });
        }
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  }),

  /**
   * DELETE /api/v1/products/:id
   * Delete a product (admin only).
   * Also deletes Cloudinary image if present.
   * Note: product_rates row is auto-deleted via FK CASCADE.
   * @access Private (admin)
   */
  deleteProduct: asyncHandler(async (req, res) => {
    const result = await ProductService.deleteProduct(req.params.id);
    res.status(200).json(result);
  })
};

export default ProductController;
