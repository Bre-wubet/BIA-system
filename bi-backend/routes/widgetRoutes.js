import express from 'express';
import * as widgetController from '../controllers/widgetController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { mockAuth } from '../middlewares/mockAuth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(mockAuth);

// Widget CRUD operations
router.post('/', validateRequest({
  dashboard_id: { type: 'number', required: true, min: 1 },
  type: { type: 'string', required: true, minLength: 1, maxLength: 50 },
  title: { type: 'string', required: false, maxLength: 255 },
  kpi_id: { type: 'number', required: false, min: 1 },
  data_source_id: { type: 'number', required: false, min: 1 },
  config: { type: 'object', required: false },
  position: { type: 'object', required: false }
}), widgetController.createWidget);

router.get('/', widgetController.getAllWidgets);
router.get('/:dashboardId', widgetController.getWidgetsByDashboardId);
router.get('/types', widgetController.getWidgetTypes);
router.get('/stats/:id', widgetController.getWidgetStats);

router.get('/:id', widgetController.getWidgetById);
router.put('/:id', validateRequest({
  dashboard_id: { type: 'number', required: false, min: 1 },
  type: { type: 'string', required: false, minLength: 1, maxLength: 50 },
  title: { type: 'string', required: false, maxLength: 255 },
  kpi_id: { type: 'number', required: false, min: 1 },
  data_source_id: { type: 'number', required: false, min: 1 },
  config: { type: 'object', required: false },
  position: { type: 'object', required: false }
}), widgetController.updateWidget);
router.delete('/:id', widgetController.deleteWidget);

// Widget configuration and positioning
router.put('/:id/config', validateRequest({
  config: { type: 'object', required: true }
}), widgetController.updateWidgetConfig);

router.put('/:id/position', validateRequest({
  position: { type: 'object', required: true }
}), widgetController.updateWidgetPosition);

// Widget data and preview
router.get('/:id/data', widgetController.getWidgetData);
router.get('/preview', validateRequest({
  type: { type: 'string', required: true, minLength: 1 },
  config: { type: 'object', required: false },
  kpi_id: { type: 'number', required: false, min: 1 },
  data_source_id: { type: 'number', required: false, min: 1 }
}), widgetController.getWidgetPreview);

// Widget validation
router.post('/validate-config', validateRequest({
  widgetType: { type: 'string', required: true, minLength: 1 },
  config: { type: 'object', required: true }
}), widgetController.validateWidgetConfig);

// Dashboard-specific widget operations
router.get('/dashboard/:dashboardId', widgetController.getWidgetsByDashboardId);

// Widget operations
router.post('/:id/duplicate', validateRequest({
  dashboard_id: { type: 'number', required: false, min: 1 },
  title: { type: 'string', required: false, minLength: 1, maxLength: 255 }
}), widgetController.duplicateWidget);

// Batch operations
router.post('/batch/positions', validateRequest({
  positions: { 
    type: 'array', 
    required: true, 
    items: {
      type: 'object',
      properties: {
        id: { type: 'number', required: true, min: 1 },
        position: { type: 'object', required: true }
      }
    }
  }
}), widgetController.batchUpdateWidgetPositions);

export default router;
