import apiClient from './authApi';

const BASE_URL = 'http://localhost:3000/api';
const apiPaths = {
  EXPORT_DATA: `${BASE_URL}/export/data`,
  EXPORT_JOBS: `${BASE_URL}/export/jobs`,
  EXPORT_JOB_BY_ID: (id) => `${BASE_URL}/export/jobs/${id}`,

  // Export by type
  EXPORT_DASHBOARD: (id) => `${BASE_URL}/export/dashboard/${id}`,
  EXPORT_REPORT: (id) => `${BASE_URL}/export/report/${id}`,
  EXPORT_ANALYTICS: (type) => `${BASE_URL}/export/analytics/${type}`,
  EXPORT_KPI: (id) => `${BASE_URL}/export/kpi/${id}`,

  // Batch export
  BATCH_EXPORT: `${BASE_URL}/export/batch`,
  BATCH_EXPORT_STATUS: (jobId) => `${BASE_URL}/export/batch/status/${jobId}`,

  // Export templates
  EXPORT_TEMPLATES: `${BASE_URL}/export/templates`,
  EXPORT_TEMPLATE_BY_ID: (id) => `${BASE_URL}/export/templates/${id}`,

  // Export history
  EXPORT_HISTORY: `${BASE_URL}/export/history`,
  EXPORT_HISTORY_ITEM: (id) => `${BASE_URL}/export/history/${id}`,

  // Download and file management
  DOWNLOAD_EXPORT: (id) => `${BASE_URL}/export/download/${id}`,
  EXPORT_STATS: `${BASE_URL}/export/stats`,
  VALIDATE_EXPORT: `${BASE_URL}/export/validate`
};

// Export data operations
export const exportData = async (dataType, filters = {}, format = 'csv', includeHeaders = true) => {
  try {
    const response = await apiClient.post(apiPaths.EXPORT_DATA, {
      dataType,
      format,
      filters,
      includeHeaders
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const exportDataByQuery = async (format = 'csv', filename = null, queryParams = {}) => {
  try {
    const response = await apiClient.get(apiPaths.EXPORT_DATA, {
      params: { format, filename, ...queryParams }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Export jobs management
export const getExportJobs = async () => {
  try {
    const response = await apiClient.get(apiPaths.EXPORT_JOBS);
    return response.data || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getExportJob = async (id) => {
  try {
    const response = await apiClient.get(apiPaths.EXPORT_JOB_BY_ID(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const cancelExportJob = async (id) => {
  try {
    const response = await apiClient.delete(apiPaths.EXPORT_JOB_BY_ID(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Export by specific types
export const exportDashboard = async (id, format = 'pdf', options = {}) => {
  try {
    const response = await apiClient.get(apiPaths.EXPORT_DASHBOARD(id), {
      params: { format, ...options }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const exportReport = async (id, format = 'pdf', options = {}) => {
  try {
    const response = await apiClient.get(apiPaths.EXPORT_REPORT(id), {
      params: { format, ...options }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const exportAnalytics = async (type, format = 'csv', options = {}) => {
  try {
    const response = await apiClient.get(apiPaths.EXPORT_ANALYTICS(type), {
      params: { format, ...options }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const exportKPI = async (id, format = 'csv', options = {}) => {
  try {
    const response = await apiClient.get(apiPaths.EXPORT_KPI(id), {
      params: { format, ...options }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Batch export operations
export const batchExport = async (exportRequests) => {
  try {
    const response = await apiClient.post(apiPaths.BATCH_EXPORT, exportRequests);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getBatchExportStatus = async (jobId) => {
  try {
    const response = await apiClient.get(apiPaths.BATCH_EXPORT_STATUS(jobId));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Export templates management
export const getExportTemplates = async () => {
  try {
    const response = await apiClient.get(apiPaths.EXPORT_TEMPLATES);
    return response.data || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createExportTemplate = async (templateData) => {
  try {
    const response = await apiClient.post(apiPaths.EXPORT_TEMPLATES, templateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateExportTemplate = async (id, templateData) => {
  try {
    const response = await apiClient.put(apiPaths.EXPORT_TEMPLATE_BY_ID(id), templateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteExportTemplate = async (id) => {
  try {
    const response = await apiClient.delete(apiPaths.EXPORT_TEMPLATE_BY_ID(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Export history
export const getExportHistory = async (filters = {}) => {
  try {
    const response = await apiClient.get(apiPaths.EXPORT_HISTORY, {
      params: filters
    });
    return response.data || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getExportHistoryItem = async (id) => {
  try {
    const response = await apiClient.get(apiPaths.EXPORT_HISTORY_ITEM(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Download and file management
export const downloadExport = async (id) => {
  try {
    const response = await apiClient.get(apiPaths.DOWNLOAD_EXPORT(id), {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getExportStatistics = async () => {
  try {
    const response = await apiClient.get(apiPaths.EXPORT_STATS);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const validateExportRequest = async (exportRequest) => {
  try {
    const response = await apiClient.post(apiPaths.VALIDATE_EXPORT, exportRequest);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Utility functions for common export operations
export const exportToCSV = async (data, filename = 'export.csv') => {
  return exportData(data, 'csv', filename);
};

export const exportToPDF = async (data, filename = 'export.pdf') => {
  return exportData(data, 'pdf', filename);
};

export const exportToExcel = async (data, filename = 'export.xlsx') => {
  return exportData(data, 'excel', filename);
};

export const exportToJSON = async (data, filename = 'export.json') => {
  return exportData(data, 'json', filename);
};
