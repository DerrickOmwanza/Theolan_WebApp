import bcrypt from 'bcryptjs';
import UserModel from '../models/userModel.js';
import { ValidationError } from '../middlewares/errorHandler.js';
import logger from '../middlewares/logger.js';

const BCRYPT_SALT_ROUNDS = 10;

const ProfileService = {
  /**
   * GET /api/v1/profile/me
   * Get current user profile
   */
  getProfile: async (userId) => {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ValidationError('User not found');
    }

    return {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        notification_preference: user.notification_preference,
        phone_verified: user.phone_verified,
        created_at: user.created_at
      }
    };
  },

  /**
   * UPDATE /api/v1/profile/me
   * Update user profile information
   */
  updateProfile: async (userId, updates) => {
    const { name, email, notification_preference } = updates;

    // Build update object
    const updateData = {};

    if (name) {
      updateData.name = name;
    }

    if (email) {
      // Check if email is already used by another user
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        throw new ValidationError('Email already in use');
      }
      updateData.email = email;
    }

    if (notification_preference) {
      updateData.notification_preference = notification_preference;
    }

    const user = await UserModel.update(userId, updateData);

    logger.info('Profile updated', { userId });

    return {
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        notification_preference: user.notification_preference
      }
    };
  },

  /**
   * PASSWORD CHANGE /api/v1/profile/change-password
   * Change user password (requires current password)
   */
  changePassword: async (userId, currentPassword, newPassword) => {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ValidationError('User not found');
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      throw new ValidationError('Current password is incorrect');
    }

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

    // Update password
    await UserModel.update(userId, { password_hash });

    // Revoke all refresh tokens (force re-login on all devices)
    await UserModel.revokeAllUserTokens(userId);

    logger.info('Password changed', { userId });

    return {
      success: true,
      message: 'Password changed successfully. Please log in again.'
    };
  }
};

export default ProfileService;
