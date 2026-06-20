import { db } from '../config/database.js';

/**
 * Payment Model
 * Data access layer for payment transactions.
 */
const PaymentModel = {

  create: async (paymentData) => {
    const [payment] = await db('payments').insert(paymentData).returning('*');
    return payment;
  },

  findById: async (id) => {
    return db('payments').where({ id }).first();
  },

  findByOrderId: async (orderId) => {
    return db('payments')
      .where({ order_id: orderId })
      .orderBy('created_at', 'desc');
  },

  findByCheckoutRequestId: async (checkoutRequestId) => {
    return db('payments')
      .where({ mpesa_checkout_request_id: checkoutRequestId })
      .first();
  },

  findByTransactionId: async (transactionId) => {
    return db('payments')
      .where({ transaction_id: transactionId })
      .first();
  },

  update: async (id, updates) => {
    const [payment] = await db('payments')
      .where({ id })
      .update({ ...updates, updated_at: db.fn.now() })
      .returning('*');
    return payment;
  }
};

export default PaymentModel;
