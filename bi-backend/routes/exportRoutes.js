// routes/exportRoutes.js
import express from 'express';
import { body, param, query } from 'express-validator';

import ExportController from '../controllers/exportController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();
const exportController = new ExportController();

// Validation schemas
const exportDataValidation = [
  body('data').isObject().withMessage('Data must be an object'),
  body('format').isIn(['csv', 'pdf', 'excel', 'json']).withMessage('Format must be csv, pdf, excel, or json'),
  body('filename').optional().isString().withMessage('Filename must be a string'),
  validateRequest
];

const exportQueryValidation = [
  query('format').isIn(['csv', 'pdf', 'excel', 'json']).withMessage('Format must be csv, pdf, excel, or json'),
  query('filename').optional().isString().withMessage('Filename must be a string'),
  validateRequest
];

const exportByIdValidation = [
  param('id').isInt().withMessage('ID must be an integer'),
  query('format').optional().isIn(['csv', 'pdf', 'excel', 'json']).withMessage('Format must be csv, pdf, excel, or json'),
  validateRequest
];

// Middleware
router.use(authMiddleware);

// Export data routes
router.post('/data', exportDataValidation, (req, res, next) => exportController.exportData(req, res, next));
router.get('/data', exportQueryValidation, (req, res, next) => exportController.exportData(req, res, next));

// Export by type
router.get('/dashboard/:id', exportByIdValidation, (req, res, next) => exportController.exportDashboard(req, res, next));
router.get('/report/:id', exportByIdValidation, (req, res, next) => exportController.exportReport(req, res, next));
router.get('/analytics/:type', exportQueryValidation, (req, res, next) => exportController.exportAnalytics(req, res, next));
router.get('/kpi/:id', exportByIdValidation, (req, res, next) => exportController.exportKPI(req, res, next));

// Batch export
router.post('/batch', (req, res, next) => exportController.batchExport(req, res, next));
router.get('/batch/status/:jobId', (req, res, next) => exportController.getBatchExportStatus(req, res, next));

// Export templates
router.get('/templates', (req, res, next) => exportController.getExportTemplates(req, res, next));
router.post('/templates', requireRole(['admin', 'manager']), (req, res, next) => exportController.createExportTemplate(req, res, next));
router.put('/templates/:id', requireRole(['admin', 'manager']), (req, res, next) => exportController.updateExportTemplate(req, res, next));
router.delete('/templates/:id', requireRole(['admin', 'manager']), (req, res, next) => exportController.deleteExportTemplate(req, res, next));

// Export history
router.get('/history', (req, res, next) => exportController.getExportHistory(req, res, next));
router.get('/history/:id', (req, res, next) => exportController.getExportHistoryItem(req, res, next));

export default router;
