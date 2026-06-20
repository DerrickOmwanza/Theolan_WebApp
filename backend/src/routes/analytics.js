import express from 'express';
import AnalyticsController from '../controllers/analyticsController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * Analytics routes - Admin only
 * Provides revenue, booking, and order analytics
 */

// Apply protect + authorize middleware to all routes
router.use(protect);

router.get('/revenue', authorize('admin'), AnalyticsController.getRevenue);
router.get('/bookings', authorize('admin'), AnalyticsController.getBookings);
router.get('/orders', authorize('admin'), AnalyticsController.getOrders);
router.get('/dashboard', authorize('admin'), AnalyticsController.getDashboard);

export default router;
