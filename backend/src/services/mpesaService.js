import axios from 'axios';
import logger from '../middlewares/logger.js';
import SettingsModel from '../models/settingsModel.js';

/**
 * M-Pesa Service
 * Handles Safaricom Daraja API integration for STK Push payments.
 *
 * Flow:
 * 1. Client clicks "Pay Deposit" → backend initiates STK Push
 * 2. Client receives USSD popup on phone → enters M-Pesa PIN
 * 3. Safaricom sends callback to webhook → backend processes result
 * 4. Backend updates payment status + order status + sends SMS
 */

const CONSUMER_KEY = process.env.SAFARICOM_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.SAFARICOM_CONSUMER_SECRET;
const PASSKEY = process.env.SAFARICOM_PASSKEY;
const IS_SANDBOX = process.env.SAFARICOM_ENV !== 'production';

const BASE_URL = IS_SANDBOX
  ? 'https://sandbox.safaricom.co.ke'
  : 'https://api.safaricom.co.ke';

// Cache for settings values (valid for restart lifetime)
let cachedShortcode = null;
let cachedCallbackUrl = null;

/**
 * Get shortcode from settings table or fall back to env var.
 * Settings table takes precedence over environment variables.
 */
const getShortcode = async () => {
  if (cachedShortcode !== null) {
    return cachedShortcode;
  }
  const dbShortcode = await SettingsModel.get('mpesa_shortcode');
  cachedShortcode = dbShortcode || process.env.SAFARICOM_SHORTCODE;
  return cachedShortcode;
};

/**
 * Get callback URL from settings table or fall back to env var.
 * Settings table takes precedence over environment variables.
 */
const getCallbackUrl = async () => {
  if (cachedCallbackUrl !== null) {
    return cachedCallbackUrl;
  }
  const dbCallbackUrl = await SettingsModel.get('mpesa_callback_url');
  cachedCallbackUrl = dbCallbackUrl || process.env.SAFARICOM_CALLBACK_URL;
  return cachedCallbackUrl;
};

// Cache for OAuth token (valid for 1 hour)
let cachedToken = null;
let tokenExpiry = 0;

/**
 * Get OAuth access token from Safaricom.
 * Token is cached for 55 minutes (5 min buffer before 1hr expiry).
 */
const getAccessToken = async () => {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  if (!CONSUMER_KEY || CONSUMER_KEY === 'your_consumer_key') {
    throw new Error('M-Pesa credentials not configured');
  }

  const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

  const response = await axios.get(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${credentials}` },
      timeout: 10000
    }
  );

  cachedToken = response.data.access_token;
  tokenExpiry = Date.now() + 55 * 60 * 1000; // Cache for 55 minutes

  return cachedToken;
};

/**
 * Generate the M-Pesa STK Push password.
 * Format: base64(SHORTCODE + PASSKEY + TIMESTAMP)
 */
const generatePassword = (shortcode, timestamp) => {
  const str = `${shortcode}${PASSKEY}${timestamp}`;
  return Buffer.from(str).toString('base64');
};

/**
 * Format date to M-Pesa required format: YYYYMMDDHHmmss
 */
const formatTimestamp = (date = new Date()) => {
  const pad = (n) => n.toString().padStart(2, '0');
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
};

/**
 * Initiate M-Pesa STK Push (Lipa Na M-Pesa Online).
 *
 * @param {string} phoneNumber - Customer phone (format: 254XXXXXXXXX without +)
 * @param {number} amount - Amount in KES (minimum 1)
 * @param {string} accountReference - Order reference number (e.g., "ORD001")
 * @param {string} description - Transaction description
 * @returns {Promise<Object>} STK Push response with CheckoutRequestID
 */
export const initiateSTKPush = async (phoneNumber, amount, accountReference, description) => {
  // Dev mode: simulate STK Push
  if (!CONSUMER_KEY || CONSUMER_KEY === 'your_consumer_key') {
    logger.info('M-Pesa STK Push (dev mode — Daraja not configured)', {
      phoneNumber, amount, accountReference
    });
    return {
      success: true,
      devMode: true,
      checkoutRequestId: `ws_CO_DEV_${Date.now()}`,
      message: 'STK push simulated (dev mode). In production, customer receives USSD prompt.'
    };
  }

  const accessToken = await getAccessToken();
  const [shortcode, callbackUrl] = await Promise.all([getShortcode(), getCallbackUrl()]);
  const timestamp = formatTimestamp();
  const password = generatePassword(shortcode, timestamp);

  // Format phone: remove + prefix, must be 254XXXXXXXXX
  const phone = phoneNumber.replace(/^\+/, '');

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: phone,
    PartyB: shortcode,
    PhoneNumber: phone,
    CallBackURL: callbackUrl,
    AccountReference: accountReference,
    TransactionDesc: description || 'Payment for order'
  };

  try {
    const response = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const result = response.data;

    logger.info('M-Pesa STK Push initiated', {
      merchantRequestId: result.MerchantRequestID,
      checkoutRequestId: result.CheckoutRequestID,
      responseCode: result.ResponseCode,
      phoneNumber: phone,
      amount
    });

    if (result.ResponseCode !== '0') {
      return {
        success: false,
        errorCode: result.ResponseCode,
        message: result.ResponseDescription || 'STK Push failed'
      };
    }

    return {
      success: true,
      checkoutRequestId: result.CheckoutRequestID,
      merchantRequestId: result.MerchantRequestID,
      message: result.CustomerMessage || 'STK push sent. Enter PIN on your phone.'
    };
  } catch (error) {
    logger.error('M-Pesa STK Push request failed', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

/**
 * Parse M-Pesa callback metadata to extract payment details.
 *
 * @param {Array} callbackItems - CallbackMetadata.Item array
 * @returns {Object} Parsed payment details
 */
export const parseCallbackMetadata = (callbackItems) => {
  const metadata = {};
  if (!callbackItems) return metadata;

  for (const item of callbackItems) {
    switch (item.Name) {
      case 'Amount':
        metadata.amount = item.Value;
        break;
      case 'MpesaReceiptNumber':
        metadata.mpesaReceipt = item.Value;
        break;
      case 'TransactionDate':
        metadata.transactionDate = item.Value;
        break;
      case 'PhoneNumber':
        metadata.phoneNumber = item.Value;
        break;
      default:
        metadata[item.Name] = item.Value;
    }
  }

  return metadata;
};

/**
 * Query the status of an STK Push request.
 * Used to check pending payments that never received a callback.
 *
 * @param {string} checkoutRequestId - The CheckoutRequestID from STK Push
 * @returns {Promise<Object>} Query result with status
 */
export const querySTKPushStatus = async (checkoutRequestId) => {
  // Dev mode: simulate
  if (!CONSUMER_KEY || CONSUMER_KEY === 'your_consumer_key') {
    logger.info('M-Pesa STK Query (dev mode)', { checkoutRequestId });
    return {
      success: true,
      devMode: true,
      checkoutRequestId,
      resultCode: 1, // Simulate "cancelled by user" in dev
      resultDesc: 'The transaction was cancelled by the user'
    };
  }

  const accessToken = await getAccessToken();
  const [shortcode, callbackUrl] = await Promise.all([getShortcode(), getCallbackUrl()]);
  const timestamp = formatTimestamp();
  const password = generatePassword(shortcode, timestamp);

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId
  };

  try {
    const response = await axios.post(
      `${BASE_URL}/mpesa/stkpushquery/v1/query`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const result = response.data;

    logger.info('M-Pesa STK Push query result', {
      checkoutRequestId,
      resultCode: result.ResultCode,
      resultDesc: result.ResultDesc
    });

    return {
      success: true,
      checkoutRequestId,
      resultCode: result.ResultCode,
      resultDesc: result.ResultDesc,
      customerMessage: result.CustomerMessage
    };
  } catch (error) {
    logger.error('M-Pesa STK Push query failed', {
      checkoutRequestId,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};
