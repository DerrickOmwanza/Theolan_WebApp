import logger from './logger.js';

// ============================================================
// Custom Error Classes
// ============================================================

/**
 * Base application error with status code and error code.
 * All service-layer errors should extend this.
 */
export class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMITED');
  }
}

// ============================================================
// Async Handler Wrapper
// ============================================================

/**
 * Wraps async route handlers to catch rejected promises
 * and pass them to the error handling middleware.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ============================================================
// Global Error Handler Middleware
// ============================================================

/**
 * Centralized error handler — must be registered last in the middleware stack.
 * Maps error types to HTTP status codes and returns standardized JSON responses.
 */
export const errorHandler = (err, req, res, _next) => {
  // Determine status code and error code
  let statusCode = err.statusCode || err.status || 500;
  let errorCode = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred';
  let details = err.details || null;

  // Handle Joi validation errors
  if (err.isJoi && err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = err.details?.[0]?.message || err.message;
    details = err.details?.map((d) => ({
      field: d.context?.key,
      issue: d.message
    }));
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Invalid request data';
    details = err.errors?.map((e) => ({
      field: e.path.join('.'),
      issue: e.message
    }));
  }

  // Handle PostgreSQL unique violation
  if (err.code === '23505') {
    statusCode = 409;
    errorCode = 'CONFLICT';
    message = 'Resource already exists';
    details = { constraint: err.constraint };
  }

  // Handle PostgreSQL foreign key violation
  if (err.code === '23503') {
    statusCode = 400;
    errorCode = 'FOREIGN_KEY_VIOLATION';
    message = 'Invalid reference to related resource';
    details = { constraint: err.constraint };
  }

  // Handle PostgreSQL not-null violation
  if (err.code === '23502') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Required field is missing';
    details = { column: err.column };
  }

  // Log the error
  const logMeta = {
    method: req.method,
    path: req.originalUrl || req.path,
    status: statusCode,
    errorCode,
    ...(req.user && { userId: req.user.id })
  };

  if (statusCode >= 500) {
    logger.error(`[${errorCode}] ${message}`, { ...logMeta, stack: err.stack });
  } else {
    logger.warn(`[${errorCode}] ${message}`, logMeta);
  }

  // Build response
  const response = {
    success: false,
    error: errorCode,
    message
  };

  if (details) {
    response.details = details;
  }

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
