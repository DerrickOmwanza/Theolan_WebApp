import { db } from '../config/database.js';
import logger from '../middlewares/logger.js';

/**
 * User Model
 * Data access layer for users, OTP codes, and refresh tokens.
 * All database queries are centralized here — services never query directly.
 */
const UserModel = {
  // ============================================================
  // User Queries
  // ============================================================

  findById: (id) => {
    return db('users').where({ id, deleted_at: null }).first();
  },

  findByPhone: (phone) => {
    return db('users').where({ phone, deleted_at: null }).first();
  },

  findByEmail: (email) => {
    return db('users').where({ email, deleted_at: null }).first();
  },

  create: async (userData) => {
    const [user] = await db('users').insert(userData).returning('*');
    return user;
  },

  update: async (id, updates) => {
    const [user] = await db('users')
      .where({ id })
      .update({ ...updates, updated_at: db.fn.now() })
      .returning('*');
    return user;
  },

  // ============================================================
  // OTP Queries
  // ============================================================

  saveOTP: (otpData) => {
    return db('otp_codes').insert(otpData);
  },

  /**
   * Find a valid (unused, unexpired) OTP code.
   * Enforces brute-force protection: rejects if attempts >= max.
   *
   * @param {string} phone - Normalized phone number
   * @param {string} code - OTP code entered by user
   * @param {string} type - OTP type (signup, login, password_reset)
   * @param {number} maxAttempts - Max allowed attempts (default 5)
   * @returns {Promise<Object|null>} - OTP record or null
   */
  findValidOTP: async (phone, code, type, maxAttempts = 5) => {
    // Find the most recent OTP of this type for this phone
    const otp = await db('otp_codes')
      .where({ phone, type, is_used: false })
      .where('expires_at', '>', new Date())
      .orderBy('created_at', 'desc')
      .first();

    if (!otp) {
      return null; // No valid OTP exists (expired or doesn't exist)
    }

    // Check brute-force: too many attempts
    if (otp.attempts >= maxAttempts) {
      logger.warn('OTP brute-force limit reached', { phone, type, attempts: otp.attempts });
      return null;
    }

    // Increment attempt counter
    await db('otp_codes')
      .where({ id: otp.id })
      .update({ attempts: otp.attempts + 1 });

    // Check if code matches
    if (otp.code !== code) {
      return null; // Wrong code, but attempts incremented
    }

    return otp;
  },

  markOTPUsed: (id) => {
    return db('otp_codes')
      .where({ id })
      .update({
        is_used: true,
        used_at: db.fn.now()
      });
  },

  /**
   * Invalidate all existing OTPs for a phone/type combination.
   * Used when generating a new OTP to prevent reuse of old ones.
   */
  invalidatePreviousOTPs: (phone, type) => {
    return db('otp_codes')
      .where({ phone, type, is_used: false })
      .update({ is_used: true, used_at: db.fn.now() });
  },

  // ============================================================
  // Refresh Token Queries
  // ============================================================

  saveRefreshToken: (tokenData) => {
    return db('refresh_tokens').insert(tokenData);
  },

  findRefreshToken: (token) => {
    return db('refresh_tokens')
      .where({ token, is_revoked: false })
      .where('expires_at', '>', new Date())
      .first();
  },

  revokeRefreshToken: (token) => {
    return db('refresh_tokens')
      .where({ token })
      .update({ is_revoked: true });
  },

  revokeAllUserTokens: (userId) => {
    return db('refresh_tokens')
      .where({ user_id: userId, is_revoked: false })
      .update({ is_revoked: true });
  }
};

export default UserModel;
