import BookingModel from '../models/bookingModel.js';
import UserModel from '../models/userModel.js';
import {
  ValidationError,
  ConflictError,
  NotFoundError,
  AuthorizationError
} from '../middlewares/errorHandler.js';
import {
  sendBookingConfirmation,
  sendBookingCancellation,
  sendBookingReschedule
} from './smsService.js';
import logger from '../middlewares/logger.js';

// ============================================================
// Reference Number Generator
// ============================================================

/**
 * Generate the next booking reference number (BKG001, BKG002, ...).
 *
 * @returns {Promise<string>} Next reference number
 */
const generateReferenceNumber = async () => {
  const latest = await BookingModel.getLatestReferenceNumber();

  if (!latest) {
    return 'BKG001';
  }

  // Extract numeric part from "BKG###" and increment
  const match = latest.match(/^BKG(\d+)$/);
  const nextNum = match ? parseInt(match[1], 10) + 1 : 1;

  return `BKG${nextNum.toString().padStart(3, '0')}`;
};

// ============================================================
// Booking Service
// ============================================================

const BookingService = {
  /**
   * Get available time slots for a date range.
   * Used by the booking form to show selectable dates/times.
   *
   * @param {string} startDate - ISO date (YYYY-MM-DD), defaults to today
   * @param {string} endDate - ISO date (YYYY-MM-DD), defaults to startDate + 7 days
   * @returns {Promise<Object>} Grouped slots by date
   */
  getAvailableSlots: async (startDate, endDate) => {
    // Default: next 7 days from today
    const start = startDate || new Date().toISOString().split('T')[0];
    const end =
      endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Validate date range
    if (new Date(start) > new Date(end)) {
      throw new ValidationError('start_date must be before or equal to end_date');
    }

    // Limit range to 90 days to prevent excessive queries
    const dayDiff = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
    if (dayDiff > 90) {
      throw new ValidationError('Date range cannot exceed 90 days');
    }

    const result = await BookingModel.getAvailableSlots(start, end);
    const slots = result.rows || [];

    // Group slots by date for easier frontend consumption
    const grouped = {};
    for (const slot of slots) {
      const dateKey =
        slot.date instanceof Date
          ? slot.date.toISOString().split('T')[0]
          : String(slot.date).split('T')[0];

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          slots: []
        };
      }

      grouped[dateKey].slots.push({
        start_time: slot.start_time,
        end_time: slot.end_time
      });
    }

    return {
      success: true,
      data: Object.values(grouped),
      total_slots: slots.length,
      date_range: { start, end }
    };
  },

  /**
   * Create a new booking.
   * Validates slot availability, prevents double-booking,
   * generates reference number, sends SMS confirmation.
   *
   * @param {string} clientId - Authenticated user's UUID
   * @param {Object} bookingInput - Validated booking data
   * @returns {Promise<Object>} Created booking with reference number
   */
  createBooking: async (clientId, bookingInput) => {
    const { service_type, property_type, location, scheduled_at, contact_method, notes } =
      bookingInput;

    // Parse the scheduled_at timestamp into date + time components
    const scheduledDate = new Date(scheduled_at);
    const dateStr = scheduledDate.toISOString().split('T')[0];
    const timeStr = scheduledDate.toTimeString().split(' ')[0]; // HH:MM:SS

    // Step 1: Verify the time slot exists and is available
    const slot = await BookingModel.findSlotAt(dateStr, timeStr);
    if (!slot) {
      throw new ValidationError(
        'The selected date/time is not available. Please choose a different slot.'
      );
    }

    // Step 2: Check for conflicting bookings at the same datetime
    const conflict = await BookingModel.findConflict(scheduled_at);
    if (conflict) {
      throw new ConflictError('This time slot has just been booked. Please select another time.');
    }

    // Step 3: Generate reference number
    const reference_number = await generateReferenceNumber();

    // Step 4: Create the booking record
    const booking = await BookingModel.create({
      client_id: clientId,
      service_type,
      property_type: property_type || null,
      location,
      scheduled_at: scheduledDate,
      contact_method: contact_method || 'sms',
      notes: notes || null,
      reference_number,
      status: 'scheduled'
    });

    // Step 5: Mark the time slot as unavailable
    await BookingModel.markSlotUnavailable(slot.id);

    // Step 6: Send SMS confirmation (non-blocking — don't fail booking if SMS fails)
    const client = await UserModel.findById(clientId);
    if (client) {
      sendBookingConfirmation(booking, client.phone).catch((err) => {
        logger.error('Booking confirmation SMS failed (non-blocking)', {
          bookingId: booking.id,
          error: err.message
        });
      });
    }

    logger.info('Booking created', {
      bookingId: booking.id,
      referenceNumber: reference_number,
      clientId,
      scheduledAt: scheduled_at
    });

    return {
      success: true,
      message: 'Booking confirmed',
      data: {
        id: booking.id,
        client_id: booking.client_id,
        reference_number: booking.reference_number,
        scheduled_at: booking.scheduled_at,
        status: booking.status,
        sms_confirmation_sent: true
      }
    };
  },

  /**
   * List bookings for a client.
   * Supports filtering by status and pagination.
   *
   * @param {string} clientId - Authenticated user's UUID
   * @param {Object} options - { status, limit, offset }
   * @returns {Promise<Object>} Paginated booking list
   */
  getClientBookings: async (clientId, { status, limit = 20, offset = 0 } = {}) => {
    const { data, total } = await BookingModel.findByClient(clientId, { status, limit, offset });

    // Map to API contract response format
    const bookings = data.map((b) => ({
      id: b.id,
      reference_number: b.reference_number,
      service_type: b.service_type,
      scheduled_at: b.scheduled_at,
      status: b.status,
      assigned_technician: b.technician_name
        ? { name: b.technician_name, phone: b.technician_phone }
        : null
    }));

    return {
      success: true,
      data: bookings,
      pagination: {
        total,
        limit,
        offset
      }
    };
  },

  /**
   * Get a single booking by ID.
   * Clients can only view their own bookings.
   *
   * @param {string} bookingId - Booking UUID
   * @param {string} clientId - Authenticated user's UUID
   * @returns {Promise<Object>} Booking detail
   */
  getBookingById: async (bookingId, clientId) => {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Clients can only view their own bookings
    if (booking.client_id !== clientId) {
      throw new AuthorizationError('You can only view your own bookings');
    }

    return {
      success: true,
      data: booking
    };
  },

  /**
   * Cancel or reschedule a booking.
   * Only the booking owner can cancel. Restores the time slot.
   *
   * @param {string} bookingId - Booking UUID
   * @param {string} clientId - Authenticated user's UUID
   * @param {Object} updates - { status, reason }
   * @returns {Promise<Object>} Updated booking
   */
  updateBooking: async (bookingId, clientId, { status, reason, scheduled_at }) => {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Clients can only modify their own bookings
    if (booking.client_id !== clientId) {
      throw new AuthorizationError('You can only modify your own bookings');
    }

    // Prevent modifying already completed/cancelled bookings
    if (booking.status === 'completed') {
      throw new ValidationError('Cannot modify a completed booking');
    }
    if (booking.status === 'cancelled' && status !== 'scheduled') {
      throw new ValidationError('Booking is already cancelled');
    }

    const updates = { status };

    // If cancelling, restore the time slot
    if (status === 'cancelled') {
      const scheduledDate = new Date(booking.scheduled_at);
      const dateStr = scheduledDate.toISOString().split('T')[0];
      const timeStr = scheduledDate.toTimeString().split(' ')[0];

      // Restore the time slot to available
      await BookingModel.restoreSlotByDateTime(dateStr, timeStr);

      // Send cancellation SMS
      const client = await UserModel.findById(clientId);
      if (client) {
        sendBookingCancellation(booking.reference_number, client.phone, reason).catch((err) => {
          logger.error('Booking cancellation SMS failed (non-blocking)', {
            bookingId,
            error: err.message
          });
        });
      }

      logger.info('Booking cancelled', {
        bookingId,
        referenceNumber: booking.reference_number,
        reason
      });
    }

    // If rescheduling, validate new slot
    if (scheduled_at && scheduled_at !== booking.scheduled_at) {
      const newDate = new Date(scheduled_at);
      const dateStr = newDate.toISOString().split('T')[0];
      const timeStr = newDate.toTimeString().split(' ')[0];

      // Check new slot is available
      const newSlot = await BookingModel.findSlotAt(dateStr, timeStr);
      if (!newSlot) {
        throw new ValidationError('The new date/time is not available');
      }

      // Check for conflicts at the new time
      const conflict = await BookingModel.findConflict(scheduled_at, bookingId);
      if (conflict) {
        throw new ConflictError('The new time slot is already booked');
      }

      // Restore old slot
      const oldDate = new Date(booking.scheduled_at);
      const oldDateStr = oldDate.toISOString().split('T')[0];
      const oldTimeStr = oldDate.toTimeString().split(' ')[0];
      await BookingModel.restoreSlotByDateTime(oldDateStr, oldTimeStr);

      // Mark new slot as unavailable
      await BookingModel.markSlotUnavailable(newSlot.id);

      updates.scheduled_at = newDate;

      // Send reschedule SMS
      const client = await UserModel.findById(clientId);
      if (client) {
        sendBookingReschedule(booking.reference_number, scheduled_at, client.phone).catch((err) => {
          logger.error('Booking reschedule SMS failed (non-blocking)', {
            bookingId,
            error: err.message
          });
        });
      }

      logger.info('Booking rescheduled', {
        bookingId,
        from: booking.scheduled_at,
        to: scheduled_at
      });
    }

    const updated = await BookingModel.update(bookingId, updates);

    return {
      success: true,
      data: {
        id: updated.id,
        reference_number: updated.reference_number,
        status: updated.status,
        scheduled_at: updated.scheduled_at
      }
    };
  },

  /**
   * Admin: List all bookings with optional filters.
   * Used by admin calendar and booking management.
   *
   * @param {Object} options - { start_date, end_date, status, limit, offset }
   * @returns {Promise<Object>} Paginated booking list with client/technician info
   */
  adminListBookings: async ({ start_date, end_date, status, limit = 50, offset = 0 } = {}) => {
    const { data, total } = await BookingModel.adminFindAll({
      start_date,
      end_date,
      status,
      limit,
      offset
    });

    const bookings = data.map((b) => ({
      id: b.id,
      reference_number: b.reference_number,
      service_type: b.service_type,
      property_type: b.property_type,
      location: b.location,
      scheduled_at: b.scheduled_at,
      status: b.status,
      contact_method: b.contact_method,
      notes: b.notes,
      client: b.client_name
        ? {
            id: b.client_id,
            name: b.client_name,
            phone: b.client_phone
          }
        : null,
      technician: b.technician_name
        ? {
            id: b.assigned_technician_id,
            name: b.technician_name,
            phone: b.technician_phone
          }
        : null
    }));

    return {
      success: true,
      data: bookings,
      pagination: { total, limit, offset }
    };
  }
};

export default BookingService;
