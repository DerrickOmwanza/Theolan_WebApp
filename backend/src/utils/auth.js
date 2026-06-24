import jwt from 'jsonwebtoken';

// ============================================================
// JWT Configuration — Fail fast if secrets are not configured
// ============================================================

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    'FATAL: JWT_SECRET must be set in environment and be at least 32 characters long. ' +
      "Generate one with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
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
// Phone Number Normalization (East African format)
// ============================================================

const PHONE_CODES = [
  '+254',
  '+255',
  '+256',
  '+250',
  '+257',
  '+211',
  '+251',
  '+252',
  '+253',
  '+291',
  '+261',
  '+258',
  '+260',
  '+263',
  '+265',
  '+230',
  '+269',
  '+243',
  '+248'
];

const EAST_AFRICAN_PHONE_REGEX =
  /^\+(254[17]\d{8}|255[67]\d{8}|256[7]\d{8}|250[7]\d{8}|257[7]\d{7}|211[9]\d{8}|251[97]\d{8}|252[97]\d{8}|253[7]\d{7}|291[178]\d{6}|261[3]\d{8}|258[8]\d{8}|260[97]\d{8}|263[7]\d{8}|265[17]\d{8}|230[5]\d{6}|269[3]\d{6}|243[89]\d{8}|248[2]\d{6})$/;

/**
 * Normalize phone number to +{code}XXXXXXXXX format.
 * Handles: 0712345678, 254712345678, +254712345678, +254 712 345 678
 * Also handles all East African country codes.
 *
 * @param {string} phone - Raw phone input
 * @returns {string|null} - Normalized phone or null if invalid
 */
export const normalizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return null;

  // Strip all non-digit characters except leading +
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // If already starts with +{code}, return as-is
  for (const code of PHONE_CODES) {
    if (cleaned.startsWith(code)) {
      return cleaned;
    }
  }

  // Handle Kenya-specific legacy formats (backward compatibility)
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    return '+' + cleaned;
  }
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return '+254' + cleaned.substring(1);
  }
  if (cleaned.startsWith('7') && cleaned.length === 9) {
    return '+254' + cleaned;
  }

  return null; // Invalid format
};

/**
 * Validate East African phone number format
 * @param {string} phone - Normalized phone (+{code}XXXXXXXXX)
 * @returns {boolean}
 */
export const isValidKenyanPhone = (phone) => {
  return EAST_AFRICAN_PHONE_REGEX.test(phone);
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
  return jwt.sign({ sub: user.id }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE,
    issuer: 'theolan-aluminium-api'
  });
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
