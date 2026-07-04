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

    // Simple token check - in production, use a database-stored admin token
    const ADMIN_SETUP_TOKEN = process.env.ADMIN_SETUP_TOKEN || 'setup-admin-secure-token-2024';

    if (admin_token !== ADMIN_SETUP_TOKEN) {
      throw new ValidationError('Invalid admin setup token');
    }

    // Check if admin already exists
    const existingAdmin = await UserModel.findByPhone(phone);
    if (existingAdmin) {
      // Update existing unverified user to admin
      if (!existingAdmin.phone_verified) {
        const password_hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        await UserModel.update(existingAdmin.id, {
          name,
          email,
          password_hash,
          role: 'admin',
          phone_verified: true,
          phone_verified_at: new Date(),
          is_active: true
        });

        logger.info('Admin account converted', { userId: existingAdmin.id, phone });

        return res.status(200).json({
          success: true,
          message: 'Admin account updated successfully',
          data: {
            name,
            phone,
            email,
            role: 'admin'
          }
        });
      }

      throw new ConflictError('User already exists and is verified');
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
