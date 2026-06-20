import AuthService from '../services/authService.js';
import Joi from 'joi';

/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */
const AuthController = {
  /**
   * Signup
   */
  signup: async (req, res, next) => {
    try {
      const schema = Joi.object({
        name: Joi.string().required().max(100),
        phone: Joi.string().required().pattern(/^[0-9+]{10,15}$/),
        email: Joi.string().email().allow(null, ''),
        password: Joi.string().required().min(6)
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ success: false, error: error.details[0].message });
      }

      const result = await AuthService.signup(value);
      res.status(201).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verify OTP
   */
  verifyOTP: async (req, res, next) => {
    try {
      const schema = Joi.object({
        phone: Joi.string().required(),
        code: Joi.string().required().length(6)
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ success: false, error: error.details[0].message });
      }

      const result = await AuthService.verifyOTP(value.phone, value.code);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Login
   */
  login: async (req, res, next) => {
    try {
      const schema = Joi.object({
        phone: Joi.string().required(),
        password: Joi.string().required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ success: false, error: error.details[0].message });
      }

      const result = await AuthService.login(value.phone, value.password);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Refresh Token
   */
  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ success: false, error: 'Refresh token is required' });
      }

      const accessToken = await AuthService.refreshAccessToken(refreshToken);
      res.status(200).json({ success: true, accessToken });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Logout
   */
  logout: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }
};

export default AuthController;
