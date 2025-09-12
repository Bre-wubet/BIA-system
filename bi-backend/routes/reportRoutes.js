import express from 'express';
import { body, param, query } from 'express-validator';

import ReportController from '../controllers/reportController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole, requireOwnership } from '../middleware/roleMiddleware.js';

const router = express.Router();
const reportController = new ReportController();

// Validation schemas
const createReportValidation = [
  body('name').notEmpty().withMessage('Report name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('type').isIn(['sales_report', 'financial_report', 'hr_report', 'operations_report', 'analytics_report', 'custom_report'])
    .withMessage('Invalid report type'),
  body('category').notEmpty().withMessage('Category is required'),
  body('query_config').isObject().withMessage('Query config must be an object'),
  body('parameters').optional().isObject().withMessage('Parameters must be an object'),
  body('schedule').optional().isString().withMessage('Schedule must be a string'),
  body('recipients').optional().isArray().withMessage('Recipients must be an array'),
  body('format').optional().isIn(['pdf', 'csv', 'excel', 'json']).withMessage('Format must be pdf, csv, excel, or json'),
  validateRequest
];

const updateReportValidation = [
  param('id').isInt().withMessage('Report ID must be an integer'),
  body('name').optional().notEmpty().withMessage('Report name cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('type').optional().isIn(['sales_report', 'financial_report', 'hr_report', 'operations_report', 'analytics_report', 'custom_report'])
    .withMessage('Invalid report type'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  body('query_config').optional().isObject().withMessage('Query config must be an object'),
  body('parameters').optional().isObject().withMessage('Parameters must be an object'),
  body('schedule').optional().isString().withMessage('Schedule must be a string'),
  body('recipients').optional().isArray().withMessage('Recipients must be an array'),
  body('format').optional().isIn(['pdf', 'csv', 'excel', 'json']).withMessage('Format must be pdf, csv, excel, or json'),
  validateRequest
];

const reportIdValidation = [
  param('id').isInt().withMessage('Report ID must be an integer'),
  validateRequest
];

const generateReportValidation = [
  param('id').isInt().withMessage('Report ID must be an integer'),
  query('format').optional().isIn(['pdf', 'csv', 'excel', 'json']).withMessage('Format must be pdf, csv, excel, or json'),
  validateRequest
];

const scheduleReportValidation = [
  param('id').isInt().withMessage('Report ID must be an integer'),
  body('schedule').isString().withMessage('Schedule is required'),
  validateRequest
];

// authentication middleware
router.use(authMiddleware);

// Report CRUD routes
router.post('/', createReportValidation, (req, res, next) => reportController.createReport(req, res, next));
router.get('/', (req, res, next) => reportController.getAllReports(req, res, next));
router.get('/types', (req, res, next) => reportController.getReportTypes(req, res, next));
router.get('/categories', (req, res, next) => reportController.getReportCategories(req, res, next));
router.get('/scheduled', requireRole(['admin', 'manager']), (req, res, next) => reportController.getScheduledReports(req, res, next));

// Individual report routes
router.get('/:id', reportIdValidation, (req, res, next) => reportController.getReport(req, res, next));
router.put('/:id', requireOwnership('created_by'), updateReportValidation, (req, res, next) => reportController.updateReport(req, res, next));
router.delete('/:id', requireOwnership('created_by'), reportIdValidation, (req, res, next) => reportController.deleteReport(req, res, next));
router.post('/:id/duplicate', reportIdValidation, (req, res, next) => reportController.duplicateReport(req, res, next));

// Report generation and execution
router.post('/:id/generate', generateReportValidation, (req, res, next) => reportController.generateReport(req, res, next));
router.get('/:id/generate', generateReportValidation, (req, res, next) => reportController.generateReport(req, res, next));
router.post('/:id/execute', reportIdValidation, (req, res, next) => reportController.executeReport(req, res, next));

// Scheduling
router.put('/:id/schedule', requireOwnership('created_by'), scheduleReportValidation, (req, res, next) => reportController.updateSchedule(req, res, next));
router.delete('/:id/schedule', requireOwnership('created_by'), reportIdValidation, (req, res, next) => reportController.removeSchedule(req, res, next));

// Recipients management
router.put('/:id/recipients', requireOwnership('created_by'), reportIdValidation, (req, res, next) => reportController.updateRecipients(req, res, next));
router.get('/:id/recipients', reportIdValidation, (req, res, next) => reportController.getRecipients(req, res, next));

// Report history and logs
router.get('/:id/history', reportIdValidation, (req, res, next) => reportController.getReportHistory(req, res, next));
router.get('/:id/logs', reportIdValidation, (req, res, next) => reportController.getReportLogs(req, res, next));

// Batch operations
router.post('/batch/generate', requireRole(['admin', 'manager']), (req, res, next) => reportController.generateMultipleReports(req, res, next));
router.post('/batch/schedule', requireRole(['admin', 'manager']), (req, res, next) => reportController.scheduleMultipleReports(req, res, next));

export default router;
