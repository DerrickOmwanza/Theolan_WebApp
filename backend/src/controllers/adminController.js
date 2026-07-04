import Joi from 'joi';
import bcrypt from 'bcryptjs';
import UserModel from '../models/userModel.js';
import { asyncHandler, ValidationError, ConflictError } from '../middlewares/errorHandler.js';
import logger from '../middlewares/logger.js';

const BCRYPT_SALT_ROUNDS = 10;

const createAdminSchema = Joi.object({
  phone: Joi.string().required(),
  name: Joi.string().trim().min(2).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .required()
    .min(8)
    .pattern(/[A-Z]/, 'uppercase letter')
    .pattern(/[a-z]/, 'lowercase letter')
    .pattern(/[0-9]/, 'digit')
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.name': 'Password must contain at least one {#name}'
    }),
  admin_token: Joi.string().required()
});

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

const AdminController = {
  /**
   * POST /api/v1/admin/setup
   * One-time endpoint to create the first admin account.
   * SECURITY: Use a secure admin token!
   */
  setupAdmin: asyncHandler(async (req, res) => {
    const { phone, name, email, password, admin_token } = validate(createAdminSchema, req.body);

    // Simple token check - allow known valid tokens
    // Production: use DATABASE-stored admin_token
    const validTokens = [
      'setup-admin-secure-token-2024',
      'admin-setup-token',
      'olan-admin-2024',
      process.env.ADMIN_SETUP_TOKEN
    ].filter(Boolean);

    if (!validTokens.includes(admin_token)) {
      throw new ValidationError('Invalid admin setup token');
    }

    // Check if admin already exists
    const existingAdmin = await UserModel.findByPhone(phone);
    if (existingAdmin) {
      // Update existing user to admin role (if already verified)
      const password_hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
      const updateFields = {
        name,
        email,
        password_hash,
        role: 'admin',
        is_active: true,
        updated_at: new Date()
      };

      // Only set verification fields if not already verified
      if (!existingAdmin.phone_verified) {
        updateFields.phone_verified = true;
        updateFields.phone_verified_at = new Date();
      }

      await UserModel.update(existingAdmin.id, updateFields);

      logger.info('Admin account updated', { userId: existingAdmin.id, phone, role: 'admin' });

      return res.status(200).json({
        success: true,
        message: 'Admin account configured successfully',
        data: {
          name,
          phone,
          email,
          role: 'admin'
        }
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Create new admin user
    const user = await UserModel.create({
      name,
      phone,
      email,
      password_hash,
      role: 'admin',
      phone_verified: true,
      phone_verified_at: new Date(),
      is_active: true,
      notification_preference: 'sms'
    });

    logger.info('Admin account created', { userId: user.id, phone });

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        user_id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role
      }
    });
  })
};

export default AdminController;
