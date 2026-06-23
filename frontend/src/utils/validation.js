import { z } from "zod";

// ============================================================
// Phone Validation (East African countries)
// ============================================================

const PHONE_CODES = [
  "+254", "+255", "+256", "+250", "+257", "+211",
  "+251", "+252", "+253", "+291", "+261", "+258",
  "+260", "+263", "+265", "+230", "+269", "+243", "+248",
];

const phoneRegex = new RegExp(
  "^(?:" +
    "\\+254[17]\\d{8}|" +   // Kenya (9 digits)
    "\\+255[67]\\d{8}|" +   // Tanzania (9 digits)
    "\\+256[7]\\d{8}|" +    // Uganda (9 digits)
    "\\+250[7]\\d{8}|" +    // Rwanda (9 digits)
    "\\+257[7]\\d{7}|" +    // Burundi (8 digits)
    "\\+211[9]\\d{8}|" +    // South Sudan (9 digits)
    "\\+251[97]\\d{8}|" +   // Ethiopia (9 digits)
    "\\+252[97]\\d{8}|" +   // Somalia (9 digits)
    "\\+253[7]\\d{7}|" +    // Djibouti (8 digits)
    "\\+291[178]\\d{6}|" +  // Eritrea (7 digits)
    "\\+261[3]\\d{8}|" +    // Madagascar (9 digits)
    "\\+258[8]\\d{8}|" +    // Mozambique (9 digits)
    "\\+260[97]\\d{8}|" +   // Zambia (9 digits)
    "\\+263[7]\\d{8}|" +    // Zimbabwe (9 digits)
    "\\+265[17]\\d{8}|" +   // Malawi (9 digits)
    "\\+230[5]\\d{6}|" +    // Mauritius (7 digits)
    "\\+269[3]\\d{6}|" +    // Comoros (7 digits)
    "\\+243[89]\\d{8}|" +   // DRC (9 digits)
    "\\+248[2]\\d{6}" +     // Seychelles (7 digits)
    ")$"
);

export const normalizePhone = (phone) => {
  if (!phone) return "";
  const cleaned = phone.replace(/[\s\-()]/g, "");

  // If already starts with +{code}, return as-is
  for (const code of PHONE_CODES) {
    if (cleaned.startsWith(code)) {
      return cleaned;
    }
  }

  // Handle Kenya-specific legacy formats (backward compatibility)
  if (cleaned.startsWith("254") && cleaned.length === 12) {
    return "+" + cleaned;
  }
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return "+254" + cleaned.substring(1);
  }
  if (cleaned.startsWith("7") && cleaned.length === 9) {
    return "+254" + cleaned;
  }

  return cleaned;
};

// ============================================================
// Auth Schemas
// ============================================================

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100),
    phone: z
      .string()
      .transform(normalizePhone)
      .pipe(
        z
          .string()
          .regex(phoneRegex, "Must be a valid East African number (e.g. +254XXXXXXXXX)"),
      ),
    email: z
      .string()
      .email("Invalid email address")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one digit"),
    confirmPassword: z.string(),
    accept_sms_consent: z.boolean().refine((val) => val === true, {
      message: "You must consent to receive SMS notifications",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  phone: z
    .string()
    .transform(normalizePhone)
    .pipe(
      z
        .string()
        .regex(phoneRegex, "Must be a valid Kenyan number (+254XXXXXXXXX)"),
    ),
  password: z.string().min(1, "Password is required"),
});

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^[0-9]+$/, "OTP must contain only digits"),
});

export const forgotPasswordSchema = z.object({
  phone: z
    .string()
    .transform(normalizePhone)
    .pipe(
      z
        .string()
        .regex(phoneRegex, "Must be a valid Kenyan number (+254XXXXXXXXX)"),
    ),
});

export const resetPasswordSchema = z
  .object({
    phone: z
      .string()
      .transform(normalizePhone)
      .pipe(
        z
          .string()
          .regex(phoneRegex, "Must be a valid East African number (e.g. +254XXXXXXXXX)"),
      ),
    code: z
      .string()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^[0-9]+$/, "OTP must contain only digits"),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one digit"),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one digit"),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });
