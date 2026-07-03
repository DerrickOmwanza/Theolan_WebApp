import Joi from 'joi';
import { QuoteService, ProductService } from '../services/productService.js';
import { asyncHandler, ValidationError, NotFoundError } from '../middlewares/errorHandler.js';
import { db } from '../config/database.js';

// ============================================================
// Constants
// ============================================================

const CATEGORIES = ['windows', 'doors', 'curtain_walls', 'partitions', 'balustrades'];
const FINISHES = ['mill', 'silver', 'black', 'champagne', 'bronze'];
const SORT_OPTIONS = ['price_asc', 'price_desc', 'name'];

// ============================================================
// Validation Schemas
// ============================================================

const quoteSchema = Joi.object({
  product_id: Joi.string().uuid().required()
    .messages({ 'string.guid': 'product_id must be a valid UUID' }),
  width_meters: Joi.number().min(0.5).max(10).required()
    .messages({
      'number.min': 'Width must be at least 0.5 meters',
      'number.max': 'Width cannot exceed 10 meters'
    }),
  height_meters: Joi.number().min(0.5).max(10).required()
    .messages({
      'number.min': 'Height must be at least 0.5 meters',
      'number.max': 'Height cannot exceed 10 meters'
    }),
  quantity: Joi.number().integer().min(1).max(100).required()
    .messages({
      'number.min': 'Quantity must be at least 1',
      'number.max': 'Quantity cannot exceed 100'
    }),
  double_glazing: Joi.boolean().optional().default(false),
  finish: Joi.string().valid(...FINISHES).required()
    .messages({ 'any.only': 'Finish must be one of: ' + FINISHES.join(', ') })
});

const productsQuerySchema = Joi.object({
  category: Joi.string().valid(...CATEGORIES).optional(),
  finish: Joi.string().valid(...FINISHES).optional(),
  sort_by: Joi.string().valid(...SORT_OPTIONS).optional(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0)
});

const galleryQuerySchema = Joi.object({
  category: Joi.string().valid(...CATEGORIES).optional(),
  finish: Joi.string().valid(...FINISHES).optional(),
  search: Joi.string().trim().max(200).allow('').optional(),
  limit: Joi.number().integer().min(1).max(1000).default(20),
  offset: Joi.number().integer().min(0).default(0)
});

const uploadGallerySchema = Joi.object({
  image_url: Joi.string().uri().max(500).required()
    .messages({ 'string.empty': 'Image URL is required', 'string.uri': 'Must be a valid URL' }),
  category: Joi.string().valid(...CATEGORIES).required()
    .messages({ 'any.only': 'Category must be one of: ' + CATEGORIES.join(', ') }),
  finish: Joi.string().valid(...FINISHES).optional().allow(null),
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
   * @access Private (admin)
   */
  uploadGalleryPhoto: asyncHandler(async (req, res) => {
    const data = validate(uploadGallerySchema, req.body);
    const result = await ProductService.uploadGalleryPhoto(data, req.user.id);
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
  })
};

export default ProductController;
