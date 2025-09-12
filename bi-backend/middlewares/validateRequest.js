// validateRequest.js
import { validationResult } from 'express-validator';
import logger from '../config/logger.js';

// Validation result handler
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const errors = [];

    // Validate each schema field
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      // Required check
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push({ field, message: `${field} is required` });
        continue;
      }

      // Skip validation if field not provided & not required
      if (value === undefined || value === null) continue;

      // Type check
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (rules.type && actualType !== rules.type) {
        errors.push({ field, message: `${field} must be of type ${rules.type}`, value });
        continue;
      }

      // String constraints
      if (rules.type === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push({ field, message: `${field} must be at least ${rules.minLength} characters long`, value });
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push({ field, message: `${field} must be at most ${rules.maxLength} characters long`, value });
        }
      }

      // Number constraints
      if (rules.type === 'number') {
        if (isNaN(value)) {
          errors.push({ field, message: `${field} must be a valid number`, value });
          continue;
        }
        if (rules.min !== undefined && value < rules.min) {
          errors.push({ field, message: `${field} must be >= ${rules.min}`, value });
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push({ field, message: `${field} must be <= ${rules.max}`, value });
        }
      }
    }

    // If errors → return 400
    if (errors.length > 0) {
      logger.warn('Validation failed', {
        errors,
        url: req.url,
        method: req.method,
        userId: req.users?.id
      });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

// Custom validation helpers
export const customValidators = {
  isValidEmail: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  isStrongPassword: (value) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value),
  isValidDate: (value) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) return false;
    const date = new Date(value);
    return date instanceof Date && !isNaN(date);
  },
  isValidDateRange: (startDate, endDate) => new Date(startDate) <= new Date(endDate),
  isValidJSON: (value) => {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  },
  isValidURL: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  isInRange: (value, min, max) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
  },
  isValidArrayLength: (value, min, max) => Array.isArray(value) && value.length >= min && value.length <= max,
  isValidFileExtension: (filename, allowedExtensions) => {
    if (!filename) return false;
    const extension = filename.split('.').pop().toLowerCase();
    return allowedExtensions.includes(extension);
  },
  isValidRole: (value) => ['admin', 'manager', 'analyst', 'data_scientist', 'user'].includes(value),
  isValidDepartment: (value) => [
    'sales', 'marketing', 'finance', 'accounting', 'hr', 'human_resources',
    'operations', 'logistics', 'it', 'technology', 'analytics', 'data_science'
  ].includes(value),
  isValidKPICategory: (value) => [
    'sales', 'finance', 'hr', 'operations', 'marketing',
    'customer', 'inventory', 'performance', 'quality'
  ].includes(value),
  isValidReportType: (value) => [
    'sales_report', 'financial_report', 'hr_report', 
    'operations_report', 'analytics_report', 'custom_report'
  ].includes(value),
  isValidDataSourceType: (value) => [
    'database', 'api', 'file', 'webhook', 'streaming'
  ].includes(value),
  isValidModelType: (value) => [
    'sales_forecast', 'churn_prediction', 'inventory_forecast',
    'demand_forecast', 'anomaly_detection', 'classification'
  ].includes(value),
  isValidStatus: (value) => ['active', 'inactive', 'pending', 'error', 'training'].includes(value),
  isValidTrend: (value) => ['up', 'down', 'stable'].includes(value),
  isValidFormat: (value) => ['pdf', 'csv', 'excel', 'json', 'xml'].includes(value)
};

// Sanitization helpers
export const sanitizers = {
  trim: (value) => (typeof value === 'string' ? value.trim() : value),
  toLowerCase: (value) => (typeof value === 'string' ? value.toLowerCase() : value),
  toUpperCase: (value) => (typeof value === 'string' ? value.toUpperCase() : value),
  removeSpecialChars: (value) => (typeof value === 'string' ? value.replace(/[^a-zA-Z0-9\s]/g, '') : value),
  escapeHTML: (value) => {
    if (typeof value !== 'string') return value;
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  },
  normalizeEmail: (value) => (typeof value === 'string' ? value.toLowerCase().trim() : value),
  parseJSON: (value) => {
    if (typeof value === 'object') return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
};
