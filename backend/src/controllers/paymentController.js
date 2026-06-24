import Joi from 'joi';
import PaymentService from '../services/paymentService.js';
import { asyncHandler, ValidationError } from '../middlewares/errorHandler.js';
import { normalizePhone } from '../utils/auth.js';

const initiatePaymentSchema = Joi.object({
  order_id: Joi.string().uuid().required(),
  amount_kes: Joi.number().positive().required(),
  phone_number: Joi.string().trim().required()
});

const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = error.details.map((d) => ({ field: d.context?.key, issue: d.message }));
    throw new ValidationError(error.details[0].message, details);
  }
  return value;
};

const PaymentController = {

  /**
   * POST /api/v1/payments/initiate-stk
   * Trigger M-Pesa STK Push for payment.
   * @access Private (client)
   */
  initiateSTK: asyncHandler(async (req, res) => {
    const { order_id, amount_kes, phone_number } = validate(initiatePaymentSchema, req.body);

    const normalizedPhone = normalizePhone(phone_number);
    if (!normalizedPhone) {
      throw new ValidationError('Invalid phone number format');
    }

    const result = await PaymentService.initiatePayment(
      order_id,
      amount_kes,
      normalizedPhone,
      req.user.id
    );
    res.status(200).json(result);
  }),

  /**
   * GET /api/v1/payments/status/:checkoutRequestId
   * Poll payment status after STK Push (frontend tracks payment progress).
   * @access Private (client)
   */
  getPaymentStatus: asyncHandler(async (req, res) => {
    const { checkoutRequestId } = req.params;
    const result = await PaymentService.getPaymentStatus(checkoutRequestId, req.user.id);
    res.status(200).json(result);
  }),

  /**
   * POST /api/v1/payments/mpesa-callback
   * Webhook for M-Pesa payment callback (Safaricom initiates).
   * @access Public (Safaricom server-to-server)
   */
  mpesaCallback: asyncHandler(async (req, res) => {
    const result = await PaymentService.processCallback(req.body);
    res.status(200).json({ success: true, ...result });
  }),

  /**
   * POST /api/v1/payments/admin/process-expired
   * Manually trigger processing of expired/abandoned STK Push payments.
   * @access Private (admin only)
   */
  processExpired: asyncHandler(async (req, res) => {
    const result = await PaymentService.processExpiredPayments();
    res.status(200).json({
      success: true,
      data: result,
      message: `Processed ${result.processed} expired payments (${result.cancelled} cancelled, ${result.errors} errors)`
    });
  })
};

export default PaymentController;
