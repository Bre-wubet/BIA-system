import apiClient from './authApi';

const BASE_URL = 'http://localhost:3000/api';
const apiPaths = {
  WIDGETS: `${BASE_URL}/widgets`,
  WIDGET_BY_ID: (id) => `${BASE_URL}/widgets/${id}`,
  WIDGET_TYPES: `${BASE_URL}/widgets/types`,
  WIDGET_STATS: (id) => `${BASE_URL}/widgets/stats/${id}`,
  WIDGET_CONFIG: (id) => `${BASE_URL}/widgets/${id}/config`,
  WIDGET_POSITION: (id) => `${BASE_URL}/widgets/${id}/position`,
  WIDGET_DATA: (id) => `${BASE_URL}/widgets/${id}/data`,
  WIDGET_PREVIEW: `${BASE_URL}/widgets/preview`,
  VALIDATE_CONFIG: `${BASE_URL}/widgets/validate-config`,
  WIDGETS_BY_DASHBOARD: (dashboardId) => `${BASE_URL}/widgets/${dashboardId}`,
  WIDGET_DUPLICATE: (id) => `${BASE_URL}/widgets/${id}/duplicate`,
  BATCH_UPDATE_POSITIONS: `${BASE_URL}/widgets/batch/positions`
};

// Widget CRUD operations
export const getAllWidgets = async () => {
  try {
    const response = await apiClient.get(apiPaths.WIDGETS);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
export const createWidget = async (widgetData) => {
  try {
    const response = await apiClient.post(apiPaths.WIDGETS, widgetData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getWidgetById = async (id) => {
  try {
    const response = await apiClient.get(apiPaths.WIDGET_BY_ID(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateWidget = async (id, updateData) => {
  try {
    const response = await apiClient.put(apiPaths.WIDGET_BY_ID(id), updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteWidget = async (id) => {
  try {
    const response = await apiClient.delete(apiPaths.WIDGET_BY_ID(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Widget types and statistics
export const getWidgetTypes = async () => {
  try {
    const response = await apiClient.get(apiPaths.WIDGET_TYPES);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getWidgetStats = async (dashboardId = null) => {
  try {
    const url = dashboardId 
      ? `${apiPaths.WIDGET_STATS}?dashboardId=${dashboardId}`
      : apiPaths.WIDGET_STATS;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Widget configuration and positioning
export const updateWidgetConfig = async (id, config) => {
  try {
    const response = await apiClient.put(apiPaths.WIDGET_CONFIG(id), { config });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateWidgetPosition = async (id, position) => {
  try {
    const response = await apiClient.put(apiPaths.WIDGET_POSITION(id), { position });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Widget data and preview
export const getWidgetData = async (id) => {
  try {
    const response = await apiClient.get(apiPaths.WIDGET_DATA(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getWidgetPreview = async (previewData) => {
  try {
    const response = await apiClient.post(apiPaths.WIDGET_PREVIEW, previewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Widget validation
export const validateWidgetConfig = async (widgetType, config) => {
  try {
    const response = await apiClient.post(apiPaths.VALIDATE_CONFIG, {
      widgetType,
      config
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Dashboard-specific widget operations
export const getWidgetsByDashboardId = async (dashboardId) => {
  try {
    const response = await apiClient.get(apiPaths.WIDGETS_BY_DASHBOARD(dashboardId));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Widget operations
export const duplicateWidget = async (id, dashboardId = null, title = null) => {
  try {
    const response = await apiClient.post(apiPaths.WIDGET_DUPLICATE(id), {
      dashboard_id: dashboardId,
      title
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Batch operations
export const batchUpdateWidgetPositions = async (positions) => {
  try {
    const response = await apiClient.post(apiPaths.BATCH_UPDATE_POSITIONS, {
      positions
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
