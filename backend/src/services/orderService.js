import OrderModel from '../models/orderModel.js';
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
  ConflictError
} from '../middlewares/errorHandler.js';
import logger from '../middlewares/logger.js';

// ============================================================
// Order State Machine
// Valid transitions: from → [allowed next states]
// ============================================================

const VALID_TRANSITIONS = {
  quoted:       ['confirmed', 'cancelled'],
  confirmed:    ['fabrication', 'cancelled'],
  fabrication:  ['ready', 'cancelled'],
  ready:        ['installed', 'cancelled'],
  installed:    [],
  cancelled:    []
};

/**
 * Generate the next order reference number (ORD001, ORD002, ...).
 */
const generateReferenceNumber = async () => {
  const latest = await OrderModel.getLatestReferenceNumber();
  if (!latest) return 'ORD001';
  const match = latest.match(/^ORD(\d+)$/);
  const nextNum = match ? parseInt(match[1], 10) + 1 : 1;
  return `ORD${nextNum.toString().padStart(3, '0')}`;
};

const OrderService = {

  /**
   * Create a new order (typically after a confirmed booking + quotation).
   *
   * @param {string} clientId - User UUID (the client placing the order)
   * @param {Object} input - Order details
   * @returns {Promise<Object>} Created order with reference number
   */
  createOrder: async (clientId, input) => {
    const { product_summary, dimensions_notes, total_price_kes, deposit_amount_kes } = input;

    if (total_price_kes <= 0) {
      throw new ValidationError('Total price must be greater than 0');
    }

    const reference_number = await generateReferenceNumber();

    const order = await OrderModel.create({
      client_id: clientId,
      product_summary,
      dimensions_notes: dimensions_notes || null,
      status: 'quoted',
      total_price_kes,
      paid_amount_kes: 0,
      payment_status: 'unpaid',
      deposit_amount: deposit_amount_kes || null,
      reference_number
    });

    // Create initial timeline event
    await OrderModel.addEvent({
      order_id: order.id,
      title: 'Order created',
      description: `Quote generated for ${product_summary}. Total: KES ${total_price_kes.toLocaleString()}.`,
      occurred_at: new Date()
    });

    logger.info('Order created', {
      orderId: order.id,
      referenceNumber: reference_number,
      clientId,
      totalKes: total_price_kes
    });

    return {
      success: true,
      data: {
        id: order.id,
        reference_number: order.reference_number,
        product_summary: order.product_summary,
        status: order.status,
        total_price_kes: parseFloat(order.total_price_kes),
        payment_status: order.payment_status,
        created_at: order.created_at
      }
    };
  },

  /**
   * List orders for a client.
   *
   * @param {string} clientId - Authenticated user's UUID
   * @param {Object} options - { status, limit, offset }
   * @returns {Promise<Object>} Paginated order list
   */
  getClientOrders: async (clientId, { status, limit = 20, offset = 0 } = {}) => {
    const { data, total } = await OrderModel.findByClient(clientId, { status, limit, offset });

    const orders = await Promise.all(
      data.map(async (o) => ({
        id: o.id,
        reference_number: o.reference_number,
        product_summary: o.product_summary,
        status: o.status,
        total_price_kes: parseFloat(o.total_price_kes),
        paid_amount_kes: parseFloat(o.paid_amount_kes),
        payment_status: o.payment_status,
        created_at: o.created_at,
        updated_at: o.updated_at,
        scheduled_installation_at: o.scheduled_installation_at
      }))
    );

    return {
      success: true,
      data: orders,
      pagination: { total, limit, offset }
    };
  },

  /**
   * Get order detail with full timeline.
   * Clients can only view their own orders.
   *
   * @param {string} orderId - Order UUID
   * @param {string} clientId - Authenticated user's UUID
   * @returns {Promise<Object>} Order detail with timeline
   */
  getOrderDetail: async (orderId, clientId) => {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Clients can only view their own orders
    if (order.client_id !== clientId) {
      throw new AuthorizationError('You can only view your own orders');
    }

    // Get timeline events
    const events = await OrderModel.getEvents(orderId);
    const timeline = events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      occurred_at: e.occurred_at,
      is_current: e.is_current
    }));

    return {
      success: true,
      data: {
        id: order.id,
        reference_number: order.reference_number,
        product_summary: order.product_summary,
        dimensions_notes: order.dimensions_notes,
        status: order.status,
        total_price_kes: parseFloat(order.total_price_kes),
        paid_amount_kes: parseFloat(order.paid_amount_kes),
        payment_status: order.payment_status,
        scheduled_installation_at: order.scheduled_installation_at,
        assigned_technician: null, // Will be populated when admin assigns
        created_at: order.created_at,
        updated_at: order.updated_at,
        timeline
      }
    };
  },

  /**
   * Transition order status (validates state machine).
   * Used by admin to advance orders through the pipeline.
   *
   * @param {string} orderId - Order UUID
   * @param {string} newStatus - Target status
   * @param {Object} options - { milestone_title, milestone_description }
   * @returns {Promise<Object>} Updated order
   */
  transitionStatus: async (orderId, newStatus, { milestone_title, milestone_description } = {}) => {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Validate state machine transition
    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new ValidationError(
        `Cannot transition from '${order.status}' to '${newStatus}'. Allowed: ${(allowed || []).join(', ') || 'none'}`
      );
    }

    const updated = await OrderModel.update(orderId, { status: newStatus });

    // Add timeline event
    const title = milestone_title || `Status changed to ${newStatus}`;
    await OrderModel.addEvent({
      order_id: orderId,
      title,
      description: milestone_description || null,
      occurred_at: new Date()
    });

    logger.info('Order status transitioned', {
      orderId,
      from: order.status,
      to: newStatus,
      referenceNumber: order.reference_number
    });

    return {
      success: true,
      data: {
        id: updated.id,
        status: updated.status,
        updated_at: updated.updated_at
      }
    };
  }
};

export default OrderService;
