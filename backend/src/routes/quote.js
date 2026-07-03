import express from 'express';
import ProductController from '../controllers/productController.js';

const router = express.Router();

/**
 * @route   POST /api/v1/quote
 * @desc    Calculate instant estimate for a product
 * @access  Public
 */
router.post('/', ProductController.calculateQuote);

/**
 * @route   GET /api/v1/quote
 * @desc    Method not allowed - quote endpoint only accepts POST
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(405).json({
    success: false,
    error: 'METHOD_NOT_ALLOWED',
    message: 'GET /api/v1/quote not allowed. Use POST to calculate quotes.'
  });
});

export { router as quoteRoutes };
export default router;
