import database from '../config/db.js';
import KPI from '../models/KPI.js';
import DataSource from '../models/DataSource.js';
import logger from '../config/logger.js';

// Create a new KPI
export async function createKPI(kpiData) {
  try {
    // Validate data source exists if provided
    if (kpiData.data_source_id) {
      const dataSource = await DataSource.findById(kpiData.data_source_id);
      if (!dataSource) {
        throw new Error('Referenced data source does not exist');
      }
    }

    const kpi = await KPI.createKpi(kpiData);
    logger.info(`KPI created: ${kpi.id} by user ${kpiData.created_by}`);

    return {
      success: true,
      data: kpi,
      message: 'KPI created successfully'
    };
  } catch (error) {
    logger.error('Error creating KPI:', error);
    throw error;
  }
}

// Get all KPIs
export async function getAllKPIs() {
  try {
    const kpis = await KPI.getAllKPIs();
    return { success: true, data: kpis.rows || [] };
  } catch (error) {
    logger.error('Error getting KPIs:', error);
    throw error;
  }
}

// Get KPI by ID
export async function getKPIById(id) {
  try {
    const kpi = await KPI.findById(id);
    if (!kpi) {
      return { success: false, message: 'KPI not found' };
    }
    return { success: true, data: kpi };
  } catch (error) {
    logger.error('Error getting KPI:', error);
    throw error;
  }
}

// Update KPI
export async function updateKPI(id, updateData) {
  try {
    const kpi = await KPI.findById(id);
    if (!kpi) {
      return { success: false, message: 'KPI not found' };
    }

    // Validate data source exists if being updated
    if (updateData.data_source_id) {
      const dataSource = await DataSource.findById(updateData.data_source_id);
      if (!dataSource) {
        throw new Error('Referenced data source does not exist');
      }
    }

    const updatedKPI = await KPI.updateKpi(id, updateData);
    logger.info(`KPI updated: ${id}`);

    return { success: true, data: updatedKPI };
  } catch (error) {
    logger.error('Error updating KPI:', error);
    throw error;
  }
}

// Delete KPI
export async function deleteKPI(id) {
  try {
    const kpi = await KPI.findById(id);
    if (!kpi) {
      return { success: false, message: 'KPI not found' };
    }

    const deletedKPI = await KPI.deleteKPI(id);
    logger.info(`KPI deleted: ${id}`);

    return { success: true, data: deletedKPI };
  } catch (error) {
    logger.error('Error deleting KPI:', error);
    throw error;
  }
}

// Get KPIs by category
export async function getKPIsByCategory(category) {
  try {
    const kpis = await KPI.getKPIsByCategory(category);
    return { success: true, data: kpis.rows || [] };
  } catch (error) {
    logger.error('Error getting KPIs by category:', error);
    throw error;
  }
}

// Get KPI categories
export async function getKPICategories() {
  try {
    const categories = await KPI.getCategories();
    return { success: true, data: categories.rows || [] };
  } catch (error) {
    logger.error('Error getting KPI categories:', error);
    throw error;
  }
}

// Get KPIs needing update
export async function getKPIsNeedingUpdate() {
  try {
    const kpis = await KPI.getKPIsNeedingUpdate();
    return { success: true, data: kpis || [] };
  } catch (error) {
    logger.error('Error getting KPIs needing update:', error);
    throw error;
  }
}

// Get KPI Analytics
export async function getKPIAnalytics() {
  try {
    const kpis = await KPI.getAllKPIs();
    const kpiValues = await KPI.getKPIValuesForAnalytics();
    
    // Calculate analytics metrics
    const analytics = {
      total_kpis: kpis.rows.length,
      active_kpis: kpis.rows.filter(kpi => kpi.is_active === true).length,
      categories: kpis.rows.reduce((acc, kpi) => {
        acc[kpi.category] = (acc[kpi.category] || 0) + 1;
        return acc;
      }, {}),
      performance_trends: {
        improving: 0,
        stable: 0,
        declining: 0
      },
      average_values: {},
      last_updated: new Date().toISOString()
    };

    // Calculate performance trends based on recent values
    if (kpiValues.rows && kpiValues.rows.length > 0) {
      const trendData = kpiValues.rows.reduce((acc, row) => {
        if (!acc[row.kpi_id]) {
          acc[row.kpi_id] = [];
        }
        acc[row.kpi_id].push({
          value: parseFloat(row.value),
          timestamp: row.timestamp
        });
        return acc;
      }, {});

      Object.keys(trendData).forEach(kpiId => {
        const values = trendData[kpiId].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        if (values.length >= 2) {
          const recent = values.slice(-2);
          const trend = recent[1].value - recent[0].value;
          if (trend > 0) analytics.performance_trends.improving++;
          else if (trend < 0) analytics.performance_trends.declining++;
          else analytics.performance_trends.stable++;
        }
      });
    }

    logger.info('KPI analytics generated successfully');
    return { success: true, data: analytics };
  } catch (error) {
    logger.error('Error getting KPI analytics:', error);
    throw error;
  }
}

// Get KPI Predictions
export async function getKPIPredictions() {
  try {
    const kpis = await KPI.getAllKPIs();
    const kpiValues = await KPI.getKPIValuesForPredictions();
    
    const predictions = {
      total_predictions: kpis.rows.length,
      predictions: [],
      last_updated: new Date().toISOString()
    };

    // Generate predictions for each KPI
    for (const kpi of kpis.rows) {
      const kpiData = kpiValues.rows ? kpiValues.rows.filter(row => row.kpi_id === kpi.id) : [];
      
      if (kpiData.length >= 3) {
        // Simple linear regression for prediction
        const values = kpiData.map(row => parseFloat(row.value));
        const recentValues = values.slice(-5); // Use last 5 values
        
        // Calculate trend
        const trend = recentValues.length > 1 ? 
          (recentValues[recentValues.length - 1] - recentValues[0]) / recentValues.length : 0;
        
        const currentValue = recentValues[recentValues.length - 1];
        const predictedValue = currentValue + (trend * 7); // Predict 7 days ahead
        
        predictions.predictions.push({
          kpi_id: kpi.id,
          kpi_name: kpi.name,
          category: kpi.category,
          current_value: currentValue,
          predicted_value: Math.max(0, predictedValue), // Ensure non-negative
          confidence: Math.min(0.95, Math.max(0.6, 1 - Math.abs(trend) / Math.max(currentValue, 1))), // Confidence based on trend stability
          prediction_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
          last_updated: new Date().toISOString()
        });
      }
    }

    logger.info(`Generated ${predictions.predictions.length} KPI predictions`);
    return { success: true, data: predictions };
  } catch (error) {
    logger.error('Error getting KPI predictions:', error);
    throw error;
  }
}

// Get KPI Alerts
export async function getKPIAlerts() {
  try {
    const kpis = await KPI.getAllKPIs();
    const kpiValues = await KPI.getKPIValuesForAlerts();
    
    const alerts = {
      total_alerts: 0,
      alerts: [],
      last_updated: new Date().toISOString()
    };

    // Generate alerts based on thresholds and targets
    for (const kpi of kpis.rows) {
      const kpiData = kpiValues.rows ? kpiValues.rows.filter(row => row.kpi_id === kpi.id) : [];
      
      if (kpiData.length > 0) {
        const latestValue = parseFloat(kpiData[kpiData.length - 1].value);
        const targetValue = parseFloat(kpi.target_value) || 0;
        
        // Check for threshold alerts
        if (targetValue > 0) {
          const deviation = Math.abs(latestValue - targetValue) / targetValue;
          
          if (deviation > 0.2) { // 20% deviation threshold
            alerts.alerts.push({
              id: `alert_${kpi.id}_${Date.now()}`,
              kpi_id: kpi.id,
              kpi_name: kpi.name,
              category: kpi.category,
              alert_type: latestValue > targetValue ? 'threshold_exceeded' : 'target_missed',
              severity: deviation > 0.5 ? 'high' : 'medium',
              current_value: latestValue,
              target_value: targetValue,
              deviation_percentage: Math.round(deviation * 100),
              message: `KPI ${kpi.name} is ${deviation > 0.5 ? 'significantly' : 'moderately'} ${latestValue > targetValue ? 'above' : 'below'} target`,
              created_at: new Date().toISOString(),
              status: 'active'
            });
          }
        }
        
        // Check for trend alerts (if we have enough data)
        if (kpiData.length >= 3) {
          const recentValues = kpiData.slice(-3).map(row => parseFloat(row.value));
          const trend = recentValues[2] - recentValues[0];
          const avgValue = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
          
          if (Math.abs(trend) > avgValue * 0.3) { // 30% change threshold
            alerts.alerts.push({
              id: `trend_alert_${kpi.id}_${Date.now()}`,
              kpi_id: kpi.id,
              kpi_name: kpi.name,
              category: kpi.category,
              alert_type: 'trend_alert',
              severity: Math.abs(trend) > avgValue * 0.5 ? 'high' : 'medium',
              current_value: latestValue,
              trend_value: trend,
              trend_percentage: Math.round((trend / avgValue) * 100),
              message: `KPI ${kpi.name} shows ${trend > 0 ? 'increasing' : 'decreasing'} trend of ${Math.round((trend / avgValue) * 100)}%`,
              created_at: new Date().toISOString(),
              status: 'active'
            });
          }
        }
      }
    }

    alerts.total_alerts = alerts.alerts.length;
    logger.info(`Generated ${alerts.total_alerts} KPI alerts`);
    return { success: true, data: alerts };
  } catch (error) {
    logger.error('Error getting KPI alerts:', error);
    throw error;
  }
}