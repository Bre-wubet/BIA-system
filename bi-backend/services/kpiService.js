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
