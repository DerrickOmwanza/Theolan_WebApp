import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import UserModel from '../models/userModel.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  normalizePhone,
  isValidKenyanPhone
} from '../utils/auth.js';
import {
  ConflictError,
  AuthenticationError,
  ValidationError,
  NotFoundError
} from '../middlewares/errorHandler.js';
import logger from '../middlewares/logger.js';
import { sendSMS } from './smsService.js';

const BCRYPT_SALT_ROUNDS = 10;
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

/**
 * Generate a cryptographically random numeric OTP code
 */
const generateOTPCode = () => {
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  return crypto.randomInt(min, max + 1).toString();
};

/**
 * Auth Service
 * Business logic for all authentication operations.
 * Every method uses typed AppError subclasses for proper HTTP status mapping.
 */
const AuthService = {
  // ============================================================
  // Signup
  // ============================================================

  signup: async ({ name, phone: rawPhone, email, password, accept_sms_consent }) => {
    // Normalize phone
    const phone = normalizePhone(rawPhone);
    if (!phone || !isValidKenyanPhone(phone)) {
      throw new ValidationError('Phone number must be a valid East African number (e.g. +254XXXXXXXXX)');
    }

    // Check phone uniqueness
    const existingPhone = await UserModel.findByPhone(phone);
    if (existingPhone) {
      throw new ConflictError('Phone number already registered');
    }

    // Check email uniqueness (if provided)
    if (email) {
      const existingEmail = await UserModel.findByEmail(email);
      if (existingEmail) {
        throw new ConflictError('Email already registered');
      }
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Create user record (unverified)
    const user = await UserModel.create({
      name,
      phone,
      email: email || null,
      password_hash,
      role: 'client',
      is_active: true,
      notification_preference: accept_sms_consent ? 'sms' : 'email'
    });

    // Invalidate any previous OTPs for this phone
    await UserModel.invalidatePreviousOTPs(phone, 'signup');

    // Generate new OTP
    const otpCode = generateOTPCode();
    const expires_at = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await UserModel.saveOTP({
      phone,
      code: otpCode,
      type: 'signup',
      expires_at
    });

    // Log OTP in development for debugging
    if (process.env.NODE_ENV === 'development') {
      logger.info('DEV OTP for testing:', { phone, otpCode, expiresIn: OTP_EXPIRY_MINUTES * 60 });
    }

    // Send OTP via Africa's Talking SMS (if configured)
    const smsSent = await sendSMS(
      phone,
      `Your Olan Aluminium verification code is: ${otpCode}. Expires in ${OTP_EXPIRY_MINUTES} minutes.`
    );
    if (
      !smsSent.sent &&
      process.env.AFRICASTALKING_API_KEY &&
      process.env.AFRICASTALKING_API_KEY !== 'your_api_key'
    ) {
      logger.warn('Failed to send SMS, falling back to log', { phone });
    }

    // For development, log the OTP (never in production when SMS works)
    if (process.env.NODE_ENV === 'development' || !smsSent.sent) {
      logger.debug('DEV OTP - check server logs', { phone, code: otpCode });
    }

    logger.info('User registered', { userId: user.id, phone });

    return {
      message: 'Signup successful. Verify OTP sent to phone.',
      data: {
        user_id: user.id,
        phone: user.phone,
        otp_expires_in_seconds: OTP_EXPIRY_MINUTES * 60
      }
    };
  },

  // ============================================================
  // Verify OTP
  // ============================================================

  verifyOTP: async (rawPhone, code) => {
    const phone = normalizePhone(rawPhone);
    if (!phone) {
      throw new ValidationError('Invalid phone number format');
    }

    const otp = await UserModel.findValidOTP(phone, code, 'signup');
    if (!otp) {
      throw new ValidationError('Code is incorrect or expired');
    }

    // Mark OTP as used
    await UserModel.markOTPUsed(otp.id);

    // Find user
    const user = await UserModel.findByPhone(phone);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Mark phone as verified
    await UserModel.update(user.id, {
      phone_verified: true,
      phone_verified_at: new Date()
    });

    logger.info('OTP verified', { userId: user.id, phone });

    // Per API contract: verify-otp returns user_id and phone_verified only
    // Tokens are issued on login, not on OTP verification
    return {
      success: true,
      message: 'OTP verified successfully',
      data: {
        user_id: user.id,
        phone_verified: true
      }
    };
  },

  // ============================================================
  // Login
  // ============================================================

  login: async (rawPhone, password) => {
    const phone = normalizePhone(rawPhone);
    if (!phone) {
      throw new AuthenticationError('Invalid credentials');
    }

    const user = await UserModel.findByPhone(phone);
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Check account status
    if (!user.is_active) {
      throw new AuthenticationError('Account is deactivated. Contact support.');
    }

    // Check phone verification
    if (!user.phone_verified) {
      throw new AuthenticationError('Phone number not verified. Please verify your OTP first.');
    }

    // Generate tokens
    const access_token = generateAccessToken(user);
    const refresh_token = generateRefreshToken(user);

    // Store refresh token
    const expires_at = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    await UserModel.saveRefreshToken({
      user_id: user.id,
      token: refresh_token,
      expires_at
    });

    // Update last login timestamp
    await UserModel.update(user.id, { last_login_at: new Date() });

    logger.info('User logged in', { userId: user.id, role: user.role });

    return {
      success: true,
      data: {
        access_token,
        refresh_token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role
        }
      }
    };
  },

  // ============================================================
  // Refresh Access Token
  // ============================================================

  refreshAccessToken: async (refreshToken) => {
    // Step 1: Verify JWT signature and expiration
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    // Step 2: Check token exists in DB and is not revoked
    const storedToken = await UserModel.findRefreshToken(refreshToken);
    if (!storedToken) {
      throw new AuthenticationError('Refresh token has been revoked');
    }

    // Step 3: Verify user still exists and is active
    const user = await UserModel.findById(storedToken.user_id);
    if (!user || !user.is_active) {
      throw new AuthenticationError('User not found or account deactivated');
    }

    // Step 4: Rotate — revoke old refresh token, issue new one
    await UserModel.revokeRefreshToken(refreshToken);

    const new_access_token = generateAccessToken(user);
    const new_refresh_token = generateRefreshToken(user);

    const expires_at = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    await UserModel.saveRefreshToken({
      user_id: user.id,
      token: new_refresh_token,
      expires_at
    });

    logger.info('Token refreshed', { userId: user.id });

    return {
      success: true,
      data: {
        access_token: new_access_token,
        refresh_token: new_refresh_token,
        expires_in: 900
      }
    };
  },

  // ============================================================
  // Logout
  // ============================================================

  logout: async (refreshToken) => {
    if (refreshToken) {
      await UserModel.revokeRefreshToken(refreshToken);
      logger.info('User logged out (token revoked)');
    }

    return {
      success: true,
      message: 'Logged out successfully'
    };
  },

  // ============================================================
  // Forgot Password
  // ============================================================

  forgotPassword: async (rawPhone) => {
    const phone = normalizePhone(rawPhone);

    // Always return 200 — don't reveal whether user exists
    if (!phone) {
      return { success: true, message: 'Reset OTP sent to phone' };
    }

    const user = await UserModel.findByPhone(phone);
    if (!user) {
      return { success: true, message: 'Reset OTP sent to phone' };
    }

    // Invalidate previous password_reset OTPs
    await UserModel.invalidatePreviousOTPs(phone, 'password_reset');

    // Generate new OTP
    const otpCode = generateOTPCode();
    const expires_at = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await UserModel.saveOTP({
      phone,
      code: otpCode,
      type: 'password_reset',
      expires_at
    });

    // Send OTP via Africa's Talking SMS (if configured)
    const smsSent = await sendSMS(
      phone,
      `Your Olan Aluminium password reset code is: ${otpCode}. Expires in ${OTP_EXPIRY_MINUTES} minutes.`
    );
    if (
      !smsSent.sent &&
      process.env.AFRICASTALKING_API_KEY &&
      process.env.AFRICASTALKING_API_KEY !== 'your_api_key'
    ) {
      logger.warn('Failed to send SMS, falling back to log', { phone });
    }

    // For development, log the OTP (never in production when SMS works)
    if (process.env.NODE_ENV === 'development' || !smsSent.sent) {
      logger.debug('DEV Reset OTP - check server logs', { phone, code: otpCode });
    }

    logger.info('Password reset requested', { phone });

    return { success: true, message: 'Reset OTP sent to phone' };
  },

  // ============================================================
  // Resend OTP
  // ============================================================

  resendOTP: async (rawPhone) => {
    const phone = normalizePhone(rawPhone);
    if (!phone || !isValidKenyanPhone(phone)) {
      throw new ValidationError('Phone number must be a valid East African number (e.g. +254XXXXXXXXX)');
    }

    // Find user by phone
    const user = await UserModel.findByPhone(phone);
    if (!user) {
      // Don't reveal whether user exists
      return { success: true, message: 'If the phone number exists, a new code has been sent.' };
    }

    // Check if phone already verified
    if (user.phone_verified) {
      return { success: true, message: 'Phone already verified. Please log in.' };
    }

    // Invalidate previous OTPs
    await UserModel.invalidatePreviousOTPs(phone, 'signup');

    // Generate new OTP
    const otpCode = generateOTPCode();
    const expires_at = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await UserModel.saveOTP({
      phone,
      code: otpCode,
      type: 'signup',
      expires_at
    });

    // Log OTP in development
    if (process.env.NODE_ENV === 'development') {
      logger.info('DEV OTP for testing:', { phone, otpCode, expiresIn: OTP_EXPIRY_MINUTES * 60 });
    }

    // Send SMS
    await sendSMS(
      phone,
      `Your Olan Aluminium verification code is: ${otpCode}. Expires in ${OTP_EXPIRY_MINUTES} minutes.`
    );

    return {
      success: true,
      message: 'New verification code sent to your phone.',
      data: {
        phone,
        otp_expires_in_seconds: OTP_EXPIRY_MINUTES * 60
      }
    };
  },

  // ============================================================
  // Reset Password
  // ============================================================

  resetPassword: async (rawPhone, code, newPassword) => {
    const phone = normalizePhone(rawPhone);
    if (!phone) {
      throw new ValidationError('Invalid phone number format');
    }

    const otp = await UserModel.findValidOTP(phone, code, 'password_reset');
    if (!otp) {
      throw new ValidationError('Code is incorrect or expired');
    }

    const user = await UserModel.findByPhone(phone);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

    // Update password and mark OTP as used
    await UserModel.update(user.id, { password_hash });
    await UserModel.markOTPUsed(otp.id);

    // Revoke all existing refresh tokens (force re-login on all devices)
    await UserModel.revokeAllUserTokens(user.id);

    logger.info('Password reset completed', { userId: user.id });

    return { success: true, message: 'Password reset successfully' };
  }
};

export default AuthService;
