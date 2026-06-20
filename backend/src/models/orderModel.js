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

  findById: async (id) => {
    return db('orders').where({ id }).first();
  },

  /**
   * Get orders for a client with optional filters.
   */
  findByClient: async (clientId, { status, limit = 20, offset = 0 } = {}) => {
    let query = db('orders')
      .where('client_id', clientId)
      .orderBy('created_at', 'desc');

    let countQuery = db('orders')
      .where('client_id', clientId)
      .count('id as total');

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
    const result = await db('orders')
      .max('reference_number as latest')
      .first();
    return result?.latest || null;
  },

  // ============================================================
  // Order Events (Timeline)
  // ============================================================

  addEvent: async (eventData) => {
    // Set all other events for this order to is_current = false
    await db('order_events')
      .where({ order_id: eventData.order_id })
      .update({ is_current: false });

    const [event] = await db('order_events')
      .insert({ ...eventData, is_current: true })
      .returning('*');
    return event;
  },

  getEvents: async (orderId) => {
    return db('order_events')
      .where({ order_id: orderId })
      .orderBy('occurred_at', 'asc');
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
  }
};

export default OrderModel;
