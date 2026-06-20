import express from 'express';
import PaymentController from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/v1/payments/initiate-stk
 * @desc    Trigger M-Pesa STK Push for payment
 * @access  Private (client)
 */
router.post('/initiate-stk', protect, PaymentController.initiateSTK);

/**
 * @route   GET /api/v1/payments/status/:checkoutRequestId
 * @desc    Poll payment status after STK Push (for frontend to track payment progress)
 * @access  Private (client)
 */
router.get('/status/:checkoutRequestId', protect, PaymentController.getPaymentStatus);

/**
 * @route   POST /api/v1/payments/mpesa-callback
 * @desc    Webhook for M-Pesa payment callback (Safaricom server-to-server)
 * @access  Public (no auth — Safaricom initiates)
 */
router.post('/mpesa-callback', PaymentController.mpesaCallback);

export { router as paymentRoutes };
export default router;
