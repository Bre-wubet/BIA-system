import express from 'express';
import * as kpiController from '../controllers/kpiController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// KPI CRUD operations
router.post('/', validateRequest({
  name: { type: 'string', required: true, minLength: 1, maxLength: 255 },
  description: { type: 'string', required: false, maxLength: 1000 },
  category: { type: 'string', required: true, minLength: 1, maxLength: 100 },
  formula: { type: 'string', required: true, minLength: 1 },
  data_source: { type: 'number', required: false, min: 1 },
  unit: { type: 'string', required: false, maxLength: 50 },
  target_value: { type: 'number', required: false },
  refresh_frequency: { type: 'number', required: false, min: 60, max: 86400 }
}), kpiController.createKPI);

router.get('/', kpiController.getAllKPIs);
router.get('/categories', kpiController.getKPICategories);
router.get('/needing-update', kpiController.getKPIsNeedingUpdate);
router.get('/stats', kpiController.getKPIStats);

// Analytics and predictions (must be before /:id route to avoid conflicts)
router.get('/analytics', kpiController.getKPIAnalytics);
router.get('/predictions', kpiController.getKPIPredictions);
router.get('/alerts', kpiController.getKPIAlerts);

router.get('/:id', kpiController.getKPIById);
router.put('/:id', validateRequest({
  name: { type: 'string', required: false, minLength: 1, maxLength: 255 },
  description: { type: 'string', required: false, maxLength: 1000 },
  category: { type: 'string', required: false, minLength: 1, maxLength: 100 },
  formula: { type: 'string', required: false, minLength: 1 },
  data_source: { type: 'number', required: false, min: 1 },
  unit: { type: 'string', required: false, maxLength: 50 },
  target_value: { type: 'number', required: false },
  refresh_frequency: { type: 'number', required: false, min: 60, max: 86400 }
}), kpiController.updateKPI);
router.delete('/:id', kpiController.deleteKPI);

// KPI calculation and values
router.post('/:id/calculate', validateRequest({
  data_source_id: { type: 'number', required: false, min: 1 }
}), kpiController.calculateKpiValue);
router.get('/:id/history-values', kpiController.getKpiValuesHistory);
router.get('/:id/latest-value', kpiController.getLatestKpiValue);

// Category-specific operations
router.get('/category/:category', kpiController.getKPIsByCategory);

// Batch operations
router.post('/batch', kpiController.refreshAllKpis);

export default router;
