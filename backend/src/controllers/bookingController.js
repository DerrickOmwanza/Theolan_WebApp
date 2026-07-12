import Joi from 'joi';
import BookingService from '../services/bookingService.js';
import { asyncHandler, ValidationError } from '../middlewares/errorHandler.js';

// ============================================================
// Validation Schemas
// ============================================================

const SERVICE_TYPES = ['windows', 'doors', 'curtain_wall', 'partitions', 'balustrades', 'glazing'];
const PROPERTY_TYPES = ['residential', 'commercial', 'industrial'];
const CONTACT_METHODS = ['sms', 'whatsapp', 'email'];
const BOOKING_STATUSES = ['scheduled', 'completed', 'cancelled', 'no_show'];

const createBookingSchema = Joi.object({
  service_type: Joi.string()
    .valid(...SERVICE_TYPES)
    .required()
    .messages({ 'any.only': 'Service type must be one of: ' + SERVICE_TYPES.join(', ') }),
  property_type: Joi.string()
    .valid(...PROPERTY_TYPES)
    .optional(),
  location: Joi.string()
    .trim()
    .min(3)
    .max(255)
    .required()
    .messages({ 'string.empty': 'Location is required' }),
  scheduled_at: Joi.date().iso().greater('now').required().messages({
    'date.greater': 'Booking must be scheduled for a future date/time',
    'date.format': 'scheduled_at must be a valid ISO 8601 date'
  }),
  contact_method: Joi.string()
    .valid(...CONTACT_METHODS)
    .optional()
    .default('sms'),
  notes: Joi.string().trim().max(1000).allow('', null).optional()
});

const updateBookingSchema = Joi.object({
  status: Joi.string()
    .valid('scheduled', 'cancelled')
    .required()
    .messages({ 'any.only': 'Clients can only set status to scheduled or cancelled' }),
  reason: Joi.string().trim().max(500).allow('', null).optional(),
  scheduled_at: Joi.date()
    .iso()
    .greater('now')
    .optional()
    .messages({ 'date.greater': 'New date/time must be in the future' })
}).or('status', 'scheduled_at');

const availableSlotsQuerySchema = Joi.object({
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional()
});

const listBookingsQuerySchema = Joi.object({
  status: Joi.string()
    .valid(...BOOKING_STATUSES)
    .optional(),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0)
});

/**
 * Validate request data against a Joi schema.
 */
const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = error.details.map((d) => ({
      field: d.context?.key,
      issue: d.message
    }));
    throw new ValidationError(error.details[0].message, details);
  }
  return value;
};

// ============================================================
// Booking Controller
// ============================================================

const BookingController = {
  /**
   * GET /api/v1/bookings/available-slots
   * Get available time slots for a date range.
   * @access Public (used by booking form before login)
   */
  getAvailableSlots: asyncHandler(async (req, res) => {
    const { start_date, end_date } = validate(availableSlotsQuerySchema, req.query);
    const result = await BookingService.getAvailableSlots(start_date, end_date);
    res.status(200).json(result);
  }),

  /**
   * POST /api/v1/bookings
   * Create a new site visit booking.
   * @access Private (requires authentication)
   */
  createBooking: asyncHandler(async (req, res) => {
    const data = validate(createBookingSchema, req.body);
    const result = await BookingService.createBooking(req.user.id, data);
    res.status(201).json(result);
  }),

  /**
   * GET /api/v1/bookings
   * List client's bookings with optional filters.
   * @access Private
   */
  listBookings: asyncHandler(async (req, res) => {
    const options = validate(listBookingsQuerySchema, req.query);
    const result = await BookingService.getClientBookings(req.user.id, options);
    res.status(200).json(result);
  }),

  /**
   * GET /api/v1/bookings/:id
   * Get a single booking detail.
   * @access Private
   */
  getBooking: asyncHandler(async (req, res) => {
    const result = await BookingService.getBookingById(req.params.id, req.user.id);
    res.status(200).json(result);
  }),

  /**
   * PATCH /api/v1/bookings/:id
   * Cancel or reschedule a booking.
   * @access Private
   */
  updateBooking: asyncHandler(async (req, res) => {
    const updates = validate(updateBookingSchema, req.body);
    const isAdminAction = req.user?.role === 'admin';
    const result = await BookingService.updateBooking(req.params.id, req.user.id, updates, isAdminAction);
    res.status(200).json(result);
  }),

  /**
   * GET /api/v1/bookings/admin
   * Admin lists all bookings with optional filters.
   * @access Private (admin only)
   */
  adminListBookings: asyncHandler(async (req, res) => {
    const options = validate(listBookingsQuerySchema, req.query);
    const result = await BookingService.adminListBookings(options);
    res.status(200).json(result);
  })
};

export default BookingController;
