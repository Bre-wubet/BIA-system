import database from '../config/db.js';
import Dashboard from '../models/Dashboard.js';
import DashboardWidget from '../models/DashboardWidget.js';
import KPI from '../models/KPI.js';
import logger from '../config/logger.js';

// Create a new dashboard
export async function createDashboard(dashboardData) {
  try {
    const dashboard = await Dashboard.createDashboard(dashboardData);
    logger.info(`Dashboard created: ${dashboard.id} by user ${dashboardData.user_id}`);

    return {
      success: true,
      data: dashboard,
      message: 'Dashboard created successfully'
    };
  } catch (error) {
    logger.error('Error creating dashboard:', error);
    throw error;
  }
}

// Get dashboard by ID
export async function getDashboardById(id) {
  try {
    const dashboard = await Dashboard.findById(id);
    if (!dashboard) {
      return { success: false, message: 'Dashboard not found' };
    }

    // Get widgets for this dashboard
    const widgets = await DashboardWidget.findByDashboardId(id);
    
    return { 
      success: true, 
      data: { ...dashboard, widgets: widgets.rows || [] } 
    };
  } catch (error) {
    logger.error('Error getting dashboard:', error);
    throw error;
  }
}

// Get dashboards by user ID
export async function getDashboardsByUserId(userId) {
  try {
    const dashboards = await Dashboard.findByUserId(userId);
    return { success: true, data: dashboards.rows || [] };
  } catch (error) {
    logger.error('Error getting dashboards by user ID:', error);
    throw error;
  }
}

// Get default dashboard for user
export async function getDefaultDashboard(userId) {
  try {
    const dashboard = await Dashboard.getDefaultDashboard(userId);
    if (!dashboard) {
      return { success: false, message: 'No default dashboard found' };
    }

    // Get widgets for this dashboard
    const widgets = await DashboardWidget.findByDashboardId(dashboard.id);
    
    return { 
      success: true, 
      data: { ...dashboard, widgets: widgets.rows || [] } 
    };
  } catch (error) {
    logger.error('Error getting default dashboard:', error);
    throw error;
  }
}

// Update dashboard
export async function updateDashboard(id, updateData) {
  try {
    const dashboard = await Dashboard.findById(id);
    if (!dashboard) {
      return { success: false, message: 'Dashboard not found' };
    }

    const updatedDashboard = await Dashboard.update(id, updateData);
    logger.info(`Dashboard updated: ${id}`);

    return { success: true, data: updatedDashboard };
  } catch (error) {
    logger.error('Error updating dashboard:', error);
    throw error;
  }
}

// Delete dashboard
export async function deleteDashboard(id) {
  try {
    const dashboard = await Dashboard.findById(id);
    if (!dashboard) {
      return { success: false, message: 'Dashboard not found' };
    }

    // Deactivate all widgets first
    await DashboardWidget.deactivateWidgetsByDashboard(id);
    
    // Delete the dashboard
    const deletedDashboard = await Dashboard.remove(id);
    logger.info(`Dashboard deleted: ${id}`);

    return { success: true, data: deletedDashboard };
  } catch (error) {
    logger.error('Error deleting dashboard:', error);
    throw error;
  }
}

// Duplicate dashboard
export async function duplicateDashboard(id, userId, newName) {
  try {
    const dashboard = await Dashboard.findById(id);
    if (!dashboard) {
      return { success: false, message: 'Dashboard not found' };
    }

    const duplicatedDashboard = await Dashboard.duplicate(id, userId, newName);
    
    // Duplicate widgets
    const originalWidgets = await DashboardWidget.findByDashboardId(id);
    for (const widget of originalWidgets.rows || []) {
      await DashboardWidget.createWidget({
        ...widget,
        id: undefined, // Remove ID to create new widget
        dashboard_id: duplicatedDashboard.id,
        created_at: undefined,
        updated_at: undefined
      });
    }

    logger.info(`Dashboard duplicated: ${id} -> ${duplicatedDashboard.id}`);
    return { success: true, data: duplicatedDashboard };
  } catch (error) {
    logger.error('Error duplicating dashboard:', error);
    throw error;
  }
}

// Get public dashboards
export async function getPublicDashboards() {
  try {
    const dashboards = await Dashboard.getPublicDashboards();
    return { success: true, data: dashboards.rows || [] };
  } catch (error) {
    logger.error('Error getting public dashboards:', error);
    throw error;
  }
}

// Update dashboard layout
export async function updateDashboardLayout(id, layout) {
  try {
    const dashboard = await Dashboard.findById(id);
    if (!dashboard) {
      return { success: false, message: 'Dashboard not found' };
    }

    const updatedDashboard = await Dashboard.updateLayout(id, layout);
    logger.info(`Dashboard layout updated: ${id}`);

    return { success: true, data: updatedDashboard };
  } catch (error) {
    logger.error('Error updating dashboard layout:', error);
    throw error;
  }
}

// Get dashboard with full data (including KPI values and data source data)
export async function getDashboardWithData(id, userId) {
  try {
    const dashboard = await Dashboard.findById(id);
    if (!dashboard) {
      return { success: false, message: 'Dashboard not found' };
    }

    if (!dashboard.is_public && dashboard.user_id !== userId) {
      return { success: false, message: 'Access denied' };
    }

    // Fetch widgets
    const kpisResult = await KPI.findByDashboardId(id);

    // Normalize result into an array
    let kpiList = [];
    if (Array.isArray(kpisResult)) {
      kpiList = kpisResult;
    } else if (kpisResult && Array.isArray(kpisResult.rows)) {
      kpiList = kpisResult.rows[0] || [];
    }

    const enrichedkpis = [];

    for (const kpi of kpiList) {
      let kpiData = null;

      if (kpi.kpi_id) {
        const kpiQuery = `
          SELECT k.*, kv.value, kv.calculated_at
          FROM kpis k
          LEFT JOIN kpi_values kv ON k.id = kv.kpi_id
          WHERE k.id = $1
        `;
        const kpiResult = await database.query(kpiQuery, [kpi.kpi_id]);
        if (kpiResult.rows.length > 0) {
          kpiData = kpiResult.rows[0];
        }
      } else if (kpi.data_source_id) {
        kpiData = {
          type: 'data_source',
          data: [
            { label: 'Sample Data 1', value: Math.random() * 100 },
            { label: 'Sample Data 2', value: Math.random() * 100 }
          ]
        };
      }

      enrichedkpis.push({ ...kpi, data: kpiData });
    }

    return {
      success: true,
      data: { ...dashboard, kpis: enrichedkpis }
    };
  } catch (error) {
    logger.error('Error getting dashboard with data:', error);
    throw error;
  }
}


// Set default dashboard for user
export async function setDefaultDashboard(userId, dashboardId) {
  try {
    // First, unset any existing default dashboards for this user
    const unsetQuery = `
      UPDATE dashboards 
      SET is_default = false 
      WHERE user_id = $1 AND is_default = true
    `;
    await database.query(unsetQuery, [userId]);

    // Set the new default dashboard
    const setQuery = `
      UPDATE dashboards 
      SET is_default = true 
      WHERE id = $1 AND (user_id = $2 OR is_public = true)
    `;
    const result = await database.query(setQuery, [dashboardId, userId]);

    if (result.rowCount === 0) {
      return { success: false, message: 'Dashboard not found or access denied' };
    }

    logger.info(`Default dashboard set: ${dashboardId} for user ${userId}`);
    return { success: true, message: 'Default dashboard updated' };
  } catch (error) {
    logger.error('Error setting default dashboard:', error);
    throw error;
  }
}

// Get dashboard statistics
export async function getDashboardStats(userId) {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_dashboards,
        COUNT(CASE WHEN is_public = true THEN 1 END) as public_dashboards,
        COUNT(CASE WHEN is_default = true THEN 1 END) as default_dashboards,
        AVG(EXTRACT(EPOCH FROM (NOW() - updated_at))) as avg_last_updated
      FROM dashboards 
      WHERE user_id = $1 OR is_public = true
    `;
    
    const statsResult = await database.query(statsQuery, [userId]);
    const stats = statsResult.rows[0];

    // Get kpi count
    const widgetQuery = `
      SELECT COUNT(*) as total_widgets
      FROM widgets w
      JOIN dashboards d ON w.dashboard_id = d.id
      WHERE (d.user_id = $1 OR d.is_public = true) AND w.is_active = true
    `;
    
    const widgetResult = await database.query(widgetQuery, [userId]);
    const widgetCount = widgetResult.rows[0];

    return { 
      success: true, 
      data: { ...stats, ...widgetCount } 
    };
  } catch (error) {
    logger.error('Error getting dashboard stats:', error);
    throw error;
  }
}
