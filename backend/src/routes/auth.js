import express from 'express';
import AuthController from '../controllers/authController.js';

const router = express.Router();

/**
 * @route   POST /api/v1/auth/signup
 * @desc    Register a new client account
 * @access  Public
 */
router.post('/signup', AuthController.signup);

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Verify OTP code sent during signup
 * @access  Public
 */
router.post('/verify-otp', AuthController.verifyOTP);

/**
 * @route   POST /api/v1/auth/resend-otp
 * @desc    Resend verification OTP
 * @access  Public
 */
router.post('/resend-otp', AuthController.resendOTP);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user and return JWT tokens
 * @access  Public
 */
router.post('/login', AuthController.login);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Generate new access + refresh tokens
 * @access  Public
 */
router.post('/refresh-token', AuthController.refreshToken);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Revoke refresh token and end session
 * @access  Public
 */
router.post('/logout', AuthController.logout);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset OTP
 * @access  Public
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using OTP
 * @access  Public
 */
router.post('/reset-password', AuthController.resetPassword);

export { router as authRoutes };
export default router;
