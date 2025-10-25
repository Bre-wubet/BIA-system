// routes/dataIntegrationRoutes.js
import express from 'express';
import { body, param } from 'express-validator';

import * as dataIntegrationController from '../controllers/dataSourceController.js';
import * as mappingController from '../controllers/mappingRuleController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
// import { requireRole, requireAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// ---------------- Validation Schemas ---------------- //
// const createDataSourceValidation = [
//   body('name').notEmpty().withMessage('Data source name is required'),
//   body('description').optional().isString().withMessage('Description must be a string'),
//   body('type').isIn(['internal_module', 'api', 'database', 'file', 'webhook'])
//     .withMessage('Type must be internal_module, api, database, file, or webhook'),
//   body('connection_config').isObject().withMessage('Connection config must be an object'),
//   body('credentials').optional().isObject().withMessage('Credentials must be an object'),
//   body('sync_frequency').optional().isInt({ min: 60, max: 86400 })
//     .withMessage('Sync frequency must be between 60 and 86400 seconds'),
//   validateRequest
// ];

const updateDataSourceValidation = [
  param('id').isInt().withMessage('Data source ID must be an integer'),
  body('name').optional().notEmpty().withMessage('Data source name cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('type').optional().isIn(['internal_module', 'api', 'database', 'file', 'webhook'])
    .withMessage('Type must be internal_module, api, database, file, or webhook'),
  body('connection_config').optional().isObject().withMessage('Connection config must be an object'),
  body('credentials').optional().isObject().withMessage('Credentials must be an object'),
  body('sync_frequency').optional().isInt({ min: 60, max: 86400 })
    .withMessage('Sync frequency must be between 60 and 86400 seconds'),
  validateRequest
];

const dataSourceIdValidation = [
  param('id').isInt().withMessage('Data source ID must be an integer'),
  validateRequest
];

const syncDataSourceValidation = [
  param('id').isInt().withMessage('Data source ID must be an integer'),
  validateRequest
];

// ---------------- Router Setup ---------------- //

// Apply authentication to all routes
//router.use(authMiddleware);


// CRUD Routes
router.post('/', dataIntegrationController.createDataSource);
router.get('/', dataIntegrationController.getAllDataSources);
router.get('/types', dataIntegrationController.getDataSourceTypes);
router.get('/active-datas', dataIntegrationController.getActiveDataSources);
router.get('/status', dataIntegrationController.getSyncStatus);

// // Single Data Source Routes
router.get('/module-type', dataIntegrationController.getDataSourcesByModuleAndType);
router.get('/:id', dataIntegrationController.getDataSource);
router.put('/:id', updateDataSourceValidation, dataIntegrationController.updateDataSource);
router.put('/:id/status', updateDataSourceValidation, dataIntegrationController.updateDataSourceStatus);
router.delete('/:id', dataSourceIdValidation, dataIntegrationController.softDeleteDataSource);
router.delete('/:id/hard', dataIntegrationController.deleteDataSource);

// // Connection Testing
router.post('/:id/test', dataIntegrationController.testConnectionById);

// Sync Operations
router.post('/:id/sync', dataIntegrationController.syncDataSource);
router.get('/sync/queue', dataIntegrationController.getSyncQueue);
router.get('/sync/logs', dataIntegrationController.getIntegrationLogs);
router.get('/sync/logs/:dataSourceId/paginate', dataIntegrationController.fetchSyncHistoryByDataSourceId);
router.get('/sync/logs/paginated', dataIntegrationController.getPaginatedIntegrationLogs);
router.get('/sync/logs/:logId/records', dataIntegrationController.getLogRecordsByLogId);
router.get('/sync/needing-sync', dataIntegrationController.getDataSourcesNeedingSync);

// // Batch Operations
router.post('/sync/batch', dataIntegrationController.syncMultipleDataSources);
router.post('/test/batch', dataIntegrationController.testMultipleConnections);

// Mapping Routes
router.get('/:id/mappings', mappingController.getRules);
router.post('/:id/mappings', mappingController.addRule);
router.put('/:id/mappings/:mapId', mappingController.updateRule);
router.delete('/:id/mappings/:mapId', mappingController.deleteRule);

export default router;
