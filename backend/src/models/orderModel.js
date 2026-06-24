import { db } from '../config/database.js';

/**
 * Order Model
 * Data access layer for orders and order events (timeline).
 */
const OrderModel = {
  // ============================================================
  // Order Queries
  // ============================================================

  create: async (orderData) => {
    const [order] = await db('orders').insert(orderData).returning('*');
    return order;
  },

  findById: (id) => {
    return db('orders').where({ id }).first();
  },

  /**
   * Get orders for a client with optional filters.
   */
  findByClient: async (clientId, { status, limit = 20, offset = 0 } = {}) => {
    let query = db('orders').where('client_id', clientId).orderBy('created_at', 'desc');

    let countQuery = db('orders').where('client_id', clientId).count('id as total');

    if (status) {
      query = query.where({ status });
      countQuery = countQuery.where({ status });
    }

    const [data, countResult] = await Promise.all([
      query.limit(limit).offset(offset),
      countQuery.first()
    ]);

    return { data, total: parseInt(countResult.total, 10) };
  },

  /**
   * Get all orders for admin (with optional filters).
   * Includes client name and phone for admin view.
   */
  adminFindAll: async ({ status, limit = 20, offset = 0 } = {}) => {
    let query = db('orders')
      .select('orders.*', 'users.name as client_name', 'users.phone as client_phone')
      .leftJoin('users', 'orders.client_id', 'users.id')
      .orderBy('orders.created_at', 'desc');

    if (status) {
      query = query.where({ status });
    }

    const queryWithLimit = query.limit(limit).offset(offset);

    const countQuery = db('orders').count('id as total');

    if (status) {
      countQuery.where({ status });
    }

    const [data, countResult] = await Promise.all([queryWithLimit, countQuery.first()]);

    return { data, total: parseInt(countResult.total, 10) };
  },

  update: async (id, updates) => {
    const [order] = await db('orders')
      .where({ id })
      .update({ ...updates, updated_at: db.fn.now() })
      .returning('*');
    return order;
  },

  /**
   * Generate the next order reference number (ORD001, ORD002, ...).
   */
  getLatestReferenceNumber: async () => {
    const result = await db('orders').max('reference_number as latest').first();
    return result?.latest || null;
  },

  // ============================================================
  // Order Events (Timeline)
  // ============================================================

  addEvent: async (eventData) => {
    // Set all other events for this order to is_current = false
    await db('order_events').where({ order_id: eventData.order_id }).update({ is_current: false });

    const [event] = await db('order_events')
      .insert({ ...eventData, is_current: true })
      .returning('*');
    return event;
  },

  getEvents: (orderId) => {
    return db('order_events').where({ order_id: orderId }).orderBy('occurred_at', 'asc');
  },

  // ============================================================
  // Payment Summary Queries
  // ============================================================

  /**
   * Get total paid amount for an order from completed payments.
   */
  getTotalPaid: async (orderId) => {
    const result = await db('payments')
      .where({ order_id: orderId, status: 'success' })
      .sum('amount_kes as total')
      .first();
    return parseFloat(result?.total || 0);
  },

  // ============================================================
  // Analytics Methods
  // ============================================================

  getTotalRevenue: async () => {
    const result = await db('orders')
      .whereNotIn('status', ['cancelled'])
      .sum('total_price_kes as total')
      .first();
    return parseFloat(result?.total || 0);
  },

  getRevenueByCategory: async () => {
    // orders table has product_summary, not product_category
    // We'll parse the category from product_summary or return placeholder
    return await db('orders')
      .select("CASE WHEN product_summary ILIKE '%window%' THEN 'windows' WHEN product_summary ILIKE '%door%' THEN 'doors' WHEN product_summary ILIKE '%curtain%' THEN 'curtain_walls' WHEN product_summary ILIKE '%partition%' THEN 'partitions' WHEN product_summary ILIKE '%balustrade%' THEN 'balustrades' ELSE 'other' END as category")
      .sum('total_price_kes as total')
      .groupBy('category')
      .orderBy('total', 'desc');
  },

  getRevenueByTechnician: async () => {
    return await db('orders')
      .leftJoin('technicians', 'orders.assigned_technician_id', 'technicians.id')
      .select(db.raw("COALESCE(technicians.name, 'Unassigned') as technician_name"))
      .sum('orders.total_price_kes as total')
      .groupBy('technicians.name')
      .orderBy('total', 'desc');
  },

  getPaymentStatusBreakdown: async () => {
    const rows = await db('orders')
      .select('payment_status')
      .count('id as count')
      .groupBy('payment_status');
    const breakdown = { unpaid: 0, deposit_received: 0, paid_in_full: 0 };
    for (const row of rows) {
      if (breakdown[row.payment_status] !== undefined) {
        breakdown[row.payment_status] = parseInt(row.count, 10);
      }
    }
    return breakdown;
  },

  getMonthlyRevenueTrend: async () => {
    return await db
      .raw(
        `
      SELECT
        EXTRACT(YEAR FROM created_at) as year,
        EXTRACT(MONTH FROM created_at) as month,
        COALESCE(SUM(total_price_kes), 0) as total
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '12 months'
        AND status != 'cancelled'
      GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
      ORDER BY year, month
    `
      )
      .then((r) => r.rows || []);
  },

  getFunnelStats: async () => {
    const rows = await db('orders').select('status').count('id as count').groupBy('status');
    const stats = {
      quoted: 0,
      confirmed: 0,
      fabrication: 0,
      ready: 0,
      installed: 0,
      cancelled: 0
    };
    for (const row of rows) {
      if (stats[row.status] !== undefined) {
        stats[row.status] = parseInt(row.count, 10);
      }
    }
    return stats;
  },

  getAvgFabricationTime: async () => {
    return await Promise.resolve(0); // Requires order_events timeline data; stub until orders are created
  }
};

export default OrderModel;
