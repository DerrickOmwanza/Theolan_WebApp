import { db } from '../config/database.js';

/**
 * Booking Model
 * Data access layer for bookings and time slot availability.
 */
const BookingModel = {

  // ============================================================
  // Time Slot Queries
  // ============================================================

  /**
   * Get available time slots for a date range.
   * Excludes slots that already have a booking at the same datetime.
   *
   * @param {string} startDate - ISO date string (YYYY-MM-DD)
   * @param {string} endDate - ISO date string (YYYY-MM-DD)
   * @returns {Promise<Array>} Available slots with date, start_time, end_time
   */
  getAvailableSlots: async (startDate, endDate) => {
    return db.raw(`
      SELECT
        ts.id,
        ts.date,
        ts.start_time,
        ts.end_time
      FROM time_slots ts
      WHERE ts.date BETWEEN ? AND ?
        AND ts.available = true
        AND NOT EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.scheduled_at = (ts.date + ts.start_time)::timestamp
            AND b.status NOT IN ('cancelled')
        )
      ORDER BY ts.date ASC, ts.start_time ASC
    `, [startDate, endDate]);
  },

  /**
   * Check if a specific datetime has an available slot.
   *
   * @param {string} date - ISO date (YYYY-MM-DD)
   * @param {string} startTime - Time string (HH:MM:SS)
   * @returns {Promise<Object|null>} Slot record or null
   */
  findSlotAt: async (date, startTime) => {
    return db('time_slots')
      .where({
        date,
        start_time: startTime,
        available: true
      })
      .first();
  },

  /**
   * Mark a time slot as unavailable (after booking).
   *
   * @param {string} slotId - Time slot UUID
   */
  markSlotUnavailable: async (slotId) => {
    return db('time_slots')
      .where({ id: slotId })
      .update({ available: false });
  },

  /**
   * Mark a time slot as available again (after cancellation).
   * Works even if the slot is currently marked unavailable.
   *
   * @param {string} slotId - Time slot UUID
   */
  markSlotAvailable: async (slotId) => {
    return db('time_slots')
      .where({ id: slotId })
      .update({ available: true });
  },

  /**
   * Restore a time slot by date + time (used when cancelling a booking).
   * Finds the slot regardless of available status and sets it to available.
   *
   * @param {string} date - ISO date (YYYY-MM-DD)
   * @param {string} startTime - Time string (HH:MM:SS)
   */
  restoreSlotByDateTime: async (date, startTime) => {
    return db('time_slots')
      .where({ date, start_time: startTime })
      .update({ available: true });
  },

  // ============================================================
  // Booking Queries
  // ============================================================

  /**
   * Check if a booking already exists at the given datetime.
   *
   * @param {string|Date} scheduledAt - Timestamp of the booking
   * @param {string} [excludeBookingId] - Booking ID to exclude (for reschedules)
   * @returns {Promise<Object|null>} Conflicting booking or null
   */
  findConflict: async (scheduledAt, excludeBookingId = null) => {
    let query = db('bookings')
      .where('scheduled_at', scheduledAt)
      .whereNot('status', 'cancelled');

    if (excludeBookingId) {
      query = query.whereNot('id', excludeBookingId);
    }

    return query.first();
  },

  /**
   * Create a new booking record.
   *
   * @param {Object} bookingData - Booking fields
   * @returns {Promise<Object>} Created booking
   */
  create: async (bookingData) => {
    const [booking] = await db('bookings')
      .insert(bookingData)
      .returning('*');
    return booking;
  },

  /**
   * Find a booking by ID.
   *
   * @param {string} id - Booking UUID
   * @returns {Promise<Object|null>}
   */
  findById: async (id) => {
    return db('bookings').where({ id }).first();
  },

  /**
   * Get bookings for a specific client.
   * Includes assigned technician details.
   *
   * @param {string} clientId - User UUID (client_id in bookings)
   * @param {Object} options - { status, limit, offset }
   * @returns {Promise<{data: Array, total: number}>}
   */
  findByClient: async (clientId, { status, limit = 20, offset = 0 } = {}) => {
    let query = db('bookings')
      .select(
        'bookings.*',
        'technicians.name as technician_name',
        'technicians.phone as technician_phone'
      )
      .leftJoin('technicians', 'bookings.assigned_technician_id', 'technicians.id')
      .where('bookings.client_id', clientId)
      .orderBy('bookings.scheduled_at', 'desc');

    if (status) {
      query = query.where('bookings.status', status);
    }

    // Get total count for pagination
    const countQuery = db('bookings')
      .where('client_id', clientId)
      .count('id as total');

    if (status) {
      countQuery.where('status', status);
    }

    const [data, countResult] = await Promise.all([
      query.limit(limit).offset(offset),
      countQuery.first()
    ]);

    return {
      data,
      total: parseInt(countResult.total, 10)
    };
  },

  /**
   * Update a booking record.
   *
   * @param {string} id - Booking UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated booking
   */
  update: async (id, updates) => {
    const [booking] = await db('bookings')
      .where({ id })
      .update({ ...updates, updated_at: db.fn.now() })
      .returning('*');
    return booking;
  },

  /**
   * Get the highest reference number to generate the next one.
   *
   * @returns {Promise<string|null>} Highest reference number or null
   */
  getLatestReferenceNumber: async () => {
    const result = await db('bookings')
      .max('reference_number as latest')
      .first();
    return result?.latest || null;
  },

  /**
   * Find a booking by reference number.
   *
   * @param {string} referenceNumber - e.g. "BKG001"
   * @returns {Promise<Object|null>}
   */
  findByReference: async (referenceNumber) => {
    return db('bookings').where({ reference_number: referenceNumber }).first();
  }
};

export default BookingModel;
