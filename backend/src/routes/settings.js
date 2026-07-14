import express from 'express';
import SettingsController from '../controllers/settingsController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * Settings routes - Admin only
 * GET all settings, PUT batch update settings
 */

// Apply protect + authorize middleware to all routes
router.use(protect);

/**
 * @route   GET /api/v1/admin/settings
 * @desc    Get all settings as key/value pairs
 * @access  Private (admin only)
 */
router.get('/', authorize('admin'), SettingsController.getSettings);

/**
 * @route   PUT /api/v1/admin/settings
 * @desc    Batch update settings
 * @access  Private (admin only)
 */
router.put('/', authorize('admin'), SettingsController.updateSettings);

export default router;