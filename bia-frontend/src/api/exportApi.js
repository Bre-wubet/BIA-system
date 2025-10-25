import apiClient from './authApi';

const API_BASE_URL = 'http://localhost:3000/api';

// Export API
export const getAllExports = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/exports`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getExport = async (id) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/exports/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createExport = async (exportData) => {
  try {
    const response = await apiClient.post(`${API_BASE_URL}/exports`, exportData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateExport = async (id, exportData) => {
  try {
    const response = await apiClient.put(`${API_BASE_URL}/exports/${id}`, exportData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteExport = async (id) => {
  try {
    const response = await apiClient.delete(`${API_BASE_URL}/exports/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const duplicateExport = async (id) => {
  try {
    const response = await apiClient.post(`${API_BASE_URL}/exports/${id}/duplicate`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const runExport = async (id, parameters = {}) => {
  try {
    const response = await apiClient.post(`${API_BASE_URL}/exports/${id}/run`, parameters);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const downloadExport = async (id) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/exports/${id}/download`, {
      responseType: 'blob'
    });
    
    // Create blob and trigger download
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${id}.${blob.type.split('/')[1]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    return blob;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const scheduleExport = async (id, scheduleData) => {
  try {
    const response = await apiClient.post(`${API_BASE_URL}/exports/${id}/schedule`, scheduleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getExportStats = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/exports/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getExportHistory = async (filters = {}) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/exports/history`, {
      params: filters
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getExportTemplates = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/exports/templates`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createExportFromTemplate = async (templateId) => {
  try {
    const response = await apiClient.post(`${API_BASE_URL}/exports/templates/${templateId}/create`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getExportProgress = async (id) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/exports/${id}/progress`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const cancelExport = async (id) => {
  try {
    const response = await apiClient.post(`${API_BASE_URL}/exports/${id}/cancel`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const retryExport = async (id) => {
  try {
    const response = await apiClient.post(`${API_BASE_URL}/exports/${id}/retry`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Export format utilities
export const exportToCSV = (data, filename = 'export.csv') => {
  const csvContent = [
    data.columns.join(','),
    ...data.rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const exportToJSON = (data, filename = 'export.json') => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const exportToExcel = async (data, filename = 'export.xlsx') => {
  // This would require a library like xlsx
  // For now, we'll export as CSV
  exportToCSV(data, filename.replace('.xlsx', '.csv'));
};