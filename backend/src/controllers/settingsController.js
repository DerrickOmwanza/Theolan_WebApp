import Joi from 'joi';
import SettingsModel from '../models/settingsModel.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { validate } from '../utils/validate.js';

// ============================================================
// Validation Schemas
// ============================================================

const SETTABLE_KEYS = [
  'mpesa_shortcode',
  'mpesa_callback_url'
];

const settingsUpdateSchema = Joi.object({
  mpesa_shortcode: Joi.string()
    .trim()
    .max(20)
    .allow('')
    .optional()
    .messages({ 'string.max': 'Shortcode must be at most 20 characters' }),
  
  mpesa_callback_url: Joi.string()
    .trim()
    .max(500)
    .custom((value, helpers) => {
      // Allow empty string or a valid URL
      if (value === '') return value;
      // If not empty, must be a valid URL
      try {
        new URL(value);
        return value;
      } catch {
        return helpers.error('string.uri');
      }
    })
    .optional()
    .messages({ 'string.uri': 'Must be a valid URL' })
})
  .custom((obj, helpers) => {
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      throw new Error('At least one setting must be provided');
    }
    const invalidKeys = keys.filter(k => !SETTABLE_KEYS.includes(k));
    if (invalidKeys.length > 0) {
      throw new Error(`Invalid setting keys: ${invalidKeys.join(', ')}`);
    }
    return obj;
  });

// ============================================================
// Settings Controller
// ============================================================

const SettingsController = {
  /**
   * GET /api/v1/admin/settings
   * Get all settings as key/value pairs.
   * @access Private (admin only)
   */
  getSettings: asyncHandler(async (req, res) => {
    const result = await SettingsModel.getAll();
    const settings = {};
    result.forEach(({ key, value }) => {
      settings[key] = value;
    });
    res.status(200).json({
      success: true,
      data: settings
    });
  }),

  /**
   * PUT /api/v1/admin/settings
   * Batch update settings.
   * @access Private (admin only)
   */
  updateSettings: asyncHandler(async (req, res) => {
    const updates = validate(settingsUpdateSchema, req.body);
    
    const updatesArray = Object.entries(updates).map(([key, value]) =>
      SettingsModel.set(key, value)
    );
    await Promise.all(updatesArray);
    
    const result = await SettingsModel.getAll();
    const settings = {};
    result.forEach(({ key, value }) => {
      settings[key] = value;
    });
    
    res.status(200).json({
      success: true,
      data: settings
    });
  })
};

export default SettingsController;