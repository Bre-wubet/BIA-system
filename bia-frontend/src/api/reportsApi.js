import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
const apiPaths = {
  REPORTS: `${BASE_URL}/reports`,
  REPORT_BY_ID: (id) => `${BASE_URL}/reports/${id}`,
  REPORT_STATS: `${BASE_URL}/reports/stats`,
  REPORT_TYPES: `${BASE_URL}/reports/types`,
  REPORT_CATEGORIES: `${BASE_URL}/reports/categories`,
  REPORT_TEMPLATES: `${BASE_URL}/reports/templates`,
  SCHEDULED_REPORTS: `${BASE_URL}/reports/scheduled`,

  // Report operations
  REPORT_RUN: (id) => `${BASE_URL}/reports/${id}/run`,
  REPORT_GENERATE: (id) => `${BASE_URL}/reports/${id}/generate`,
  REPORT_EXECUTE: (id) => `${BASE_URL}/reports/${id}/execute`,
  REPORT_EXPORT: (id) => `${BASE_URL}/reports/${id}/export`,
  REPORT_DUPLICATE: (id) => `${BASE_URL}/reports/${id}/duplicate`,

  // Scheduling
  REPORT_SCHEDULE: (id) => `${BASE_URL}/reports/${id}/schedule`,

  // Recipients
  REPORT_RECIPIENTS: (id) => `${BASE_URL}/reports/${id}/recipients`,

  // Sharing
  REPORT_SHARE: (id) => `${BASE_URL}/reports/${id}/share`,

  // History and logs
  REPORT_HISTORY: (id) => `${BASE_URL}/reports/${id}/history`,
  REPORT_LOGS: (id) => `${BASE_URL}/reports/${id}/logs`,

  // Template operations
  CREATE_FROM_TEMPLATE: (id) => `${BASE_URL}/reports/templates/${id}/create`,

  // Batch operations
  BATCH_GENERATE: `${BASE_URL}/reports/batch/generate`,
  BATCH_SCHEDULE: `${BASE_URL}/reports/batch/schedule`
};

// Report CRUD operations
export const createReport = async (reportData) => {
  try {
    const response = await axios.post(apiPaths.REPORTS, reportData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAllReports = async () => {
  try {
    const response = await axios.get(apiPaths.REPORTS);
    return response.data || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getReportById = async (id) => {
  try {
    const response = await axios.get(apiPaths.REPORT_BY_ID(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateReport = async (id, updateData) => {
  try {
    const response = await axios.put(apiPaths.REPORT_BY_ID(id), updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteReport = async (id) => {
  try {
    const response = await axios.delete(apiPaths.REPORT_BY_ID(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Report metadata and filtering
export const getReportStats = async () => {
  try {
    const response = await axios.get(apiPaths.REPORT_STATS);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getReportTypes = async () => {
  try {
    const response = await axios.get(apiPaths.REPORT_TYPES);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getReportCategories = async () => {
  try {
    const response = await axios.get(apiPaths.REPORT_CATEGORIES);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getReportTemplates = async () => {
  try {
    const response = await axios.get(apiPaths.REPORT_TEMPLATES);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getScheduledReports = async () => {
  try {
    const response = await axios.get(apiPaths.SCHEDULED_REPORTS);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Report execution and generation
export const runReport = async (id, parameters = {}) => {
  try {
    const response = await axios.post(apiPaths.REPORT_RUN(id), parameters);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const generateReport = async (id, format = 'pdf', parameters = {}) => {
  try {
    const response = await axios.get(apiPaths.REPORT_GENERATE(id), {
      params: { format, ...parameters }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const executeReport = async (id, parameters = {}) => {
  try {
    const response = await axios.post(apiPaths.REPORT_EXECUTE(id), parameters);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const exportReport = async (id, format = 'csv', parameters = {}) => {
  try {
    const response = await axios.get(apiPaths.REPORT_EXPORT(id), {
      params: { format, ...parameters }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const duplicateReport = async (id) => {
  try {
    const response = await axios.post(apiPaths.REPORT_DUPLICATE(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Scheduling operations
export const updateReportSchedule = async (id, schedule) => {
  try {
    const response = await axios.put(apiPaths.REPORT_SCHEDULE(id), { schedule });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const scheduleReport = async (id, schedule) => {
  try {
    const response = await axios.put(apiPaths.REPORT_SCHEDULE(id), { schedule });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const removeReportSchedule = async (id) => {
  try {
    const response = await axios.delete(apiPaths.REPORT_SCHEDULE(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Recipients management
export const updateReportRecipients = async (id, recipients) => {
  try {
    const response = await axios.put(apiPaths.REPORT_RECIPIENTS(id), { recipients });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getReportRecipients = async (id) => {
  try {
    const response = await axios.get(apiPaths.REPORT_RECIPIENTS(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Sharing
export const shareReport = async (id, shareData) => {
  try {
    const response = await axios.post(apiPaths.REPORT_SHARE(id), shareData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// History and logs
export const getReportHistory = async (id) => {
  try {
    const response = await axios.get(apiPaths.REPORT_HISTORY(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getReportLogs = async (id) => {
  try {
    const response = await axios.get(apiPaths.REPORT_LOGS(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Template operations
export const createReportFromTemplate = async (templateId, reportData) => {
  try {
    const response = await axios.post(apiPaths.CREATE_FROM_TEMPLATE(templateId), reportData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Batch operations
export const generateMultipleReports = async (reportIds, options = {}) => {
  try {
    const response = await axios.post(apiPaths.BATCH_GENERATE, {
      reportIds,
      ...options
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const scheduleMultipleReports = async (scheduleData) => {
  try {
    const response = await axios.post(apiPaths.BATCH_SCHEDULE, scheduleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};