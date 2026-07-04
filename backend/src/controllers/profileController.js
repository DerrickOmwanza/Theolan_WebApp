import Joi from 'joi';
import ProfileService from '../services/profileService.js';
import { asyncHandler, ValidationError } from '../middlewares/errorHandler.js';

// Validation schemas
const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters'
  }),
  email: Joi.string().email().trim().max(255).required().messages({
    'string.email': 'Must be a valid email'
  }),
  notification_preference: Joi.string().valid('sms', 'email').required().messages({
    'any.only': 'Notification preference must be sms or email'
  })
});

const changePasswordSchema = Joi.object({
  current_password: Joi.string()
    .required()
    .messages({ 'string.empty': 'Current password is required' }),
  new_password: Joi.string()
    .required()
    .min(8)
    .pattern(/[A-Z]/, 'uppercase letter')
    .pattern(/[a-z]/, 'lowercase letter')
    .pattern(/[0-9]/, 'digit')
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.name': 'Password must contain at least one {#name}'
    }),
  confirm_password: Joi.string().valid(Joi.ref('new_password')).required().messages({
    'any.only': 'Passwords do not match'
  })
});

/**
 * Validate request body against a Joi schema.
 */
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

const ProfileController = {
  /**
   * GET /api/v1/profile/me
   */
  getProfile: asyncHandler(async (req, res) => {
    const result = await ProfileService.getProfile(req.user.id);
    res.status(200).json(result);
  }),

  /**
   * PATCH /api/v1/profile/me
   */
  updateProfile: asyncHandler(async (req, res) => {
    const updates = validate(updateProfileSchema, req.body);
    const result = await ProfileService.updateProfile(req.user.id, updates);
    res.status(200).json(result);
  }),

  /**
   * POST /api/v1/profile/change-password
   */
  changePassword: asyncHandler(async (req, res) => {
    const { current_password, new_password, confirm_password } = validate(
      changePasswordSchema,
      req.body
    );
    const result = await ProfileService.changePassword(req.user.id, current_password, new_password);
    res.status(200).json(result);
  })
};

export default ProfileController;
