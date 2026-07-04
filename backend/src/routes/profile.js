import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import ProfileController from '../controllers/profileController.js';

const router = express.Router();

/**
 * @route   GET /api/v1/profile/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', protect, ProfileController.getProfile);

/**
 * @route   PATCH /api/v1/profile/me
 * @desc    Update user profile
 * @access  Private
 */
router.patch('/me', protect, ProfileController.updateProfile);

/**
 * @route   POST /api/v1/profile/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', protect, ProfileController.changePassword);

export { router as profileRoutes };
export default router;
