import database from '../config/db.js';
import DashboardWidget from '../models/DashboardWidget.js';
import Dashboard from '../models/Dashboard.js';
import KPI from '../models/KPI.js';
import DataSource from '../models/DataSource.js';
import logger from '../config/logger.js';


// Get all widgets
export async function getAllWidgets() {
  try {
    const widgets = await DashboardWidget.getAllWidgets();
    return { success: true, data: widgets };
  } catch (error) {
    logger.error('Error getting all widgets:', error);
    throw error;
  }
}

// Create a new widget
export async function createWidget(widgetData) {
  try {
    // Validate dashboard exists
    const dashboard = await Dashboard.findById(widgetData.dashboard_id);
    if (!dashboard) {
      throw new Error('Referenced dashboard does not exist');
    }

    // Validate either KPI or DataSource is provided (exclusive)
    if (widgetData.kpi_id && widgetData.data_source_id) {
      throw new Error('Widget cannot have both KPI and data source');
    }
    if (!widgetData.kpi_id && !widgetData.data_source_id) {
      throw new Error('Widget must have either KPI or data source');
    }

    // Validate KPI exists if provided
    if (widgetData.kpi_id) {
      const kpi = await KPI.findById(widgetData.kpi_id);
      if (!kpi) {
        throw new Error('Referenced KPI does not exist');
      }
    }

    // Validate data source exists if provided
    if (widgetData.data_source_id) {
      const dataSource = await DataSource.findById(widgetData.data_source_id);
      if (!dataSource) {
        throw new Error('Referenced data source does not exist');
      }
    }

    const widget = await DashboardWidget.createWidget(widgetData);
    logger.info(`Widget created: ${widget.id} for dashboard ${widgetData.dashboard_id}`);

    return {
      success: true,
      data: widget,
      message: 'Widget created successfully'
    };
  } catch (error) {
    logger.error('Error creating widget:', error);
    throw error;
  }
}

// Get widget by ID
export async function getWidgetById(id) {
  try {
    const widget = await DashboardWidget.findById(id);
    if (!widget) {
      return { success: false, message: 'Widget not found' };
    }

    return { success: true, data: widget };
  } catch (error) {
    logger.error('Error getting widget:', error);
    throw error;
  }
}

// Get widgets by dashboard ID
export async function getWidgetsByDashboardId(dashboardId) {
  try {
    const widgets = await DashboardWidget.findByDashboardId(dashboardId);
    return { success: true, data: widgets || [] };
  } catch (error) {
    logger.error('Error getting widgets by dashboard ID:', error);
    throw error;
  }
}

// Update widget
export async function updateWidget(id, updateData) {
  try {
    const widget = await DashboardWidget.findById(id);
    if (!widget) {
      return { success: false, message: 'Widget not found' };
    }

    // Validate dashboard exists if being updated
    if (updateData.dashboard_id) {
      const dashboard = await Dashboard.findById(updateData.dashboard_id);
      if (!dashboard) {
        throw new Error('Referenced dashboard does not exist');
      }
    }

    // Validate KPI exists if being updated
    if (updateData.kpi_id) {
      const kpi = await KPI.findById(updateData.kpi_id);
      if (!kpi) {
        throw new Error('Referenced KPI does not exist');
      }
    }

    // Validate data source exists if being updated
    if (updateData.data_source_id) {
      const dataSource = await DataSource.findById(updateData.data_source_id);
      if (!dataSource) {
        throw new Error('Referenced data source does not exist');
      }
    }

    const updatedWidget = await DashboardWidget.update(id, updateData);
    logger.info(`Widget updated: ${id}`);

    return { success: true, data: updatedWidget };
  } catch (error) {
    logger.error('Error updating widget:', error);
    throw error;
  }
}

// Delete widget
export async function deleteWidget(id) {
  try {
    const widget = await DashboardWidget.findById(id);
    if (!widget) {
      return { success: false, message: 'Widget not found' };
    }

    const deletedWidget = await DashboardWidget.deleteWidget(id);
    logger.info(`Widget deleted: ${id}`);

    return { success: true, data: deletedWidget };
  } catch (error) {
    logger.error('Error deleting widget:', error);
    throw error;
  }
}

// Update widget configuration
export async function updateWidgetConfig(id, config) {
  try {
    const widget = await DashboardWidget.findById(id);
    if (!widget) {
      return { success: false, message: 'Widget not found' };
    }

    const updatedWidget = await DashboardWidget.updateConfig(id, config);
    logger.info(`Widget config updated: ${id}`);

    return { success: true, data: updatedWidget };
  } catch (error) {
    logger.error('Error updating widget config:', error);
    throw error;
  }
}

// Update widget position
export async function updateWidgetPosition(id, position) {
  try {
    const widget = await DashboardWidget.findById(id);
    if (!widget) {
      return { success: false, message: 'Widget not found' };
    }

    const updatedWidget = await DashboardWidget.updatePosition(id, position);
    logger.info(`Widget position updated: ${id}`);

    return { success: true, data: updatedWidget };
  } catch (error) {
    logger.error('Error updating widget position:', error);
    throw error;
  }
}

// Utility: Format KPI response
function formatKPIData(row, limit = 1) {
  if (!row) return null;
  return {
    type: 'kpi',
    kpi_id: row.id,
    name: row.name,
    description: row.description,
    unit: row.unit || '',
    values: row.values?.slice(0, limit) || [],
    meta: {
      last_calculated: row.values?.[0]?.calculated_at || null,
    },
  };
}

// Utility: Format DataSource response
function formatDataSourceData(dataSource, widget) {
  return {
    type: 'data_source',
    data_source_id: dataSource.id,
    name: dataSource.name,
    source_type: dataSource.type,
    meta: {
      config: widget.config || {},
    },
    data: generateMockData(dataSource.type, widget.config),
  };
}

// Get widget data (KPI values or data source data)
export async function getWidgetData(widgetId, options = {}) {
  const { kpiHistoryLimit = 1, useCache = false } = options;

  try {
    const widget = await DashboardWidget.findById(widgetId);
    if (!widget) {
      return { success: false, message: 'Widget not found' };
    }

    let data = null;

    if (widget.kpi_id) {
      // Fetch KPI values (latest or history)
      const kpiQuery = `
        SELECT k.id, k.name, k.description, k.unit,
               COALESCE(json_agg(json_build_object(
                 'value', kv.value,
                 'calculated_at', kv.calculated_at
               ) ORDER BY kv.calculated_at DESC) FILTER (WHERE kv.id IS NOT NULL), '[]') as values
        FROM kpis k
        LEFT JOIN kpi_values kv ON k.id = kv.kpi_id
        WHERE k.id = $1
        GROUP BY k.id
      `;

      const kpiResult = await database.query(kpiQuery, [widget.kpi_id]);

      if (kpiResult.rows.length > 0) {
        data = formatKPIData(kpiResult.rows[0], kpiHistoryLimit);
      }
    } else if (widget.data_source_id) {
      // Fetch data source info
      const dataSource = await DataSource.findById(widget.data_source_id);
      if (dataSource) {
        data = formatDataSourceData(dataSource, widget);
      }
    }

    return { success: true, widgetId, data };
  } catch (error) {
    logger.error('Error getting widget data:', {
      widgetId,
      error: error.message,
    });
    return { success: false, message: 'Failed to load widget data', error: error.message };
  }
}

// Generate mock data based on data source type and widget config
function generateMockData(dataSourceType, widgetConfig) {
  const config = widgetConfig || {};
  const dataPoints = config.dataPoints || 10;
  
  switch (dataSourceType) {
    case 'api':
      return Array.from({ length: dataPoints }, (_, i) => ({
        label: `Data Point ${i + 1}`,
        value: Math.random() * 100,
        timestamp: new Date(Date.now() - i * 60000)
      }));
    
    case 'database':
      return Array.from({ length: dataPoints }, (_, i) => ({
        label: `Record ${i + 1}`,
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

// Get widget types
export async function getWidgetTypes() {
  try {
    const types = [
      {
        value: 'chart',
        label: 'Chart',
        description: 'Visual representation of data',
        supports: ['kpi', 'data_source']
      },
      {
        value: 'metric',
        label: 'Metric',
        description: 'Single value display',
        supports: ['kpi']
      },
      {
        value: 'table',
        label: 'Table',
        description: 'Tabular data display',
        supports: ['data_source']
      },
      {
        value: 'gauge',
        label: 'Gauge',
        description: 'Circular progress indicator',
        supports: ['kpi']
      },
      {
        value: 'trend',
        label: 'Trend',
        description: 'Time series visualization',
        supports: ['kpi', 'data_source']
      }
    ];

    return { success: true, data: types };
  } catch (error) {
    logger.error('Error getting widget types:', error);
    throw error;
  }
}

// Validate widget configuration
export async function validateWidgetConfig(widgetType, config) {
  try {
    const validationRules = {
      chart: {
        required: ['chartType'],
        chartTypes: ['line', 'bar', 'pie', 'area', 'scatter']
      },
      metric: {
        required: ['format', 'decimals'],
        formats: ['number', 'currency', 'percentage', 'duration']
      },
      table: {
        required: ['columns'],
        optional: ['pagination', 'sorting']
      },
      gauge: {
        required: ['min', 'max', 'thresholds'],
        optional: ['colors']
      },
      trend: {
        required: ['timeRange'],
        timeRanges: ['1h', '24h', '7d', '30d', '90d']
      }
    };

    const rules = validationRules[widgetType];
    if (!rules) {
      return { success: false, message: 'Invalid widget type' };
    }

    const errors = [];
    
    // Check required fields
    for (const field of rules.required) {
      if (!config[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Check field values
    if (rules.chartTypes && config.chartType && !rules.chartTypes.includes(config.chartType)) {
      errors.push(`Invalid chart type: ${config.chartType}`);
    }

    if (rules.timeRanges && config.timeRange && !rules.timeRanges.includes(config.timeRange)) {
      errors.push(`Invalid time range: ${config.timeRange}`);
    }

    if (errors.length > 0) {
      return { success: false, message: 'Validation failed', errors };
    }

    return { success: true, message: 'Configuration is valid' };
  } catch (error) {
    logger.error('Error validating widget config:', error);
    throw error;
  }
}

// Get widget statistics
export async function getWidgetStats(dashboardId = null) {
  try {
    let query = `
      SELECT 
        COUNT(*) as total_widgets,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_widgets,
        COUNT(CASE WHEN kpi_id IS NOT NULL THEN 1 END) as kpi_widgets,
        COUNT(CASE WHEN data_source_id IS NOT NULL THEN 1 END) as data_source_widgets
      FROM widgets
    `;
    
    const params = [];
    if (dashboardId) {
      query += ' WHERE dashboard_id = $1';
      params.push(dashboardId);
    }

    const result = await database.query(query, params);
    const stats = result.rows[0];

    // Get widget type distribution
    const typeQuery = `
      SELECT type, COUNT(*) as count
      FROM widgets
      WHERE is_active = true
      ${dashboardId ? 'AND dashboard_id = $1' : ''}
      GROUP BY type
      ORDER BY count DESC
    `;
    
    const typeResult = await database.query(typeQuery, dashboardId ? [dashboardId] : []);
    stats.type_distribution = typeResult.rows;

    return { success: true, data: stats };
  } catch (error) {
    logger.error('Error getting widget stats:', error);
    throw error;
  }
}
