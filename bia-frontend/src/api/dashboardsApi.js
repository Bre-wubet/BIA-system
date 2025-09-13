import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
const apiPaths = {
  DASHBOARDS: `${BASE_URL}/dashboards`,
  DASHBOARD_BY_ID: (id) => `${BASE_URL}/dashboards/${id}`,
  DASHBOARD_WITH_DATA: (id) => `${BASE_URL}/dashboards/${id}/with-data`,
  DASHBOARD_LAYOUT: (id) => `${BASE_URL}/dashboards/${id}/layout`,
  DASHBOARD_DUPLICATE: (id) => `${BASE_URL}/dashboards/${id}/duplicate`,
  DASHBOARD_TEMPLATES: `${BASE_URL}/dashboards/templates`,
  CREATE_FROM_TEMPLATE: `${BASE_URL}/dashboards/from-template`,
  SET_DEFAULT: `${BASE_URL}/dashboards/set-default`,
  SEARCH: `${BASE_URL}/dashboards/search`,
  STATS: `${BASE_URL}/dashboards/stats`,
  PUBLIC: `${BASE_URL}/dashboards/public`,
  DEFAULT: `${BASE_URL}/dashboards/default`
};

// Dashboard CRUD operations
export const createDashboard = async (dashboardData) => {
  try {
    const response = await axios.post(apiPaths.DASHBOARDS, dashboardData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAllDashboards = async () => {
  try {
    const response = await axios.get(apiPaths.DASHBOARDS);
    return response.data || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDashboardById = async (id) => {
  try {
    const response = await axios.get(apiPaths.DASHBOARD_BY_ID(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDashboardWithData = async (id) => {
  try {
    const response = await axios.get(apiPaths.DASHBOARD_WITH_DATA(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateDashboard = async (id, updateData) => {
  try {
    const response = await axios.put(apiPaths.DASHBOARD_BY_ID(id), updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteDashboard = async (id) => {
  try {
    const response = await axios.delete(apiPaths.DASHBOARD_BY_ID(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Dashboard layout and configuration
export const updateDashboardLayout = async (id, layout) => {
  try {
    const response = await axios.put(apiPaths.DASHBOARD_LAYOUT(id), { layout });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Dashboard operations
export const duplicateDashboard = async (id, name) => {
  try {
    const response = await axios.post(apiPaths.DASHBOARD_DUPLICATE(id), { name });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDashboardTemplates = async () => {
  try {
    const response = await axios.get(apiPaths.DASHBOARD_TEMPLATES);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createFromTemplate = async (templateId, name, description) => {
  try {
    const response = await axios.post(apiPaths.CREATE_FROM_TEMPLATE, {
      templateId,
      name,
      description
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Default dashboard management
export const setDefaultDashboard = async (dashboardId) => {
  try {
    const response = await axios.post(apiPaths.SET_DEFAULT, { dashboardId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDefaultDashboard = async () => {
  try {
    const response = await axios.get(apiPaths.DEFAULT);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Dashboard search and statistics
export const searchDashboards = async (query, limit = 10) => {
  try {
    const response = await axios.get(apiPaths.SEARCH, {
      params: { q: query, limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await axios.get(apiPaths.STATS);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getPublicDashboards = async () => {
  try {
    const response = await axios.get(apiPaths.PUBLIC);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
export const getDashboardAnalytics = async () => {

};
export const shareDashboard = async () => {

};