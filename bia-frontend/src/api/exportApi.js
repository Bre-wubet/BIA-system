const API_BASE_URL = 'http://localhost:3000/api';

// Export API
export const getAllExports = async () => {
  const response = await fetch(`${API_BASE_URL}/exports`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch exports');
  }
  
  return response.json();
};

export const getExport = async (id) => {
  const response = await fetch(`${API_BASE_URL}/exports/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch export');
  }
  
  return response.json();
};

export const createExport = async (exportData) => {
  const response = await fetch(`${API_BASE_URL}/exports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(exportData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to create export');
  }
  
  return response.json();
};

export const updateExport = async (id, exportData) => {
  const response = await fetch(`${API_BASE_URL}/exports/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(exportData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to update export');
  }
  
  return response.json();
};

export const deleteExport = async (id) => {
  const response = await fetch(`${API_BASE_URL}/exports/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete export');
  }
  
  return response.json();
};

export const duplicateExport = async (id) => {
  const response = await fetch(`${API_BASE_URL}/exports/${id}/duplicate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to duplicate export');
  }
  
  return response.json();
};

export const runExport = async (id, parameters = {}) => {
  const response = await fetch(`${API_BASE_URL}/exports/${id}/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(parameters)
  });
  
  if (!response.ok) {
    throw new Error('Failed to run export');
  }
  
  return response.json();
};

export const downloadExport = async (id) => {
  const response = await fetch(`${API_BASE_URL}/exports/${id}/download`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to download export');
  }
  
  // Create blob and trigger download
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `export-${id}.${blob.type.split('/')[1]}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  
  return blob;
};

export const scheduleExport = async (id, scheduleData) => {
  const response = await fetch(`${API_BASE_URL}/exports/${id}/schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(scheduleData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to schedule export');
  }
  
  return response.json();
};

export const getExportStats = async () => {
  const response = await fetch(`${API_BASE_URL}/exports/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch export stats');
  }
  
  return response.json();
};

export const getExportHistory = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  const response = await fetch(`${API_BASE_URL}/exports/history?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch export history');
  }
  
  return response.json();
};

export const getExportTemplates = async () => {
  const response = await fetch(`${API_BASE_URL}/exports/templates`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch export templates');
  }
  
  return response.json();
};

export const createExportFromTemplate = async (templateId) => {
  const response = await fetch(`${API_BASE_URL}/exports/templates/${templateId}/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to create export from template');
  }
  
  return response.json();
};

export const getExportProgress = async (id) => {
  const response = await fetch(`${API_BASE_URL}/exports/${id}/progress`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch export progress');
  }
  
  return response.json();
};

export const cancelExport = async (id) => {
  const response = await fetch(`${API_BASE_URL}/exports/${id}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to cancel export');
  }
  
  return response.json();
};

export const retryExport = async (id) => {
  const response = await fetch(`${API_BASE_URL}/exports/${id}/retry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to retry export');
  }
  
  return response.json();
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
