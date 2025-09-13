// routes/exportRoutes.js
import express from 'express';
import * as exportController from '../controllers/exportController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { mockAuth } from '../middlewares/mockAuth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(mockAuth);

// Export data routes
router.post('/data', validateRequest({
  dataType: { type: 'string', required: true },
  format: { type: 'string', required: true },
  filters: { type: 'object', required: false },
  includeHeaders: { type: 'boolean', required: false }
}), exportController.exportData);
router.get('/data', exportController.exportData);

// Export jobs management
router.get('/jobs', exportController.getExportJobs);
router.get('/jobs/:id', exportController.getExportJob);
router.delete('/jobs/:id', exportController.cancelExportJob);

// Export by type
router.get('/dashboard/:id', exportController.exportDashboard);
router.get('/report/:id', exportController.exportReport);
router.get('/analytics/:type', exportController.exportAnalytics);
router.get('/kpi/:id', exportController.exportKPI);

// Batch export
router.post('/batch', exportController.batchExport);
router.get('/batch/status/:jobId', exportController.getBatchExportStatus);

// Export templates
router.get('/templates', exportController.getExportTemplates);
router.post('/templates', validateRequest({
  name: { type: 'string', required: true, minLength: 1, maxLength: 255 },
  description: { type: 'string', required: false, maxLength: 1000 },
  config: { type: 'object', required: true }
}), exportController.createExportTemplate);
router.put('/templates/:id', validateRequest({
  name: { type: 'string', required: false, minLength: 1, maxLength: 255 },
  description: { type: 'string', required: false, maxLength: 1000 },
  config: { type: 'object', required: false }
}), exportController.updateExportTemplate);
router.delete('/templates/:id', exportController.deleteExportTemplate);

// Export history
router.get('/history', exportController.getExportHistory);
router.get('/history/:id', exportController.getExportHistoryItem);

// Download and file management
router.get('/download/:id', exportController.downloadExport);
router.get('/stats', exportController.getExportStatistics);
router.post('/validate', exportController.validateExportRequest);

export default router;
