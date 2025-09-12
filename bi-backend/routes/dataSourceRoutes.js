// routes/dataIntegrationRoutes.js
import express from 'express';
import { body, param } from 'express-validator';

import * as dataIntegrationController from '../controllers/dataSourceController.js';
import * as mappingController from '../controllers/mappingRuleController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
//import { authMiddleware } from '../middlewares/authMiddleware.js';
// import { requireRole, requireAdmin } from '../middlewares/roleMiddleware.js';
import { mockAuth } from '../middlewares/mockAuth.js';

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
const router = express.Router();

// Apply authentication to all routes
//router.use(authMiddleware);


// CRUD Routes
router.post('/', mockAuth, dataIntegrationController.createDataSource);
router.get('/', mockAuth, dataIntegrationController.getAllDataSources);
router.get('/types', mockAuth, dataIntegrationController.getDataSourceTypes);
router.get('/active-datas', mockAuth, dataIntegrationController.getActiveDataSources);
router.get('/status', mockAuth, dataIntegrationController.getSyncStatus);

// // Single Data Source Routes
router.get('/module-type', mockAuth, dataIntegrationController.getDataSourcesByModuleAndType);
router.get('/:id', mockAuth, dataIntegrationController.getDataSource);
router.put('/:id', mockAuth, updateDataSourceValidation, dataIntegrationController.updateDataSource);
router.put('/:id/status', mockAuth, updateDataSourceValidation, dataIntegrationController.updateDataSourceStatus);
router.delete('/:id', mockAuth, dataSourceIdValidation, dataIntegrationController.softDeleteDataSource);
router.delete('/:id/hard', mockAuth, dataIntegrationController.deleteDataSource);

// // Connection Testing
router.post('/:id/test', mockAuth, dataIntegrationController.testConnectionById);

// Sync Operations
router.post('/:id/sync', mockAuth, dataIntegrationController.syncDataSource);
router.get('/sync/queue', mockAuth, dataIntegrationController.getSyncQueue);
router.get('/sync/logs', mockAuth, dataIntegrationController.getIntegrationLogs);
router.get('/sync/logs/:dataSourceId/paginate', mockAuth, dataIntegrationController.fetchSyncHistoryByDataSourceId);
router.get('/sync/logs/paginated', mockAuth, dataIntegrationController.getPaginatedIntegrationLogs);
router.get('/sync/needing-sync', mockAuth, dataIntegrationController.getDataSourcesNeedingSync);

// // Batch Operations
router.post('/sync/batch', mockAuth, dataIntegrationController.syncMultipleDataSources);
router.post('/test/batch', mockAuth, dataIntegrationController.testMultipleConnections);

// Mapping Routes
router.get('/:id/mappings', mockAuth, mappingController.getRules);
router.post('/:id/mappings', mockAuth, mappingController.addRule);
router.put('/:id/mappings/:mapId', mockAuth, mappingController.updateRule);
router.delete('/:id/mappings/:mapId', mockAuth, mappingController.deleteRule);

export default router;
