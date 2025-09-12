import * as dashboardService from '../services/dashboardService.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import logger from '../config/logger.js';

// Create a new dashboard
export const createDashboard = asyncHandler(async (req, res) => {
  const { name, description, layout, filters, is_public, is_default, refresh_interval } = req.body;

  const dashboardData = {
    name,
    description,
    user_id: req.users?.id || 1, // Default user ID for now
    layout,
    filters,
    is_public: is_public || false,
    is_default: is_default || false,
    refresh_interval: refresh_interval || 300
  };

  const dashboard = await dashboardService.createDashboard(dashboardData);

  logger.info(`Dashboard created: ${dashboard.data.id} by user ${dashboardData.user_id}`);

  res.status(201).json({ dashboard: [dashboard.data] });
});

// Get dashboard by ID
export const getDashboardById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.users?.id || 1;

  const dashboard = await dashboardService.getDashboardById(id);

  if (!dashboard.success) {
    return res.status(404).json(dashboard);
  }

  res.json(dashboard);
});

// Get dashboards by user ID
export const getDashboardsByUserId = asyncHandler(async (req, res) => {
  const userId = req.users?.id || 1;

  const dashboards = await dashboardService.getDashboardsByUserId(userId);

  res.json({
    success: true,
    data: dashboards.data
  });
});

// Get default dashboard for user
export const getDefaultDashboard = asyncHandler(async (req, res) => {
  const userId = req.users?.id || 1;

  const dashboard = await dashboardService.getDefaultDashboard(userId);

  if (!dashboard.success) {
    return res.status(404).json(dashboard);
  }

  res.json(dashboard);
});

// Update dashboard
export const updateDashboard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const result = await dashboardService.updateDashboard(id, updateData);

  if (!result.success) {
    return res.status(404).json(result);
  }

  logger.info(`Dashboard updated: ${id} by user ${req.users?.id || 'system'}`);

  res.json({
    success: true,
    message: 'Dashboard updated successfully',
    data: result.data
  });
});

// Delete dashboard
export const deleteDashboard = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await dashboardService.deleteDashboard(id);

  if (!result.success) {
    return res.status(404).json(result);
  }

  logger.info(`Dashboard deleted: ${id} by user ${req.users?.id || 'system'}`);

  res.json({
    success: true,
    message: 'Dashboard deleted successfully',
    data: result.data
  });
});

// Duplicate dashboard
export const duplicateDashboard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const userId = req.users?.id || 1;

  const result = await dashboardService.duplicateDashboard(id, userId, name);

  if (!result.success) {
    return res.status(404).json(result);
  }

  logger.info(`Dashboard duplicated: ${id} -> ${result.data.id} by user ${userId}`);

  res.json({
    success: true,
    message: 'Dashboard duplicated successfully',
    data: result.data
  });
});

// Get public dashboards
export const getPublicDashboards = asyncHandler(async (req, res) => {
  const dashboards = await dashboardService.getPublicDashboards();

  res.json({
    success: true,
    data: dashboards.data
  });
});

// Update dashboard layout
export const updateDashboardLayout = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { layout } = req.body;

  const result = await dashboardService.updateDashboardLayout(id, layout);

  if (!result.success) {
    return res.status(404).json(result);
  }

  logger.info(`Dashboard layout updated: ${id} by user ${req.users?.id || 'system'}`);

  res.json({
    success: true,
    message: 'Dashboard layout updated successfully',
    data: result.data
  });
});

// Get dashboard with full data
export const getDashboardWithData = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.users?.id || 1;

  const dashboard = await dashboardService.getDashboardWithData(id, userId);

  if (!dashboard.success) {
    return res.status(404).json(dashboard);
  }

  res.json(dashboard);
});

// Set default dashboard for user
export const setDefaultDashboard = asyncHandler(async (req, res) => {
  const { dashboardId } = req.body;
  const userId = req.users?.id || 1;

  const result = await dashboardService.setDefaultDashboard(userId, dashboardId);

  if (!result.success) {
    return res.status(400).json(result);
  }

  logger.info(`Default dashboard set: ${dashboardId} for user ${userId}`);

  res.json({
    success: true,
    message: result.message
  });
});

// Get dashboard statistics
export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.users?.id || 1;

  const stats = await dashboardService.getDashboardStats(userId);

  res.json(stats);
});

// Get dashboard by name (search)
export const searchDashboards = asyncHandler(async (req, res) => {
  const { q: searchQuery, limit = 10 } = req.query;
  const userId = req.users?.id || 1;

  if (!searchQuery) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  try {
    const query = `
      SELECT * FROM dashboards 
      WHERE (user_id = $1 OR is_public = true)
      AND (name ILIKE $2 OR description ILIKE $2)
      AND is_active = true
      ORDER BY 
        CASE WHEN user_id = $1 THEN 0 ELSE 1 END,
        updated_at DESC
      LIMIT $3
    `;

    const result = await database.query(query, [userId, `%${searchQuery}%`, parseInt(limit)]);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        limit: parseInt(limit),
        total: result.rows.length
      }
    });
  } catch (error) {
    logger.error('Error searching dashboards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search dashboards'
    });
  }
});

// Get dashboard templates
export const getDashboardTemplates = asyncHandler(async (req, res) => {
  try {
    const templates = [
      {
        id: '1',
        name: 'Sales Overview',
        description: 'Comprehensive sales dashboard with key metrics',
        category: 'Sales',
        thumbnail: '/templates/sales-overview.png',
        config: {
          layout: {
            widgets: [
              { type: 'metric', position: { x: 0, y: 0, w: 3, h: 2 } },
              { type: 'chart', position: { x: 3, y: 0, w: 6, h: 4 } },
              { type: 'table', position: { x: 0, y: 2, w: 9, h: 3 } }
            ]
          }
        }
      },
      {
        id: '2',
        name: 'Financial Dashboard',
        description: 'Financial metrics and performance indicators',
        category: 'Finance',
        thumbnail: '/templates/financial-dashboard.png',
        config: {
          layout: {
            widgets: [
              { type: 'gauge', position: { x: 0, y: 0, w: 3, h: 3 } },
              { type: 'trend', position: { x: 3, y: 0, w: 6, h: 3 } },
              { type: 'metric', position: { x: 0, y: 3, w: 9, h: 2 } }
            ]
          }
        }
      },
      {
        id: '3',
        name: 'Operational Metrics',
        description: 'Key operational performance indicators',
        category: 'Operations',
        thumbnail: '/templates/operational-metrics.png',
        config: {
          layout: {
            widgets: [
              { type: 'chart', position: { x: 0, y: 0, w: 6, h: 4 } },
              { type: 'metric', position: { x: 6, y: 0, w: 3, h: 2 } },
              { type: 'table', position: { x: 0, y: 4, w: 9, h: 3 } }
            ]
          }
        }
      }
    ];

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    logger.error('Error getting dashboard templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard templates'
    });
  }
});

// Create dashboard from template
export const createFromTemplate = asyncHandler(async (req, res) => {
  const { templateId, name, description } = req.body;
  const userId = req.users?.id || 1;

  try {
    // Get template
    const templates = await getDashboardTemplates(req, res);
    const template = templates.data.find(t => t.id === templateId);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Create dashboard with template config
    const dashboardData = {
      name: name || template.name,
      description: description || template.description,
      user_id: userId,
      layout: template.config.layout,
      is_public: false,
      is_default: false,
      refresh_interval: 300
    };

    const dashboard = await dashboardService.createDashboard(dashboardData);

    logger.info(`Dashboard created from template: ${dashboard.data.id} using template ${templateId}`);

    res.status(201).json({
      success: true,
      message: 'Dashboard created from template successfully',
      data: dashboard.data
    });
  } catch (error) {
    logger.error('Error creating dashboard from template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create dashboard from template'
    });
  }
});
