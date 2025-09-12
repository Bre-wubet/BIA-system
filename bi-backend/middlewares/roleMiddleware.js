import logger from '../config/logger.js';

// Role-based access control middleware
export const requireRole = (roles) => (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Access denied for user ${req.user.username} (role: ${req.user.role}) to ${req.method} ${req.path}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  } catch (error) {
    logger.error('Role middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Department-based access control
export const requireDepartment = (departments) => (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const allowedDepartments = Array.isArray(departments) ? departments : [departments];

    if (!allowedDepartments.includes(req.user.department)) {
      logger.warn(`Access denied for user ${req.user.username} (department: ${req.user.department}) to ${req.method} ${req.path}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Department access required.'
      });
    }

    next();
  } catch (error) {
    logger.error('Department middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Admin only access
export const requireAdmin = (req, res, next) => requireRole('admin')(req, res, next);

// Manager or admin access
export const requireManager = (req, res, next) => requireRole(['admin', 'manager'])(req, res, next);

// Analytics team access
export const requireAnalyticsTeam = (req, res, next) =>
  requireRole(['admin', 'analyst', 'data_scientist'])(req, res, next);

// Sales team access
export const requireSalesTeam = (req, res, next) =>
  requireDepartment(['sales', 'marketing'])(req, res, next);

// Finance team access
export const requireFinanceTeam = (req, res, next) =>
  requireDepartment(['finance', 'accounting'])(req, res, next);

// HR team access
export const requireHRTeam = (req, res, next) =>
  requireDepartment(['hr', 'human_resources'])(req, res, next);

// Operations team access
export const requireOperationsTeam = (req, res, next) =>
  requireDepartment(['operations', 'logistics'])(req, res, next);

// Check if user owns the resource or is admin
export const requireOwnership = (resourceUserIdField = 'user_id') => (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

    if (resourceUserId && parseInt(resourceUserId, 10) === req.user.id) {
      return next();
    }

    logger.warn(`Access denied for user ${req.user.username} to resource owned by ${resourceUserId}`);
    return res.status(403).json({
      success: false,
      message: 'Access denied. Resource ownership required.'
    });
  } catch (error) {
    logger.error('Ownership middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Rate limiting for specific roles (simplified)
export const rateLimitByRole = (windowMs, maxRequests) => {
  const roleLimits = {
    admin: { windowMs, maxRequests: maxRequests * 2 },
    manager: { windowMs, maxRequests: maxRequests * 1.5 },
    analyst: { windowMs, maxRequests: maxRequests * 1.2 },
    user: { windowMs, maxRequests }
  };

  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.'
        });
      }

      const userRole = req.user.role || 'user';
      const limits = roleLimits[userRole] || roleLimits.user;

      // Placeholder — integrate with express-rate-limit/Redis in production
      next();
    } catch (error) {
      logger.error('Rate limit middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  };
};
