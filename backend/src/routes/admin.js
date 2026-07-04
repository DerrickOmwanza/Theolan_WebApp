import express from 'express';
import AdminController from '../controllers/adminController.js';

const router = express.Router();

/**
 * @route   POST /api/v1/admin/setup
 * @desc    One-time setup endpoint to create admin account
 * @access  Public (protected by admin_token)
 *
 * USAGE:
 * POST https://olan-backend-alsj.onrender.com/api/v1/admin/setup
 * Headers: { "Content-Type": "application/json" }
 * Body: {
 *   "phone": "+254713211010",
 *   "name": "OlanAdmin",
 *   "email": "vaddydjones@gmail.com",
 *   "password": "YourSecurePassword123",
 *   "admin_token": "setup-admin-secure-token-2024"
 * }
 */
router.post('/setup', AdminController.setupAdmin);

export default router;
