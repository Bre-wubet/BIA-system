import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// ----------------- Dashboard CRUD -----------------
router.post(
  '/',
  validateRequest({
    name: { type: 'string', required: true, minLength: 1, maxLength: 255 },
    description: { type: 'string', required: false, maxLength: 1000 },
    layout: { type: 'object', required: false },
    filters: { type: 'object', required: false },
    is_public: { type: 'boolean', required: false },
    is_default: { type: 'boolean', required: false },
    refresh_interval: { type: 'number', required: false, min: 60, max: 86400 }
  }),
  dashboardController.createDashboard
);

router.get('/', dashboardController.getDashboardsByUserId);
router.get('/default', dashboardController.getDefaultDashboard);
router.get('/public', dashboardController.getPublicDashboards);
router.get('/stats', dashboardController.getDashboardStats);
router.get('/search', dashboardController.searchDashboards);
router.get('/templates', dashboardController.getDashboardTemplates);

router.get('/:id', dashboardController.getDashboardById);
router.get('/:id/with-data', dashboardController.getDashboardWithData);

router.put(
  '/:id',
  validateRequest({
    name: { type: 'string', required: false, minLength: 1, maxLength: 255 },
    description: { type: 'string', required: false, maxLength: 1000 },
    layout: { type: 'object', required: false },
    filters: { type: 'object', required: false },
    is_public: { type: 'boolean', required: false },
    is_default: { type: 'boolean', required: false },
    refresh_interval: { type: 'number', required: false, min: 60, max: 86400 }
  }),
  dashboardController.updateDashboard
);

router.delete('/:id', dashboardController.deleteDashboard);

// ----------------- Layout & Configuration -----------------
router.put(
  '/:id/layout',
  validateRequest({
    layout: { type: 'object', required: true }
  }),
  dashboardController.updateDashboardLayout
);

// ----------------- Dashboard Operations -----------------
router.post(
  '/:id/duplicate',
  validateRequest({
    name: { type: 'string', required: false, minLength: 1, maxLength: 255 }
  }),
  dashboardController.duplicateDashboard
);

// ----------------- Default Dashboard -----------------
router.post(
  '/set-default',
  validateRequest({
    dashboardId: { type: 'number', required: true, min: 1 }
  }),
  dashboardController.setDefaultDashboard
);

// ----------------- Template Operations -----------------
router.post(
  '/from-template',
  validateRequest({
    templateId: { type: 'string', required: true, minLength: 1 },
    name: { type: 'string', required: false, minLength: 1, maxLength: 255 },
    description: { type: 'string', required: false, maxLength: 1000 }
  }),
  dashboardController.createFromTemplate
);

export default router;
