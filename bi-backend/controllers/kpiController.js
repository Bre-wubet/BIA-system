import * as kpiService from '../services/kpiService.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import KpiValue from '../models/Kpi_value.js';
import logger from '../config/logger.js';

// Create a new KPI
export const createKPI = asyncHandler(async (req, res) => {
  const { name, description, category, formula, type, unit, target_value, refresh_frequency, dashboard_id } = req.body;

  const kpiData = {
    name,
    description,
    category,
    formula,
    type,
    unit,
    target_value,
    refresh_frequency,
    dashboard_id,
    created_by: req.users?.id || 1 // Default user ID for now
  };

  const kpi = await kpiService.createKPI(kpiData);

  logger.info(`KPI created: ${kpi.data.id} by user ${kpiData.created_by}`);

  res.status(201).json(kpi);
});

// Get all KPIs
export const getAllKPIs = asyncHandler(async (req, res) => {
  const { category, limit = 50, offset = 0 } = req.query;

  let kpis;
  if (category) {
    kpis = await kpiService.getKPIsByCategory(category);
  } else {
    kpis = await kpiService.getAllKPIs();
  }

  res.json({
    success: true,
    data: kpis.data,
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset),
      total: kpis.data.length
    }
  });
});

// Get KPI by ID
export const getKPIById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const kpi = await kpiService.getKPIById(id);

  if (!kpi.success) {
    return res.status(404).json(kpi);
  }

  res.json(kpi);
});

// Update KPI
export const updateKPI = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const result = await kpiService.updateKPI(id, updateData);

  if (!result.success) {
    return res.status(404).json(result);
  }

  logger.info(`KPI updated: ${id} by user ${req.users?.id || 'system'}`);

  res.json({
    success: true,
    message: 'KPI updated successfully',
    data: result.data
  });
});

// Delete KPI
export const deleteKPI = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await kpiService.deleteKPI(id);

  if (!result.success) {
    return res.status(404).json(result);
  }

  logger.info(`KPI deleted: ${id} by user ${req.users?.id || 'system'}`);

  res.json({
    success: true,
    message: 'KPI deleted successfully',
    data: result.data
  });
});

// Get KPI categories
export const getKPICategories = asyncHandler(async (req, res) => {
  const categories = await kpiService.getKPICategories();

  res.json({
    success: true,
    data: categories.data
  });
});

// Get KPIs by category
export const getKPIsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;

  const kpis = await kpiService.getKPIsByCategory(category);

  res.json({
    success: true,
    data: kpis.data
  });
});

// Get KPIs needing update
export const getKPIsNeedingUpdate = asyncHandler(async (req, res) => {
  const kpis = await kpiService.getKPIsNeedingUpdate();

  res.json({
    success: true,
    data: kpis.data
  });
});

// Calculate KPI value
export const calculateKpiValue = async (req, res) => {
  try {
    const { id: kpiId } = req.params;
    const result = await KpiValue.calculateAndInsertKpiValue(kpiId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error calculating KPI value:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get KPI values over time
export const getLatestKpiValue = async (req, res) => {
  try {
    const { id: kpiId } = req.params;
    const value = await KpiValue.getLatestKpiValue(kpiId);
    if (!value) {
      return res.status(404).json({ success: false, message: "No values found" });
    }
    res.json({ success: true, data: value });
  } catch (error) {
    console.error("Error fetching latest KPI value:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// refresh all KPIs
export const refreshAllKpis = async (req, res) => {
  try {
    const results = await KpiValue.refreshAllKpis();
    res.json({ success: true, data: results });
  } catch (error) {
    console.error("Error refreshing all KPIs:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// In kpiController.js
export const getKpiValuesHistory = async (req, res) => {
  try {
    const { id: kpiId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 50; // ensure number

    // Fetch history from model
    const rows = await KpiValue.getKpiValuesHistory(kpiId, limit);
    // Ensure numeric conversion
    const formattedRows = rows.map(r => ({
      ...r,
      value: r.value !== null ? Number(r.value) : null
    }));
    res.json(formattedRows);
  } catch (error) {
    console.error("Error fetching KPI values history:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// Get KPI statistics
export const getKPIStats = asyncHandler(async (req, res) => {
  try {
    // Get basic KPI counts
    const totalKPIs = await kpiService.getAllKPIs();
    const categories = await kpiService.getKPICategories();
    const needingUpdate = await kpiService.getKPIsNeedingUpdate();

    const stats = {
      total_kpis: totalKPIs.data.length,
      total_categories: categories.data.length,
      kpis_needing_update: needingUpdate.data.length,
      calculation_status: 'active'
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting KPI stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get KPI statistics'
    });
  }
});
