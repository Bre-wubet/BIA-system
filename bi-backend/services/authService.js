import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../config/logger.js';

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET;
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
    this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  }

  /**
   * Register a new user
   */
  async register(userData) {
    try {
      const { username, email, password, role = 'user', department, first_name, last_name } = userData;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        throw new Error('Username already taken');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Create user
      const userDataToSave = {
        username,
        email,
        password: hashedPassword,
        role,
        department,
        first_name,
        last_name,
        is_active: true,
        email_verified: false,
        last_login: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      const user = await User.createUser(userDataToSave);

      // Generate tokens
      const tokens = await this.generateTokens(user.id);

      logger.info(`New user registered: ${username} (${email})`);

      return {
        success: true,
        message: 'User registered successfully',
        data: {
          user: this.sanitizeUser(user),
          tokens
        }
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(credentials) {
    try {
      const { email, password } = credentials;

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.is_active) {
        throw new Error('Account is deactivated. Please contact administrator.');
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await User.updateLastLogin(user.id);

      // Generate tokens
      const tokens = await this.generateTokens(user.id);

      logger.info(`User logged in: ${user.username} (${user.email})`);

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: this.sanitizeUser(user),
          tokens
        }
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtSecret);
      const user = await User.findById(decoded.userId);

      if (!user || !user.is_active) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user.id);

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens
        }
      };
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Logout user (invalidate tokens)
   */
  async logout(userId) {
    try {
      // In a production environment, you might want to blacklist tokens
      // For now, we'll just log the logout
      logger.info(`User logged out: ${userId}`);
      
      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId, passwordData) {
    try {
      const { currentPassword, newPassword } = passwordData;

      // Get user
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await this.verifyPassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(newPassword);

      // Update password
      await User.updatePassword(userId, hashedNewPassword);

      logger.info(`Password changed for user: ${user.username}`);

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      logger.error('Password change error:', error);
      throw error;
    }
  }

  /**
   * Reset password (for forgot password flow)
   */
  async resetPassword(email) {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return {
          success: true,
          message: 'If the email exists, a password reset link has been sent'
        };
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password_reset' },
        this.jwtSecret,
        { expiresIn: '1h' }
      );

      // In production, you would send this token via email
      // For now, we'll just log it
      logger.info(`Password reset token for ${email}: ${resetToken}`);

      return {
        success: true,
        message: 'If the email exists, a password reset link has been sent',
        data: {
          resetToken // Remove this in production
        }
      };
    } catch (error) {
      logger.error('Password reset error:', error);
      throw error;
    }
  }

  /**
   * Verify password reset token and set new password
   */
  async verifyResetPassword(resetToken, newPassword) {
    try {
      const decoded = jwt.verify(resetToken, this.jwtSecret);
      
      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid reset token');
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('Invalid reset token');
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password
      await User.updatePassword(user.id, hashedPassword);

      logger.info(`Password reset completed for user: ${user.username}`);

      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch (error) {
      logger.error('Password reset verification error:', error);
      throw new Error('Invalid or expired reset token');
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        data: {
          user: this.sanitizeUser(user)
        }
      };
    } catch (error) {
      logger.error('Get profile error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, updateData) {
    try {
      const allowedFields = [
        'first_name', 
        'last_name', 
        'department', 
        'email', 
        'avatar',
        'phone',
        'address',
        'bio',
        'timezone',
        'language',
        'notifications',
        'privacy',
        'preferences'
      ];
      const filteredData = {};

      // Only allow certain fields to be updated
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      }

      // If email is being updated, check if it's already taken
      if (filteredData.email) {
        const existingUser = await User.findByEmail(filteredData.email);
        if (existingUser && existingUser.id !== userId) {
          throw new Error('Email already taken');
        }
      }

      // updated_at is automatically handled by User.update()

      const updatedUser = await User.update(userId, filteredData);

      return {
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: this.sanitizeUser(updatedUser)
        }
      };
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Hash password
   */
  async hashPassword(password) {
    return await bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Verify password
   */
  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate access and refresh tokens
   */
  async generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId, type: 'access' },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      this.jwtSecret,
      { expiresIn: this.refreshTokenExpiresIn }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.jwtExpiresIn
    };
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(userId, file) {
    try {
      // The file has already been saved by multer middleware
      // We just need to update the user's avatar field with the file path
      const avatarUrl = `/uploads/avatars/${file.filename}`;
      
      // Update user's avatar field
      await User.update(userId, { avatar: avatarUrl });
      
      logger.info(`Avatar uploaded for user: ${userId}, file: ${file.filename}`);
      
      return {
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          avatarUrl
        }
      };
    } catch (error) {
      logger.error('Avatar upload error:', error);
      throw error;
    }
  }

  /**
   * Sanitize user data (remove sensitive information)
   */
  sanitizeUser(user) {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      const user = await User.findById(decoded.userId);
      if (!user || !user.is_active) {
        throw new Error('User not found or inactive');
      }

      return {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

export default new AuthService();
