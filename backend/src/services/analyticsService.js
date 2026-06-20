import OrderModel from '../models/orderModel.js';
import UserModel from '../models/userModel.js';
import BookingModel from '../models/bookingModel.js';
import PaymentModel from '../models/paymentModel.js';
import logger from '../middlewares/logger.js';

const AnalyticsService = {
  // ============================================================
  // Revenue Analytics
  // ============================================================

  /**
   * Get revenue metrics: total, by product, by technician, payment status.
   */
  getRevenueAnalytics: async () => {
    // Total revenue (paid orders)
    const totalRevenue = await OrderModel.getTotalRevenue();

    // Revenue by product category
    const revenueByProduct = await OrderModel.getRevenueByCategory();

    // Revenue by technician
    const revenueByTech = await OrderModel.getRevenueByTechnician();

    // Payment status breakdown
    const paymentBreakdown = await OrderModel.getPaymentStatusBreakdown();

    // Monthly trend (last 12 months)
    const monthlyTrend = await OrderModel.getMonthlyRevenueTrend();

    return {
      success: true,
      data: {
        total_revenue_kes: parseFloat(totalRevenue) || 0,
        revenue_by_product: revenueByProduct.map((r) => ({
          category: r.category,
          total_kes: parseFloat(r.total) || 0
        })),
        revenue_by_technician: revenueByTech.map((r) => ({
          technician: r.technician_name || 'Unassigned',
          total_kes: parseFloat(r.total) || 0
        })),
        payment_status_breakdown: {
          unpaid: parseInt(paymentBreakdown.unpaid) || 0,
          deposit_received: parseInt(paymentBreakdown.deposit_received) || 0,
          paid_in_full: parseInt(paymentBreakdown.paid_in_full) || 0
        },
        monthly_trend: monthlyTrend.map((m) => ({
          month: m.month,
          year: m.year,
          total_kes: parseFloat(m.total) || 0
        }))
      }
    };
  },

  // ============================================================
  // Booking Analytics
  // ============================================================

  /**
   * Get booking metrics: completion rate, no-show rate, technician utilization.
   */
  getBookingAnalytics: async () => {
    // Completion rate (completed vs total)
    const completionStats = await BookingModel.getCompletionStats();

    // No-show rate (bookings not shown up)
    const noShowStats = await BookingModel.getNoShowStats();

    // Technician utilization
    const techStats = await BookingModel.getTechnicianUtilization();

    // Busiest days (by booking count)
    const busiestDays = await BookingModel.getBusiestDays();

    return {
      success: true,
      data: {
        total_bookings: parseInt(completionStats.total) || 0,
        completed_bookings: parseInt(completionStats.completed) || 0,
        completion_rate_percent: parseFloat(completionStats.rate) || 0,
        no_show_count: parseInt(noShowStats.count) || 0,
        no_show_rate_percent: parseFloat(noShowStats.rate) || 0,
        technician_utilization: techStats.map((t) => ({
          technician: t.name,
          assigned_count: parseInt(t.assigned) || 0
        })),
        busiest_days: busiestDays.map((d) => ({
          date: d.date,
          booking_count: parseInt(d.count) || 0
        }))
      }
    };
  },

  // ============================================================
  // Order Analytics
  // ============================================================

  /**
   * Get order funnel, fabrication time, repeat customer rate.
   */
  getOrderAnalytics: async () => {
    // Order funnel (count by status)
    const funnelStats = await OrderModel.getFunnelStats();

    // Average fabrication time (days)
    const avgFabricationTime = await OrderModel.getAvgFabricationTime();

    // Repeat customer rate
    const repeatCustomerStats = await UserModel.getRepeatCustomerStats();

    return {
      success: true,
      data: {
        order_funnel: {
          quoted: parseInt(funnelStats.quoted) || 0,
          confirmed: parseInt(funnelStats.confirmed) || 0,
          fabrication: parseInt(funnelStats.fabrication) || 0,
          ready: parseInt(funnelStats.ready) || 0,
          installed: parseInt(funnelStats.installed) || 0,
          cancelled: parseInt(funnelStats.cancelled) || 0
        },
        avg_fabrication_time_days: parseFloat(avgFabricationTime) || 0,
        total_customers: parseInt(repeatCustomerStats.total) || 0,
        repeat_customers: parseInt(repeatCustomerStats.repeat) || 0,
        repeat_customer_rate_percent: parseFloat(repeatCustomerStats.rate) || 0
      }
    };
  }
};

export default AnalyticsService;
