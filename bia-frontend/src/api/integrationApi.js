import apiClient from './authApi';

export const BASE_URL = 'http://localhost:3000';

export const apiPaths = {
        CREATE_DATA_SOURCE: `${BASE_URL}/api/data-source`,
        GET_ALL_DATA_SOURCES: `${BASE_URL}/api/data-source`,
        GET_DATA_SOURCE_TYPES: `${BASE_URL}/api/data-source/types`,
        GET_ACTIVE_DATA_SOURCES: `${BASE_URL}/api/data-source/active`,
        GET_SYNC_STATUS: `${BASE_URL}/api/data-source/status`,

        GET_DATA_SOURCE_BY_ID: (id) => `${BASE_URL}/api/data-source/${id}`,
        UPDATE_DATA_SOURCE: (id) => `${BASE_URL}/api/data-source/${id}`,
        UPDATE_DATA_SOURCE_STATUS: (id) => `${BASE_URL}/api/data-source/${id}/status`,
        DELETE_DATA_SOURCE: (id) => `${BASE_URL}/api/data-source/${id}/hard`,
        SOFT_DELETE_DATA_SOURCE: (id) => `${BASE_URL}/api/data-source/${id}/soft-delete`,
        GET_DATA_SOURCES_BY_MODULE_AND_TYPE: (moduleName, dataSourceType) => `${BASE_URL}/api/data-source?moduleName=${moduleName}&dataSourceType=${dataSourceType}`,
        TEST_CONNECTION_BY_ID: (id) => `${BASE_URL}/api/data-source/${id}/test`,
        SYNC_DATA_SOURCE: (id) => `${BASE_URL}/api/data-source/${id}/sync`,
        
        
        GET_SYNC_LOGS: `${BASE_URL}/api/data-source/sync/logs`,
        GET_SYNC_LOGS_BY_ID: (dataSourceId) => `${BASE_URL}/api/data-source/sync/logs/${dataSourceId}/paginate`,
        GET_SYNC_LOGS_PAGINATED: `${BASE_URL}/api/data-source/sync/logs/paginated`,
        GET_LOG_RECORDS_BY_LOG_ID: (logId) => `${BASE_URL}/api/data-source/sync/logs/${logId}/records`,
        GET_DATA_SOURCES_NEEDING_SYNC: `${BASE_URL}/api/sync/needing-sync`,
        SYNC_MULTIPLE_DATA_SOURCES: `${BASE_URL}/api/data-source/sync/batch`,
        TEST_MULTIPLE_CONNECTIONS: `${BASE_URL}/api/data-source/test/batch`,
        GET_SYNC_QUEUE: `${BASE_URL}/api/data-source/sync/queue`,

        // MAPPING_RULES API ROUTES
        GET_RULES: (id) => `${BASE_URL}/api/data-source/${id}/mappings`,
        ADD_RULE: (id) => `${BASE_URL}/api/data-source/${id}/mappings`,
        UPDATE_RULE: (id, mapId) => `${BASE_URL}/api/data-source/${id}/mappings/${mapId}`,
        DELETE_RULE: (id, mapId) => `${BASE_URL}/api/data-source/${id}/mappings/${mapId}`
    }

// Data Source API functions
export const createDataSource = async (dataSourceData) => {
    try {
        const response = await apiClient.post(apiPaths.CREATE_DATA_SOURCE, dataSourceData);
        return response.data;
    } catch (error) {
        console.error('Error creating data source:', error);
        throw error;
    }
};

export const getAllDataSources = async (params = {}) => {
    try {
        const response = await apiClient.get(apiPaths.GET_ALL_DATA_SOURCES, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching data sources:', error);
        throw error;
    }
};

export const getDataSourceTypes = async () => {
    try {
        const response = await apiClient.get(apiPaths.GET_DATA_SOURCE_TYPES);
        return response.data;
    } catch (error) {
        console.error('Error fetching data source types:', error);
        throw error;
    }
};

export const getActiveDataSources = async () => {
    try {
        const response = await apiClient.get(apiPaths.GET_ACTIVE_DATA_SOURCES);
        return response.data;
    } catch (error) {
        console.error('Error fetching active data sources:', error);
        throw error;
    }
};

export const getDataSource = async (id) => {
    try {
        const response = await apiClient.get(apiPaths.GET_DATA_SOURCE_BY_ID(id));
        return response.data;
    } catch (error) {
        console.error(`Error fetching data source ${id}:`, error);
        throw error;
    }
};

export const updateDataSource = async (id, updateData) => {
    try {
        const response = await apiClient.put(apiPaths.UPDATE_DATA_SOURCE(id), updateData);
        return response.data;
    } catch (error) {
        console.error(`Error updating data source ${id}:`, error);
        throw error;
    }
};

export const updateDataSourceStatus = async (id, status) => {
    try {
        const response = await apiClient.put(apiPaths.UPDATE_DATA_SOURCE_STATUS(id), { status });
        return response.data;
    } catch (error) {
        console.error(`Error updating data source status ${id}:`, error);
        throw error;
    }
};

export const deleteDataSource = async (id) => {
    try {
        const response = await apiClient.delete(apiPaths.DELETE_DATA_SOURCE(id));
        return response.data;
    } catch (error) {
        console.error(`Error deleting data source ${id}:`, error);
        throw error;
    }
};

export const softDeleteDataSource = async (id) => {
    try {
        const response = await apiClient.delete(apiPaths.SOFT_DELETE_DATA_SOURCE(id));
        return response.data;
    } catch (error) {
        console.error(`Error soft deleting data source ${id}:`, error);
        throw error;
    }
};

export const getDataSourcesByModuleAndType = async (moduleName = "", dataSourceType = "") => {
  try {
    const response = await apiClient.get(`${BASE_URL}/api/data-source`, {
      params: {
        moduleName: moduleName || undefined,
        dataSourceType: dataSourceType || undefined,
      },
      paramsSerializer: (params) => 
        new URLSearchParams(params).toString(), // ensures proper encoding
    });

    return { success: true, data: response.data.data ?? [] };
  } catch (error) {
    console.error(
      `Error fetching data sources for module "${moduleName}" and type "${dataSourceType}":`,
      error
    );

    return { success: false, data: [], error: error.message };
  }
};


export const testConnection = async (id) => {
    try {
        const response = await apiClient.post(apiPaths.TEST_CONNECTION_BY_ID(id));
        return response.data;
    } catch (error) {
        console.error(`Error testing connection for data source ${id}:`, error);
        throw error;
    }
};

export const syncDataSource = async (id, options = {}) => {
    try {
        const response = await apiClient.post(apiPaths.SYNC_DATA_SOURCE(id), options);
        return response.data;
    } catch (error) {
        console.error(`Error syncing data source ${id}:`, error);
        throw error;
    }
};

export const getSyncQueue = async () => {
    try {
        const response = await apiClient.get(apiPaths.GET_SYNC_QUEUE);
        return response.data;
    } catch (error) {
        console.error('Error fetching sync queue:', error);
        throw error;
    }
};
export const getIntegrationLogs = async () => {
    try {
        const response = await apiClient.get(apiPaths.GET_SYNC_LOGS);
        return response.data;
    } catch (error) {
        console.error('Error fetching sync logs:', error);
        throw error;
    }
}
export const getDataSyncHistoryByDataSourceId = async (dataSourceId) => {
    try {
        const response = await apiClient.get(apiPaths.GET_SYNC_LOGS_BY_ID(dataSourceId));
        return response.data;
    } catch (error) {
        console.error(`Error fetching data source ${dataSourceId}:`, error);
        throw error;
    }
};

export const getPaginatedIntegrationLogs = async (page = 1, limit = 10, filters = {}) => {
    try {
        const params = {
            page,
            limit,
            ...filters
        };
        const response = await apiClient.get(apiPaths.GET_SYNC_LOGS_PAGINATED, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching paginated sync logs:', error);
        throw error;
    }
}

export const getLogRecordsByLogId = async (logId, page = 1, limit = 50) => {
    try {
        const response = await apiClient.get(apiPaths.GET_LOG_RECORDS_BY_LOG_ID(logId), { params: { page, limit } });
        return response.data;
    } catch (error) {
        console.error(`Error fetching log records for log ${logId}:`, error);
        throw error;
    }
};
export const getDataSourcesNeedingSync = async () => {
    try {
        const response = await apiClient.get(apiPaths.GET_DATA_SOURCES_NEEDING_SYNC);
        return response.data;
    } catch (error) {
        console.error('Error fetching data sources needing sync:', error);
        throw error;
    }
};

export const syncMultipleDataSources = async (ids) => {
    try {
        const response = await apiClient.post(apiPaths.SYNC_MULTIPLE_DATA_SOURCES, { dataSourceIds: ids });
        return response.data;
    } catch (error) {
        console.error('Error syncing multiple data sources:', error);
        throw error;
    }
};

export const testMultipleConnections = async (dataSourceIds) => {
    try {
        const response = await apiClient.post(apiPaths.TEST_MULTIPLE_CONNECTIONS, { dataSourceIds });
        return response.data;
    } catch (error) {
        console.error('Error testing multiple connections:', error);
        throw error;
    }
};
export const importData = async (dataSourceIds) => {

};
export const exportData = async (dataSourceIds) => {

};
// Mapping Rules API functions
export const getMappingRules = async (dataSourceId) => {
    try {
        const response = await apiClient.get(apiPaths.GET_RULES(dataSourceId));
        return response.data;
    } catch (error) {
        console.error(`Error fetching mapping rules for data source ${dataSourceId}:`, error);
        throw error;
    }
};

export const addMappingRule = async (dataSourceId, ruleData) => {
    try {
        const response = await apiClient.post(apiPaths.ADD_RULE(dataSourceId), ruleData);
        return response.data;
    } catch (error) {
        console.error(`Error adding mapping rule for data source ${dataSourceId}:`, error);
        throw error;
    }
};

export const updateMappingRule = async (dataSourceId, mapId, ruleData) => {
    try {
        const response = await apiClient.put(apiPaths.UPDATE_RULE(dataSourceId, mapId), ruleData);
        return response.data;
    } catch (error) {
        console.error(`Error updating mapping rule ${mapId} for data source ${dataSourceId}:`, error);
        throw error;
    }
};

export const deleteMappingRule = async (dataSourceId, mapId) => {
    try {
        const response = await apiClient.delete(apiPaths.DELETE_RULE(dataSourceId, mapId));
        return response.data;
    } catch (error) {
        console.error(`Error deleting mapping rule ${mapId} for data source ${dataSourceId}:`, error);
        throw error;
    }
};

export default {
    createDataSource,
    getAllDataSources,
    getDataSourceTypes,
    getActiveDataSources,
    getDataSource,
    updateDataSource,
    updateDataSourceStatus,
    deleteDataSource,
    testConnection,
    syncDataSource,
    getSyncQueue,
    getIntegrationLogs,
    getPaginatedIntegrationLogs,
    getDataSourcesNeedingSync,
    syncMultipleDataSources,
    testMultipleConnections,
    getMappingRules,
    addMappingRule,
    updateMappingRule,
    deleteMappingRule
};