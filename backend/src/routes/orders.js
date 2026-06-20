import express from 'express';
import OrderController from '../controllers/orderController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/v1/orders
 * @desc    Create a new order
 * @access  Private (client)
 */
router.post('/', protect, OrderController.createOrder);

/**
 * @route   GET /api/v1/orders
 * @desc    List client's orders
 * @access  Private (client)
 * @query   status, limit, offset
 */
router.get('/', protect, OrderController.listOrders);

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get order detail with timeline
 * @access  Private (client — own orders only)
 */
router.get('/:id', protect, OrderController.getOrder);

/**
 * @route   PATCH /api/v1/orders/:id
 * @desc    Admin updates order status (state machine)
 * @access  Private (admin only)
 */
router.patch('/:id', protect, authorize('admin'), OrderController.updateOrderStatus);

export { router as orderRoutes };
export default router;
