import express from 'express';
import BookingController from '../controllers/bookingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ============================================================
// PUBLIC ENDPOINTS (no authentication required)
// ============================================================

/**
 * @route   GET /api/v1/bookings/available-slots
 * @desc    Get available time slots for the booking form
 * @access  Public
 * @query   start_date (ISO), end_date (ISO)
 */
router.get('/available-slots', BookingController.getAvailableSlots);

// ============================================================
// PROTECTED ENDPOINTS (require authentication)
// ============================================================

/**
 * @route   POST /api/v1/bookings
 * @desc    Create a new site visit booking
 * @access  Private (client)
 */
router.post('/', protect, BookingController.createBooking);

/**
 * @route   GET /api/v1/bookings
 * @desc    List client's bookings
 * @access  Private (client)
 * @query   status, limit, offset
 */
router.get('/', protect, BookingController.listBookings);

/**
 * @route   GET /api/v1/bookings/:id
 * @desc    Get a single booking detail
 * @access  Private (client — own bookings only)
 */
router.get('/:id', protect, BookingController.getBooking);

/**
 * @route   PATCH /api/v1/bookings/:id
 * @desc    Cancel or reschedule a booking
 * @access  Private (client — own bookings only)
 */
router.patch('/:id', protect, BookingController.updateBooking);

export { router as bookingRoutes };
export default router;
