import authService from '../services/authService.js';
import logger from '../config/logger.js';

/**
 * Register a new user
 */
export const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    
    res.status(201).json(result);
  } catch (error) {
    logger.error('Registration controller error:', error);
    
    if (error.message.includes('already exists') || error.message.includes('already taken')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

/**
 * Login user
 */
export const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Login controller error:', error);
    
    res.status(401).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    
    const result = await authService.refreshToken(refreshToken);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Token refresh controller error:', error);
    
    res.status(401).json({
      success: false,
      message: error.message || 'Token refresh failed'
    });
  }
};

/**
 * Logout user
 */
export const logout = async (req, res) => {
  try {
    const result = await authService.logout(req.user.id);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Logout controller error:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Logout failed'
    });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req, res) => {
  try {
    const result = await authService.getUserProfile(req.user.id);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Get profile controller error:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get profile'
    });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const result = await authService.updateUserProfile(req.user.id, req.body);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Update profile controller error:', error);
    
    if (error.message.includes('already taken')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message || 'Profile update failed'
    });
  }
};

/**
 * Change user password
 */
export const changePassword = async (req, res) => {
  try {
    const result = await authService.changePassword(req.user.id, req.body);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Change password controller error:', error);
    
    res.status(400).json({
      success: false,
      message: error.message || 'Password change failed'
    });
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    const result = await authService.resetPassword(email);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Password reset request controller error:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Password reset request failed'
    });
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }
    
    const result = await authService.verifyResetPassword(token, newPassword);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Password reset controller error:', error);
    
    res.status(400).json({
      success: false,
      message: error.message || 'Password reset failed'
    });
  }
};

/**
 * Verify email (placeholder for future implementation)
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    // TODO: Implement email verification logic
    res.status(200).json({
      success: true,
      message: 'Email verification not implemented yet'
    });
  } catch (error) {
    logger.error('Email verification controller error:', error);
    
    res.status(400).json({
      success: false,
      message: error.message || 'Email verification failed'
    });
  }
};

/**
 * Get user statistics (admin only)
 */
export const getUserStats = async (req, res) => {
  try {
    // TODO: Implement user statistics
    res.status(200).json({
      success: true,
      message: 'User statistics not implemented yet',
      data: {
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisMonth: 0
      }
    });
  } catch (error) {
    logger.error('User stats controller error:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user statistics'
    });
  }
};
