import express from 'express';
import ProductController from '../controllers/productController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { uploadSingleFile } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// ============================================================
// PUBLIC ENDPOINTS
// ============================================================

/**
 * @route   GET /api/v1/products
 * @desc    Get product catalogue (filterable, paginated)
 * @access  Public
 * @query   category, finish, sort_by, limit, offset
 */
router.get('/', ProductController.getProducts);

/**
 * @route   GET /api/v1/products/gallery
 * @desc    Get published gallery photos
 * @access  Public
 * @query   category, finish, search, limit, offset
 */
router.get('/gallery', ProductController.getGallery);

// ============================================================
// ADMIN ENDPOINTS (require admin auth)
// ============================================================

/**
 * @route   POST /api/v1/products/gallery
 * @desc    Upload a new gallery photo (admin only)
 * @access  Private (admin)
 * Supports multipart/form-data with file upload OR direct image_url in body
 */
router.post(
  '/gallery',
  protect,
  authorize('admin'),
  uploadSingleFile,
  ProductController.uploadGalleryPhoto
);

/**
 * @route   DELETE /api/v1/products/gallery/:id
 * @desc    Delete a gallery photo (admin only)
 * @access  Private (admin)
 */
router.delete('/gallery/:id', protect, authorize('admin'), ProductController.deleteGalleryPhoto);

/**
 * @route   PATCH /api/v1/products/gallery/:id
 * @desc    Toggle gallery photo published status (admin only)
 * @access  Private (admin)
 */
router.patch('/gallery/:id', protect, authorize('admin'), ProductController.updateGalleryPhoto);

// ============================================================
// PRODUCT CRUD ENDPOINTS (Admin only)
// ============================================================

/**
 * @route   POST /api/v1/products
 * @desc    Create a new product (admin only)
 * @access  Private (admin)
 * Supports multipart/form-data with file upload OR direct image_url in body
 */
router.post(
  '/',
  protect,
  authorize('admin'),
  uploadSingleFile,
  ProductController.createProduct
);

/**
 * @route   GET /api/v1/products/admin
 * @desc    List ALL products including unpublished (admin only)
 * @access  Private (admin)
 */
router.get('/admin', protect, authorize('admin'), ProductController.getAllProducts);

/**
 * @route   PATCH /api/v1/products/:id
 * @desc    Update a product (admin only)
 * @access  Private (admin)
 * Supports multipart/form-data with file upload OR direct image_url in body
 */
router.patch(
  '/:id',
  protect,
  authorize('admin'),
  uploadSingleFile,
  ProductController.updateProduct
);

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Delete a product (admin only). Also deletes Cloudinary image if any.
 * @access  Private (admin)
 */
router.delete('/:id', protect, authorize('admin'), ProductController.deleteProduct);

export { router as productRoutes };
export default router;
