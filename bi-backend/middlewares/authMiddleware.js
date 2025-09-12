
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../config/logger.js';


//  Required authentication middleware

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. User not found.'
        });
      }

      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated.'
        });
      }

      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department
      };

      next();
    } catch (error) {
      logger.error('Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

//  Optional authentication middleware

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return next(); // continue unauthenticated
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (user?.is_active) {
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          department: user.department
        };
      }

      next();
    } catch {
      next(); // proceed without user if token is invalid
    }
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    next(); // always proceed
  }
};

//  Token generation utility
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};
