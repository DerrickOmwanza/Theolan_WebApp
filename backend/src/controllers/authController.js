import Joi from 'joi';
import AuthService from '../services/authService.js';
import { asyncHandler, ValidationError } from '../middlewares/errorHandler.js';

// ============================================================
// Validation Schemas (Joi)
// ============================================================

const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters'
  }),
  phone: Joi.string().trim().required().messages({ 'string.empty': 'Phone number is required' }),
  email: Joi.string().trim().email().allow(null, '').optional(),
  password: Joi.string()
    .required()
    .min(8)
    .pattern(/[A-Z]/, 'uppercase letter')
    .pattern(/[a-z]/, 'lowercase letter')
    .pattern(/[0-9]/, 'digit')
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.name': 'Password must contain at least one {#name}'
    }),
  accept_sms_consent: Joi.boolean()
    .required()
    .messages({ 'any.required': 'SMS consent is required' })
});

const verifyOtpSchema = Joi.object({
  phone: Joi.string().trim().required(),
  code: Joi.string()
    .trim()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({ 'string.length': 'OTP code must be exactly 6 digits' })
});

const loginSchema = Joi.object({
  phone: Joi.string().trim().required(),
  password: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
  phone: Joi.string().trim().required()
});

const resetPasswordSchema = Joi.object({
  phone: Joi.string().trim().required(),
  code: Joi.string()
    .trim()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required(),
  new_password: Joi.string()
    .required()
    .min(8)
    .pattern(/[A-Z]/, 'uppercase letter')
    .pattern(/[a-z]/, 'lowercase letter')
    .pattern(/[0-9]/, 'digit')
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.name': 'Password must contain at least one {#name}'
    })
});

const resendOTPSchema = Joi.object({
  phone: Joi.string().trim().required().messages({ 'string.empty': 'Phone number is required' })
});

/**
 * Validate request body against a Joi schema.
 * Throws ValidationError with field details on failure.
 */
const validate = (schema, body) => {
  const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
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
// Auth Controller
// ============================================================

const AuthController = {
  /**
   * POST /api/v1/auth/signup
   * Register a new client account.
   */
  signup: asyncHandler(async (req, res) => {
    const data = validate(signupSchema, req.body);
    const result = await AuthService.signup(data);
    res.status(201).json(result);
  }),

  /**
   * POST /api/v1/auth/verify-otp
   * Verify OTP code sent during signup.
   */
  verifyOTP: asyncHandler(async (req, res) => {
    const { phone, code } = validate(verifyOtpSchema, req.body);
    const result = await AuthService.verifyOTP(phone, code);
    res.status(200).json(result);
  }),

  /**
   * POST /api/v1/auth/login
   * Authenticate user and return JWT tokens.
   */
  login: asyncHandler(async (req, res) => {
    const { phone, password } = validate(loginSchema, req.body);
    const result = await AuthService.login(phone, password);
    res.status(200).json(result);
  }),

  /**
   * POST /api/v1/auth/refresh-token
   * Generate new access token using refresh token.
   */
  refreshToken: asyncHandler(async (req, res) => {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      throw new ValidationError('refresh_token is required');
    }
    const result = await AuthService.refreshAccessToken(refresh_token);
    res.status(200).json(result);
  }),

  /**
   * POST /api/v1/auth/logout
   * Revoke refresh token and end session.
   */
  logout: asyncHandler(async (req, res) => {
    const { refresh_token } = req.body;
    const result = await AuthService.logout(refresh_token);
    res.status(200).json(result);
  }),

  /**
   * POST /api/v1/auth/forgot-password
   * Request password reset OTP.
   */
  forgotPassword: asyncHandler(async (req, res) => {
    const { phone } = validate(forgotPasswordSchema, req.body);
    const result = await AuthService.forgotPassword(phone);
    res.status(200).json(result);
  }),

  /**
   * POST /api/v1/auth/resend-otp
   * Resend verification OTP.
   */
  resendOTP: asyncHandler(async (req, res) => {
    const { phone } = validate(resendOTPSchema, req.body);
    const result = await AuthService.resendOTP(phone);
    res.status(200).json(result);
  }),

  /**
   * POST /api/v1/auth/reset-password
   * Reset password using OTP.
   */
  resetPassword: asyncHandler(async (req, res) => {
    const { phone, code, new_password } = validate(resetPasswordSchema, req.body);
    const result = await AuthService.resetPassword(phone, code, new_password);
    res.status(200).json(result);
  })
};

export default AuthController;
