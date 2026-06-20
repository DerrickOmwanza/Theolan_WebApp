import { z } from 'zod';

// ============================================================
// Phone Validation (Kenyan format)
// ============================================================

const phoneRegex = /^\+254[0-9]{9}$/;

export const normalizePhone = (phone) => {
  if (!phone) return '';
  let cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+254')) return cleaned;
  if (cleaned.startsWith('254') && cleaned.length === 12) return '+' + cleaned;
  if (cleaned.startsWith('0') && cleaned.length === 10) return '+254' + cleaned.substring(1);
  if (cleaned.startsWith('7') && cleaned.length === 9) return '+254' + cleaned;
  return cleaned;
};

// ============================================================
// Auth Schemas
// ============================================================

export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string()
    .transform(normalizePhone)
    .pipe(z.string().regex(phoneRegex, 'Must be a valid Kenyan number (+254XXXXXXXXX)')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one digit'),
  confirmPassword: z.string(),
  accept_sms_consent: z.boolean().refine((val) => val === true, {
    message: 'You must consent to receive SMS notifications',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  phone: z.string()
    .transform(normalizePhone)
    .pipe(z.string().regex(phoneRegex, 'Must be a valid Kenyan number (+254XXXXXXXXX)')),
  password: z.string().min(1, 'Password is required'),
});

export const otpSchema = z.object({
  code: z.string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^[0-9]+$/, 'OTP must contain only digits'),
});

export const forgotPasswordSchema = z.object({
  phone: z.string()
    .transform(normalizePhone)
    .pipe(z.string().regex(phoneRegex, 'Must be a valid Kenyan number (+254XXXXXXXXX)')),
});

export const resetPasswordSchema = z.object({
  phone: z.string()
    .transform(normalizePhone)
    .pipe(z.string().regex(phoneRegex, 'Must be a valid Kenyan number (+254XXXXXXXXX)')),
  code: z.string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^[0-9]+$/, 'OTP must contain only digits'),
  new_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one digit'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one digit'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});
