import PaymentModel from '../models/paymentModel.js';
import OrderModel from '../models/orderModel.js';
import { initiateSTKPush, parseCallbackMetadata, querySTKPushStatus } from './mpesaService.js';
import { sendSMS } from './smsService.js';
import UserModel from '../models/userModel.js';
import { db } from '../config/database.js';
import { ValidationError, NotFoundError, AuthorizationError } from '../middlewares/errorHandler.js';
import logger from '../middlewares/logger.js';

const PaymentService = {
  /**
   * Initiate M-Pesa STK Push for an order payment.
   *
   * @param {string} orderId - Order UUID
   * @param {number} amountKes - Payment amount in KES
   * @param {string} phoneNumber - Client phone number (+254XXXXXXXXX)
   * @param {string} clientId - Authenticated user's UUID
   * @returns {Promise<Object>} STK Push result
   */
  initiatePayment: async (orderId, amountKes, phoneNumber, clientId) => {
    // Verify order exists and belongs to client
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    if (order.client_id !== clientId) {
      throw new ValidationError('You can only pay for your own orders');
    }

    // Validate amount
    if (amountKes <= 0) {
      throw new ValidationError('Amount must be greater than 0');
    }

    const remaining = parseFloat(order.total_price_kes) - parseFloat(order.paid_amount_kes);
    if (amountKes > remaining) {
      throw new ValidationError(
        `Amount exceeds remaining balance of KES ${remaining.toLocaleString()}`
      );
    }

    // Determine payment type
    let paymentType = 'full';
    if (parseFloat(order.paid_amount_kes) === 0 && amountKes < parseFloat(order.total_price_kes)) {
      paymentType = 'deposit';
    } else if (parseFloat(order.paid_amount_kes) > 0) {
      paymentType = 'final';
    }

    // Create pending payment record
    const payment = await PaymentModel.create({
      order_id: orderId,
      amount_kes: amountKes,
      method: 'mpesa',
      payment_type: paymentType,
      status: 'pending',
      mpesa_phone: phoneNumber
    });

    // Initiate STK Push
    const stkResult = await initiateSTKPush(
      phoneNumber,
      amountKes,
      order.reference_number,
      `Payment for order ${order.reference_number}`
    );

    if (stkResult.success) {
      // Store the checkout request ID for callback matching
      await PaymentModel.update(payment.id, {
        mpesa_checkout_request_id: stkResult.checkoutRequestId
      });

      logger.info('Payment STK Push initiated', {
        paymentId: payment.id,
        orderId,
        amount: amountKes,
        checkoutRequestId: stkResult.checkoutRequestId
      });

      return {
        success: true,
        data: {
          checkout_request_id: stkResult.checkoutRequestId,
          message: stkResult.message,
          expires_in_seconds: 120
        }
      };
    }

    // STK Push failed — mark payment as failed
    await PaymentModel.update(payment.id, { status: 'failed' });
    throw new ValidationError(stkResult.message || 'Payment initiation failed');
  },

  /**
   * Get payment status by checkout request ID.
   * Used by frontend to poll after STK Push until callback resolves.
   *
   * @param {string} checkoutRequestId - M-Pesa CheckoutRequestID
   * @param {string} clientId - Authenticated user's UUID (ownership check)
   * @returns {Promise<Object>} Payment status
   */
  getPaymentStatus: async (checkoutRequestId, clientId) => {
    const payment = await PaymentModel.findByCheckoutRequestId(checkoutRequestId);
    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // Verify ownership through the order (payments table references orders, not clients directly)
    if (payment.order_id) {
      const order = await OrderModel.findById(payment.order_id);
      if (order && order.client_id !== clientId) {
        throw new AuthorizationError('You can only check your own payments');
      }
    }

    return {
      success: true,
      data: {
        id: payment.id,
        status: payment.status,
        amount_kes: parseFloat(payment.amount_kes),
        payment_type: payment.payment_type,
        mpesa_receipt: payment.transaction_id || null,
        created_at: payment.created_at,
        updated_at: payment.updated_at
      }
    };
  },

  /**
   * Process M-Pesa callback webhook from Safaricom.
   * Idempotent: duplicate callbacks are safely ignored.
   *
   * @param {Object} callbackBody - Safaricom stkCallback payload
   * @returns {Promise<Object>} Processing result
   */
  processCallback: async (callbackBody) => {
    const stkCallback = callbackBody?.Body?.stkCallback;
    if (!stkCallback) {
      throw new ValidationError('Invalid callback payload');
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    // Find the payment record by checkout request ID
    const payment = await PaymentModel.findByCheckoutRequestId(CheckoutRequestID);
    if (!payment) {
      logger.warn('M-Pesa callback for unknown checkout request', { CheckoutRequestID });
      return { result_code: 0 }; // Acknowledge to prevent retries
    }

    // Idempotency: skip if already processed
    if (payment.status !== 'pending') {
      logger.info('M-Pesa callback already processed', {
        paymentId: payment.id,
        currentStatus: payment.status
      });
      return { result_code: 0 };
    }

    if (ResultCode === 0) {
      // Payment successful
      const metadata = parseCallbackMetadata(CallbackMetadata?.Item);

      await PaymentModel.update(payment.id, {
        status: 'success',
        transaction_id: metadata.mpesaReceipt,
        mpesa_result_code: '0',
        mpesa_result_description: ResultDesc,
        paid_at: new Date()
      });

      // Update order paid amount and payment status
      const order = await OrderModel.findById(payment.order_id);
      if (order) {
        const newPaidAmount = parseFloat(order.paid_amount_kes) + parseFloat(payment.amount_kes);
        const totalPrice = parseFloat(order.total_price_kes);

        let newPaymentStatus = 'deposit_received';
        if (newPaidAmount >= totalPrice) {
          newPaymentStatus = 'paid_in_full';
        }

        await OrderModel.update(order.id, {
          paid_amount_kes: newPaidAmount,
          payment_status: newPaymentStatus,
          // Auto-advance order status when fully paid
          status: newPaymentStatus === 'paid_in_full' ? 'confirmed' : order.status
        });

        // Add timeline event
        const eventTitle = `Payment received: KES ${parseFloat(payment.amount_kes).toLocaleString()}`;
        let eventDescription = `M-Pesa receipt: ${metadata.mpesaReceipt || 'N/A'}. Payment status: ${newPaymentStatus}.`;
        if (newPaymentStatus === 'paid_in_full') {
          eventDescription += ' Order confirmed — fabrication begins soon.';
        }

        await OrderModel.addEvent({
          order_id: order.id,
          title: eventTitle,
          description: eventDescription,
          occurred_at: new Date()
        });

        // Send SMS confirmation to client
        const client = await UserModel.findById(order.client_id);
        if (client) {
          const msg = `The Olan Glass and Aluminium: Ksh ${parseFloat(payment.amount_kes).toLocaleString()} payment received for Order ${order.reference_number}. ${newPaymentStatus === 'paid_in_full' ? 'Fully paid!' : 'Deposit confirmed. Fabrication begins soon.'}`;
          sendSMS(client.phone, msg).catch((err) => {
            logger.error('Payment confirmation SMS failed', { error: err.message });
          });
        }

        logger.info('M-Pesa payment processed successfully', {
          paymentId: payment.id,
          orderId: order.id,
          amount: payment.amount_kes,
          receipt: metadata.mpesaReceipt,
          newPaymentStatus
        });
      }
    } else {
      // Payment failed or cancelled
      await PaymentModel.update(payment.id, {
        status: 'failed',
        mpesa_result_code: ResultCode.toString(),
        mpesa_result_description: ResultDesc
      });

      logger.warn('M-Pesa payment failed', {
        paymentId: payment.id,
        resultCode: ResultCode,
        resultDesc: ResultDesc
      });
    }

    return { result_code: 0 };
  },

  /**
   * Process expired/abandoned STK Push payments.
   * Called by cron job to clean up pending payments that never received a callback.
   *
   * STK Push prompts expire after 2 minutes on the user's phone.
   * We give a 5-minute grace period before marking as cancelled.
   *
   * @returns {Promise<Object>} Processing summary
   */
  processExpiredPayments: async () => {
    const FIVE_MINUTES_AGO = new Date(Date.now() - 5 * 60 * 1000);

    // Find all pending payments older than 5 minutes
    const pendingPayments = await db('payments')
      .where({ status: 'pending' })
      .where('created_at', '<', FIVE_MINUTES_AGO)
      .select('id', 'mpesa_checkout_request_id', 'order_id', 'amount_kes');

    if (pendingPayments.length === 0) {
      return { processed: 0, cancelled: 0, errors: 0 };
    }

    let cancelled = 0;
    let errors = 0;

    for (const payment of pendingPayments) {
      try {
        // Query Daraja API for the actual status
        const queryResult = await querySTKPushStatus(payment.mpesa_checkout_request_id);

        // ResultCode: 0 = success, 1 = cancelled by user, 2 = insufficient funds, etc.
        if (queryResult.resultCode !== 0) {
          await PaymentModel.update(payment.id, {
            status: 'cancelled',
            mpesa_result_code: queryResult.resultCode.toString(),
            mpesa_result_description: queryResult.resultDesc
          });

          logger.info('Expired payment cancelled', {
            paymentId: payment.id,
            checkoutRequestId: payment.mpesa_checkout_request_id,
            resultCode: queryResult.resultCode,
            resultDesc: queryResult.resultDesc
          });

          cancelled++;
        }
      } catch (error) {
        // If query fails, mark as cancelled anyway (callback likely lost)
        await PaymentModel.update(payment.id, {
          status: 'cancelled',
          mpesa_result_code: 'ERROR',
          mpesa_result_description: `Query failed: ${error.message}`
        });

        logger.warn('Failed to query payment status, marked as cancelled', {
          paymentId: payment.id,
          error: error.message
        });

        errors++;
      }
    }

    logger.info('Expired payment processing complete', {
      total: pendingPayments.length,
      cancelled,
      errors
    });

    return {
      processed: pendingPayments.length,
      cancelled,
      errors
    };
  }
};

export default PaymentService;
