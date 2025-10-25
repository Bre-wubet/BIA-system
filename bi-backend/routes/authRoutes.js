import express from 'express';
import multer from 'multer';
import * as authController from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${uniqueSuffix}.${file.originalname.split('.').pop()}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// ----------------- Public Routes -----------------

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  validateRequest({
    username: { type: 'string', required: true, minLength: 3, maxLength: 50 },
    email: { type: 'string', required: true, pattern: 'email' },
    password: { type: 'string', required: true, minLength: 8, maxLength: 128 },
    first_name: { type: 'string', required: false, maxLength: 100 },
    last_name: { type: 'string', required: false, maxLength: 100 },
    role: { type: 'string', required: false, enum: ['user', 'analyst', 'manager', 'admin'] },
    department: { type: 'string', required: false, maxLength: 100 }
  }),
  authController.register
);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post(
  '/login',
  validateRequest({
    email: { type: 'string', required: true, pattern: 'email' },
    password: { type: 'string', required: true, minLength: 1 }
  }),
  authController.login
);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post(
  '/refresh',
  validateRequest({
    refreshToken: { type: 'string', required: true, minLength: 1 }
  }),
  authController.refreshToken
);

/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post(
  '/forgot-password',
  validateRequest({
    email: { type: 'string', required: true, pattern: 'email' }
  }),
  authController.requestPasswordReset
);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post(
  '/reset-password',
  validateRequest({
    token: { type: 'string', required: true, minLength: 1 },
    newPassword: { type: 'string', required: true, minLength: 8, maxLength: 128 }
  }),
  authController.resetPassword
);

/**
 * @route GET /api/auth/verify-email/:token
 * @desc Verify email address
 * @access Public
 */
router.get('/verify-email/:token', authController.verifyEmail);

// ----------------- Protected Routes -----------------

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * @route GET /api/auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', authMiddleware, authController.getProfile);

/**
 * @route PUT /api/auth/profile
 * @desc Update user profile
 * @access Private
 */
router.put(
  '/profile',
  authMiddleware,
  validateRequest({
    first_name: { type: 'string', required: false, maxLength: 100 },
    last_name: { type: 'string', required: false, maxLength: 100 },
    email: { type: 'string', required: false, pattern: 'email' },
    department: { type: 'string', required: false, maxLength: 100 }
  }),
  authController.updateProfile
);

/**
 * @route POST /api/auth/upload-avatar
 * @desc Upload user avatar
 * @access Private
 */
router.post(
  '/upload-avatar',
  authMiddleware,
  upload.single('avatar'),
  authController.uploadAvatar
);

/**
 * @route PUT /api/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.put(
  '/change-password',
  authMiddleware,
  validateRequest({
    currentPassword: { type: 'string', required: true, minLength: 1 },
    newPassword: { type: 'string', required: true, minLength: 8, maxLength: 128 }
  }),
  authController.changePassword
);

// ----------------- Admin Routes -----------------

/**
 * @route GET /api/auth/stats
 * @desc Get user statistics
 * @access Admin
 */
router.get('/stats', authMiddleware, requireRole('admin'), authController.getUserStats);

export default router;
