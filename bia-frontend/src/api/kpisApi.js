import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
const apiPaths = {
  KPIS: `${BASE_URL}/kpis`,
  KPI_BY_ID: (id) => `${BASE_URL}/kpis/${id}`,
  KPI_CATEGORIES: `${BASE_URL}/kpis/categories`,
  KPI_BY_CATEGORY: (category) => `${BASE_URL}/kpis/category/${category}`,
  KPI_NEEDING_UPDATE: `${BASE_URL}/kpis/needing-update`,
  KPI_STATS: `${BASE_URL}/kpis/stats`,

  KPI_CALCULATE: (id) => `${BASE_URL}/kpis/${id}/calculate`,
  KPI_VALUES: (id) => `${BASE_URL}/kpis/${id}/values`,
  KPI_LATEST_VALUE: (id) => `${BASE_URL}/kpis/${id}/latest-value`,
  KPI_VALUES_HISTORY: (id) => `${BASE_URL}/kpis/${id}/history-values`,
  BATCH_CALCULATE: `${BASE_URL}/kpis/batch`
};

// KPI CRUD operations
export const createKPI = async (kpiData) => {
  try {
    const response = await axios.post(apiPaths.KPIS, kpiData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAllKPIsByCategory = async (category = null) => {
  try {
    const url = category ? `${apiPaths.KPI_BY_CATEGORY(category)}` : apiPaths.KPIS;
    const response = await axios.get(url);
    return response.data || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getKPIById = async (id) => {
  try {
    const response = await axios.get(apiPaths.KPI_BY_ID(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAllKPIs = async () => {
  try {
    const response = await axios.get(apiPaths.KPIS);
    return response.data || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateKPI = async (id, updateData) => {
  try {
    const response = await axios.put(apiPaths.KPI_BY_ID(id), updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteKPI = async (id) => {
  try {
    const response = await axios.delete(apiPaths.KPI_BY_ID(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// KPI categories and filtering
export const getKPICategories = async () => {
  try {
    const response = await axios.get(apiPaths.KPI_CATEGORIES);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getKPIsByCategory = async (category) => {
  try {
    const response = await axios.get(apiPaths.KPI_BY_CATEGORY(category));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getKPIsNeedingUpdate = async () => {
  try {
    const response = await axios.get(apiPaths.KPI_NEEDING_UPDATE);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getKPIStats = async () => {
  try {
    const response = await axios.get(apiPaths.KPI_STATS);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// KPI calculation and values
export const calculateKPIValue = async (id, dataSourceId = null) => {
  try {
    const response = await axios.post(apiPaths.KPI_CALCULATE(id), {
      data_source_id: dataSourceId
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getKPILatestValue = async (id, limit = 100) => {
  try {
    const response = await axios.get(apiPaths.KPI_LATEST_VALUE(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
export const getKPIValuesHistory = async (id, limit = 100) => {
  try {
    const response = await axios.get(apiPaths.KPI_VALUES_HISTORY(id), {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
// Batch operations
export const batchCalculateKPIs = async () => {
  try {
    const response = await axios.post(apiPaths.BATCH_CALCULATE);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
