import express from 'express';
import ProductController from '../controllers/productController.js';

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

export { router as productRoutes };
export default router;
