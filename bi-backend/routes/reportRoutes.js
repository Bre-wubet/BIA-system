import express from 'express';
import * as reportController from '../controllers/reportController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { mockAuth } from '../middlewares/mockAuth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(mockAuth);

// Report CRUD routes
router.post('/', validateRequest({
  name: { type: 'string', required: true, minLength: 1, maxLength: 255 },
  description: { type: 'string', required: false, maxLength: 1000 },
  type: { type: 'string', required: true },
  category: { type: 'string', required: true, minLength: 1, maxLength: 100 },
  query_config: { type: 'object', required: true },
  parameters: { type: 'object', required: false },
  schedule: { type: 'string', required: false },
  recipients: { type: 'array', required: false },
  format: { type: 'string', required: false }
}), reportController.createReport);

router.get('/', reportController.getAllReports);
router.get('/stats', reportController.getReportStats);
router.get('/types', reportController.getReportTypes);
router.get('/categories', reportController.getReportCategories);
router.get('/templates', reportController.getReportTemplates);
router.get('/scheduled', reportController.getScheduledReports);

// Individual report routes
router.get('/:id', reportController.getReport);
router.put('/:id', validateRequest({
  name: { type: 'string', required: false, minLength: 1, maxLength: 255 },
  description: { type: 'string', required: false, maxLength: 1000 },
  type: { type: 'string', required: false },
  category: { type: 'string', required: false, minLength: 1, maxLength: 100 },
  query_config: { type: 'object', required: false },
  parameters: { type: 'object', required: false },
  schedule: { type: 'string', required: false },
  recipients: { type: 'array', required: false },
  format: { type: 'string', required: false }
}), reportController.updateReport);
router.delete('/:id', reportController.deleteReport);
router.post('/:id/duplicate', reportController.duplicateReport);

// Report generation and execution
router.post('/:id/run', reportController.runReport);
router.post('/:id/generate', reportController.generateReport);
router.get('/:id/generate', reportController.generateReport);
router.post('/:id/execute', reportController.executeReport);
router.get('/:id/export', reportController.exportReport);

// Scheduling
router.put('/:id/schedule', validateRequest({
  schedule: { type: 'string', required: true }
}), reportController.updateSchedule);
router.delete('/:id/schedule', reportController.removeSchedule);

// Recipients management
router.put('/:id/recipients', validateRequest({
  recipients: { type: 'array', required: true }
}), reportController.updateRecipients);
router.get('/:id/recipients', reportController.getRecipients);

// Sharing
router.post('/:id/share', reportController.shareReport);

// Report history and logs
router.get('/:id/history', reportController.getReportHistory);
router.get('/:id/logs', reportController.getReportLogs);

// Template operations
router.post('/templates/:id/create', reportController.createReportFromTemplate);

// Batch operations
router.post('/batch/generate', reportController.generateMultipleReports);
router.post('/batch/schedule', reportController.scheduleMultipleReports);

export default router;
