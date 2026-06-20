import express from 'express';
import ProductController from '../controllers/productController.js';

const router = express.Router();

/**
 * @route   POST /api/v1/quote
 * @desc    Calculate instant estimate for a product
 * @access  Public
 */
router.post('/', ProductController.calculateQuote);

export { router as quoteRoutes };
export default router;
