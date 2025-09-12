import * as widgetService from '../services/widgetService.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import logger from '../config/logger.js';


//get all widgets
export const getAllWidgets = asyncHandler(async (req, res) => {
  const widgets = await widgetService.getAllWidgets();
  res.json(widgets);
});

// Create a new widget
export const createWidget = asyncHandler(async (req, res) => {
  const { dashboard_id, type, title, kpi_id, data_source_id, config, position } = req.body;

  const widgetData = {
    dashboard_id,
    type,
    title,
    kpi_id,
    data_source_id,
    config,
    position
  };

  const widget = await widgetService.createWidget(widgetData);

  logger.info(`Widget created: ${widget.data.id} for dashboard ${dashboard_id}`);

  res.status(201).json(widget);
});

// Get widget by ID
export const getWidgetById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const widget = await widgetService.getWidgetById(id);

  if (!widget.success) {
    return res.status(404).json(widget);
  }

  res.json(widget);
});

// Get widgets by dashboard ID
export const getWidgetsByDashboardId = asyncHandler(async (req, res) => {
  const { dashboardId } = req.params;

  const widgets = await widgetService.getWidgetsByDashboardId(dashboardId);

  res.json({
    success: true,
    data: widgets.data
  });
});

// Update widget
export const updateWidget = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const result = await widgetService.updateWidget(id, updateData);

  if (!result.success) {
    return res.status(404).json(result);
  }

  logger.info(`Widget updated: ${id} by user ${req.users?.id || 'system'}`);

  res.json({
    success: true,
    message: 'Widget updated successfully',
    data: result.data
  });
});

// Delete widget
export const deleteWidget = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await widgetService.deleteWidget(id);

  if (!result.success) {
    return res.status(404).json(result);
  }

  logger.info(`Widget deleted: ${id} by user ${req.users?.id || 'system'}`);

  res.json({
    success: true,
    message: 'Widget deleted successfully',
    data: result.data
  });
});

// Update widget configuration
export const updateWidgetConfig = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { config } = req.body;

  const result = await widgetService.updateWidgetConfig(id, config);

  if (!result.success) {
    return res.status(404).json(result);
  }

  logger.info(`Widget config updated: ${id} by user ${req.users?.id || 'system'}`);

  res.json({
    success: true,
    message: 'Widget configuration updated successfully',
    data: result.data
  });
});

// Update widget position
export const updateWidgetPosition = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { position } = req.body;

  const result = await widgetService.updateWidgetPosition(id, position);

  if (!result.success) {
    return res.status(404).json(result);
  }

  logger.info(`Widget position updated: ${id} by user ${req.users?.id || 'system'}`);

  res.json({
    success: true,
    message: 'Widget position updated successfully',
    data: result.data
  });
});

// Get widget data
export const getWidgetData = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await widgetService.getWidgetData(id);

  if (!result.success) {
    return res.status(404).json(result);
  }

  res.json(result);
});

// Get widget types
export const getWidgetTypes = asyncHandler(async (req, res) => {
  const types = await widgetService.getWidgetTypes();

  res.json(types);
});

// Validate widget configuration
export const validateWidgetConfig = asyncHandler(async (req, res) => {
  const { widgetType, config } = req.body;

  if (!widgetType || !config) {
    return res.status(400).json({
      success: false,
      message: 'Widget type and configuration are required'
    });
  }

  const result = await widgetService.validateWidgetConfig(widgetType, config);

  res.json(result);
});

// Get widget statistics
export const getWidgetStats = asyncHandler(async (req, res) => {
  const { dashboardId } = req.query;

  const stats = await widgetService.getWidgetStats(dashboardId);

  res.json(stats);
});

// Batch update widget positions
export const batchUpdateWidgetPositions = asyncHandler(async (req, res) => {
  const { positions } = req.body;

  if (!Array.isArray(positions)) {
    return res.status(400).json({
      success: false,
      message: 'Positions must be an array'
    });
  }

  try {
    const results = [];
    const errors = [];

    for (const { id, position } of positions) {
      try {
        const result = await widgetService.updateWidgetPosition(id, position);
        results.push({ id, success: true, data: result.data });
      } catch (error) {
        errors.push({ id, error: error.message });
      }
    }

    const successCount = results.length;
    const errorCount = errors.length;

    logger.info(`Batch widget position update completed: ${successCount} successful, ${errorCount} failed`);

    res.json({
      success: true,
      message: `Batch update completed: ${successCount} successful, ${errorCount} failed`,
      data: {
        successful: results,
        failed: errors,
        summary: {
          total: positions.length,
          successful: successCount,
          failed: errorCount
        }
      }
    });
  } catch (error) {
    logger.error('Error in batch widget position update:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update widget positions'
    });
  }
});

// Duplicate widget
export const duplicateWidget = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { dashboard_id, title } = req.body;

  try {
    // Get original widget
    const originalWidget = await widgetService.getWidgetById(id);
    if (!originalWidget.success) {
      return res.status(404).json(originalWidget);
    }

    // Create new widget data
    const newWidgetData = {
      dashboard_id: dashboard_id || originalWidget.data.dashboard_id,
      type: originalWidget.data.type,
      title: title || `${originalWidget.data.title} (Copy)`,
      kpi_id: originalWidget.data.kpi_id,
      data_source_id: originalWidget.data.data_source_id,
      config: originalWidget.data.config,
      position: {
        ...originalWidget.data.position,
        x: (originalWidget.data.position?.x || 0) + 1,
        y: (originalWidget.data.position?.y || 0) + 1
      }
    };

    const newWidget = await widgetService.createWidget(newWidgetData);

    logger.info(`Widget duplicated: ${id} -> ${newWidget.data.id}`);

    res.status(201).json({
      success: true,
      message: 'Widget duplicated successfully',
      data: newWidget.data
    });
  } catch (error) {
    logger.error('Error duplicating widget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to duplicate widget'
    });
  }
});

// Get widget preview data
export const getWidgetPreview = asyncHandler(async (req, res) => {
  const { type, config, kpi_id, data_source_id } = req.body;

  try {
    let previewData = null;

    if (kpi_id) {
      // Get KPI preview data
      const kpiQuery = `
        SELECT k.*, kv.value, kv.calculated_at
        FROM kpis k
        LEFT JOIN kpi_values kv ON k.id = kv.kpi_id
        WHERE k.id = $1
        ORDER BY kv.calculated_at DESC
        LIMIT 1
      `;
      const kpiResult = await database.query(kpiQuery, [kpi_id]);
      
      if (kpiResult.rows.length > 0) {
        previewData = {
          type: 'kpi',
          data: kpiResult.rows[0]
        };
      }
    } else if (data_source_id) {
      // Get data source preview data
      const dataSource = await DataSource.findById(data_source_id);
      if (dataSource) {
        previewData = {
          type: 'data_source',
          data: generatePreviewData(dataSource.type, config)
        };
      }
    }

    if (!previewData) {
      return res.status(400).json({
        success: false,
        message: 'Unable to generate preview data'
      });
    }

    res.json({
      success: true,
      data: previewData
    });
  } catch (error) {
    logger.error('Error getting widget preview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get widget preview'
    });
  }
});

// Generate preview data for different data source types
function generatePreviewData(dataSourceType, config) {
  const dataPoints = config?.dataPoints || 5;
  
  switch (dataSourceType) {
    case 'api':
      return Array.from({ length: dataPoints }, (_, i) => ({
        label: `API Data ${i + 1}`,
        value: Math.random() * 100,
        timestamp: new Date(Date.now() - i * 60000)
      }));
    
    case 'database':
      return Array.from({ length: dataPoints }, (_, i) => ({
        label: `DB Record ${i + 1}`,
        value: Math.random() * 1000,
        category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
      }));
    
    case 'file':
      return Array.from({ length: dataPoints }, (_, i) => ({
        label: `File ${i + 1}`,
        value: Math.random() * 50,
        size: Math.floor(Math.random() * 1000) + 'KB'
      }));
    
    default:
      return Array.from({ length: dataPoints }, (_, i) => ({
        label: `Item ${i + 1}`,
        value: Math.random() * 100
      }));
  }
}
