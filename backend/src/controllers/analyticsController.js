import AnalyticsService from '../services/analyticsService.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

const AnalyticsController = {
  /**
   * GET /api/v1/admin/analytics/revenue
   * Get revenue analytics.
   */
  getRevenue: asyncHandler(async (req, res) => {
    const result = await AnalyticsService.getRevenueAnalytics();
    res.status(200).json(result);
  }),

  /**
   * GET /api/v1/admin/analytics/bookings
   * Get booking analytics.
   */
  getBookings: asyncHandler(async (req, res) => {
    const result = await AnalyticsService.getBookingAnalytics();
    res.status(200).json(result);
  }),

  /**
   * GET /api/v1/admin/analytics/orders
   * Get order analytics.
   */
  getOrders: asyncHandler(async (req, res) => {
    const result = await AnalyticsService.getOrderAnalytics();
    res.status(200).json(result);
  }),

  /**
   * GET /api/v1/admin/analytics/dashboard
   * Get all analytics combined.
   */
  getDashboard: asyncHandler(async (req, res) => {
    const [revenue, bookings, orders] = await Promise.all([
      AnalyticsService.getRevenueAnalytics(),
      AnalyticsService.getBookingAnalytics(),
      AnalyticsService.getOrderAnalytics()
    ]);

    res.status(200).json({
      success: true,
      data: {
        revenue: revenue.data,
        bookings: bookings.data,
        orders: orders.data
      }
    });
  })
};

export default AnalyticsController;
