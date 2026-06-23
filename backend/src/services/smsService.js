import axios from 'axios';
import logger from '../middlewares/logger.js';

/**
 * SMS Notification Service
 * Sends SMS messages via Africa's Talking API.
 * Falls back to logging when API credentials are not configured.
 */

const API_KEY = process.env.AFRICASTALKING_API_KEY;
const USERNAME = process.env.AFRICASTALKING_USERNAME || 'sandbox';
const IS_SANDBOX = process.env.AFRICASTALKING_ENV !== 'production';

const BASE_URL = IS_SANDBOX
  ? 'https://api.sandbox.africastalking.com'
  : 'https://api.africastalking.com';

/**
 * Send an SMS message to a single recipient.
 *
 * @param {string} phone - Recipient phone in +254XXXXXXXXX format
 * @param {string} message - Message body (max 160 chars for single SMS)
 * @returns {Promise<{sent: boolean, messageId?: string, cost?: string}>}
 */
export const sendSMS = async (phone, message) => {
  // If API key is not configured, log and return (dev mode)
  if (!API_KEY || API_KEY === 'your_api_key') {
    logger.info("SMS (dev mode — Africa's Talking not configured)", { phone, message });
    return { sent: true, messageId: 'dev-mode', cost: 'KES 0.00' };
  }

  logger.info('Attempting SMS send', { phone, username: USERNAME, baseUrl: BASE_URL });

  try {
    const response = await axios.post(
      `${BASE_URL}/version1/messaging`,
      new URLSearchParams({
        username: USERNAME,
        to: phone,
        message: message
      }).toString(),
      {
        headers: {
          apikey: API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json'
        },
        timeout: 10000 // 10s timeout
      }
    );

    const result = response.data;
    const smsData = result?.SMSMessageData;

    if (smsData?.Recipients?.length > 0) {
      const recipient = smsData.Recipients[0];
      logger.info('SMS sent successfully', {
        phone,
        messageId: recipient.messageId,
        cost: recipient.cost,
        status: recipient.status
      });
      return {
        sent: true,
        messageId: recipient.messageId,
        cost: recipient.cost
      };
    }

    logger.warn('SMS send returned no recipients', { phone, response: result });
    return { sent: false };
  } catch (error) {
    logger.error('SMS send failed', {
      phone,
      error: error.response?.data || error.message,
      status: error.response?.status,
      baseUrl: BASE_URL
    });
    return { sent: false, error: error.message };
  }
};

/**
 * Send a booking confirmation SMS.
 *
 * @param {Object} booking - Booking record
 * @param {string} booking.reference_number - e.g. "BKG001"
 * @param {Date|string} booking.scheduled_at - Scheduled date/time
 * @param {string} clientPhone - Client phone number
 * @param {string} [technicianName] - Assigned technician name (optional)
 */
export const sendBookingConfirmation = (booking, clientPhone, technicianName) => {
  const date = new Date(booking.scheduled_at);
  const formattedDate = date.toLocaleDateString('en-KE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const formattedTime = date.toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  let message = `Theolan Aluminium: Site visit confirmed for ${formattedDate} at ${formattedTime}.`;
  message += ` Ref: ${booking.reference_number}.`;
  if (technicianName) {
    message += ` Technician: ${technicianName}.`;
  }
  message += ' Reply CONFIRM or CANCEL. Call 0700-000-000 for support.';

  return sendSMS(clientPhone, message);
};

/**
 * Send a booking cancellation SMS.
 *
 * @param {string} referenceNumber - Booking reference (e.g. "BKG001")
 * @param {string} clientPhone - Client phone number
 * @param {string} [reason] - Cancellation reason (optional)
 */
export const sendBookingCancellation = (referenceNumber, clientPhone, reason) => {
  let message = `Theolan Aluminium: Your booking ${referenceNumber} has been cancelled.`;
  if (reason) {
    message += ` Reason: ${reason}.`;
  }
  message += ' Book a new visit at olanallumint.co.ke/booking';

  return sendSMS(clientPhone, message);
};

/**
 * Send a booking reschedule SMS.
 *
 * @param {string} referenceNumber - Booking reference
 * @param {Date|string} newDateTime - New scheduled date/time
 * @param {string} clientPhone - Client phone number
 */
export const sendBookingReschedule = (referenceNumber, newDateTime, clientPhone) => {
  const date = new Date(newDateTime);
  const formattedDate = date.toLocaleDateString('en-KE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
  const formattedTime = date.toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const message = `Theolan Aluminium: Your booking ${referenceNumber} has been rescheduled to ${formattedDate} at ${formattedTime}. Reply CONFIRM or call 0700-000-000.`;

  return sendSMS(clientPhone, message);
};
