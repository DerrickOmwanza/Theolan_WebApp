import { verifyAccessToken } from '../utils/auth.js';
import UserModel from '../models/userModel.js';
import { AuthenticationError } from './errorHandler.js';

/**
 * Authentication Middleware
 * Extracts and verifies JWT Bearer token from the Authorization header.
 * Attaches the authenticated user object to req.user.
 */
export const protect = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Not authorized — no token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AuthenticationError('Not authorized — malformed token');
    }

    // Verify JWT signature and expiration
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      throw new AuthenticationError('Token is invalid or expired');
    }

    // Look up user in database (token payload uses 'sub' per JWT spec)
    const user = await UserModel.findById(decoded.sub);
    if (!user || !user.is_active) {
      throw new AuthenticationError('User not found or account deactivated');
    }

    // Attach user to request for downstream handlers
    req.user = user;
    next();
  } catch (error) {
    // If it's already an AppError, pass through; otherwise wrap it
    if (error instanceof AuthenticationError) {
      return res.status(401).json({
        success: false,
        error: error.code,
        message: error.message
      });
    }
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Not authorized to access this route'
    });
  }
};

/**
 * Authorization Middleware
 * Restricts access to specific user roles.
 * Must be used AFTER the `protect` middleware.
 *
 * Usage: authorize('admin') or authorize('admin', 'technician')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

/**
 * Combined auth middleware for role-based access control
 * Usage: authMiddleware(['admin']) - single array parameter
 */
export const authMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    protect(req, res, (err) => {
      if (err) return next(err);
      authorize(...allowedRoles)(req, res, next);
    });
  };
};

export default { protect, authorize, authMiddleware };
