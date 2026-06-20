import jwt from 'jsonwebtoken';

// ============================================================
// JWT Configuration — Fail fast if secrets are not configured
// ============================================================

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    'FATAL: JWT_SECRET must be set in environment and be at least 32 characters long. ' +
    'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
  );
}

if (!JWT_REFRESH_SECRET || JWT_REFRESH_SECRET.length < 32) {
  throw new Error(
    'FATAL: JWT_REFRESH_SECRET must be set in environment and be at least 32 characters long.'
  );
}

if (JWT_SECRET === JWT_REFRESH_SECRET) {
  throw new Error('FATAL: JWT_SECRET and JWT_REFRESH_SECRET must be different values.');
}

const JWT_EXPIRE = process.env.JWT_EXPIRE || '15m';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';

// ============================================================
// Phone Number Normalization (Kenyan format)
// ============================================================

/**
 * Normalize phone number to +254XXXXXXXXX format.
 * Handles: 0712345678, 254712345678, +254712345678, +254 712 345 678
 *
 * @param {string} phone - Raw phone input
 * @returns {string|null} - Normalized phone or null if invalid
 */
export const normalizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return null;

  // Strip all non-digit characters except leading +
  let cleaned = phone.replace(/[\s\-()]/g, '');

  // Handle different formats
  if (cleaned.startsWith('+254')) {
    // Already international: +254712345678
    cleaned = cleaned.substring(1); // Remove + for processing
  }

  if (cleaned.startsWith('254') && cleaned.length === 12) {
    // 254712345678 → +254712345678
    return '+' + cleaned;
  }

  if (cleaned.startsWith('0') && cleaned.length === 10) {
    // 0712345678 → +254712345678
    return '+254' + cleaned.substring(1);
  }

  if (cleaned.startsWith('7') && cleaned.length === 9) {
    // 712345678 → +254712345678
    return '+254' + cleaned;
  }

  // If it starts with + and has 12 digits total (+254XXXXXXXXX)
  if (cleaned.startsWith('+') && cleaned.length === 13) {
    return cleaned;
  }

  return null; // Invalid format
};

/**
 * Validate Kenyan phone number format
 * @param {string} phone - Normalized phone (+254XXXXXXXXX)
 * @returns {boolean}
 */
export const isValidKenyanPhone = (phone) => {
  return /^\+254[17][0-9]{8}$/.test(phone);
};

// ============================================================
// JWT Token Generation
// ============================================================

/**
 * Generate Access Token (short-lived, 15 min default)
 * Payload: { sub, phone, name, role } per API contract
 *
 * @param {Object} user - User object with id, phone, name, role
 * @returns {string} - JWT Access Token
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRE,
      issuer: 'theolan-aluminium-api',
      audience: 'theolan-aluminium-client'
    }
  );
};

/**
 * Generate Refresh Token (long-lived, 7 days default)
 * Payload: { sub } only — minimal data for security
 *
 * @param {Object} user - User object with id
 * @returns {string} - JWT Refresh Token
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { sub: user.id },
    JWT_REFRESH_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRE,
      issuer: 'theolan-aluminium-api'
    }
  );
};

// ============================================================
// JWT Token Verification
// ============================================================

/**
 * Verify Access Token
 * @param {string} token - JWT Access Token
 * @returns {Object|null} - Decoded payload or null
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'theolan-aluminium-api',
      audience: 'theolan-aluminium-client'
    });
  } catch {
    return null;
  }
};

/**
 * Verify Refresh Token
 * @param {string} token - JWT Refresh Token
 * @returns {Object|null} - Decoded payload or null
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'theolan-aluminium-api'
    });
  } catch {
    return null;
  }
};
