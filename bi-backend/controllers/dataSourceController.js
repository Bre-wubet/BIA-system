import * as dataIntegrationService from '../services/dataSourceService.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import logger from '../config/logger.js';
import DataSource from '../models/DataSource.js';
import IntegratinLog from '../models/Data_Integration_Log.js'
import LogRecord from '../models/Data_Integration_Log_Record.js';
import e from 'express';

// Create a new data source
export const createDataSource = asyncHandler(async (req, res) => {
  const { name, type, connection_config, module, status, query, sync_frequency, created_by } = req.body;
    if (!req.user && !created_by) {
      return res.status(400).json({ success: false, message: 'User information missing' });
    }

  const dataSourceData = {
    name,
    type,
    connection_config,
    module,
    status,
    query,
    sync_frequency,
    created_by: req.users?.id || 1
  };

  const dataSource = await DataSource.createDataSource(dataSourceData);

  logger.info(`Data source created: ${dataSource.id} by user ${created_by || req.users?.id || 1}`);

  res.status(201).json(dataSource);
});

// Get all data sources
export const getAllDataSources = asyncHandler(async (req, res) => {
  const { type, status, limit = 50, offset = 0 } = req.query;

  const dataSources = await DataSource.getAllDataSources({ type, status, limit, offset });

  res.json({
    success: true,
    data: dataSources
  });
});

// Get a specific data source
export const getDataSource = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const dataSource = await DataSource.findById(id);

  if (!dataSource) {
    return res.status(404).json({
      success: false,
      message: "Data source not found",
    });
  }

  res.status(200).json({
    success: true,
    data: dataSource,
  });
});

// Update a data source
export const updateDataSource = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const result = await DataSource.updateDataSource(id, updateData);

  if (!result.success) {
    return res.status(404).json(result);
  }
  logger.info(`Data source updated: ${id} by user ${req.users.id}`);

   res.json({
    success: true,
    message: 'Data source updated successfully',
    data: result.data
  });
});

// Update Data Source Status
export const updateDataSourceStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const updated = await DataSource.updateStatus(id, status);

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'Data source not found'
    });
  }

  logger.info(`Data source status updated: ${id} -> ${status} by user ${req.users?.id || 'system'}`);

  res.json({
    success: true,
    message: 'Data source status updated successfully',
    data: updated
  });
});

// Delete a data source
export const softDeleteDataSource = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await DataSource.softDeleteDataSource(id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: 'Data source not found'
    });
  }

  logger.info(`Data source deleted: ${id} by user ${req.users.id}`);

  res.json({
    success: true,
    message: 'Data source deleted successfully'
  });
});

// Filter data sources by module and type
export const getDataSourcesByModuleAndType = asyncHandler(async (req, res) => {
  try {
    let { moduleName, dataSourceType } = req.query;

    // Normalize input (optional; model already handles case-insensitive)
    moduleName = moduleName?.trim() || null;
    dataSourceType = dataSourceType?.trim() || null;

    // Fetch from model
    const dataSources = await DataSource.getSourcesByModuleAndType(moduleName, dataSourceType);

    // Always return 200 with data array (even if empty)
    res.json({
      success: true,
      count: dataSources.length,
      filters: { moduleName, dataSourceType },
      data: dataSources
    });
  } catch (error) {
    console.error("Error filtering data sources:", error);
    res.status(500).json({
      success: false,
      message: "Failed to filter data sources",
      error: error.message
    });
  }
});


export const deleteDataSource = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await DataSource.deleteDataSource(id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: 'Data source not found'
    });
  }

  logger.info(`Data source deleted: ${id} by user ${req.users?.id}`);

  res.json({
    success: true,
    message: 'Data source deleted successfully',
    data: deleted.data
  });
});

// get data source types
export const getDataSourceTypes = asyncHandler(async (req, res) => {
  const types = await DataSource.getDataSourceTypes();

  res.json({
    success: true,
    data: types
  });
})

// Get sync status
export const getActiveDataSources = asyncHandler(async (req, res) => {
  const dataSources = await DataSource.getActiveDataSources();
  
  res.json({
    success: true,
    count: dataSources.length,
    data: dataSources
  });
});

// Get data sources needing sync
export const getDataSourcesNeedingSync = asyncHandler(async (req, res) => {
  const dataSources = await DataSource.getDataSourcesNeedingSync();
  
  res.status(200).json({
    success: true,
    count: dataSources.length,
    data: dataSources
  });
});
// Test data source connection
export const testConnectionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const testResult = await dataIntegrationService.testConnection(id);

  if (!testResult) {
    return res.status(404).json({
      success: false,
      message: 'Data source not found'
    });
  }

  logger.info(`Connection test performed: ${id} by user ${req.users?.id}`);

  res.json({
    success: true,
    message: 'Connection test completed',
    data: testResult
  });
});

// sync data source
export const syncDataSource = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { force = false } = req.body;
  
  const syncResult = await dataIntegrationService.syncDataSource(id, { force });
  
  if (!syncResult) {
    return res.status(404).json({
      success: false,
      message: 'Data source not found'
    });
  }

  logger.info(`Data source synced: ${id} by user ${req.users?.id}`);
  
  res.json(syncResult);
});

// Get sync queue
export const getSyncQueue = asyncHandler(async (req, res) => {
  try {
    const queue = await dataIntegrationService.getSyncQueue();
    res.json({ success: true, queue });
  } catch (error) {
    logger.error('Get sync queue failed in controller:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get sync status
export const getSyncStatus = asyncHandler(async (req, res) => {
  const status = await dataIntegrationService.getSyncStatus();
  
  res.json(status);
});

export async function testMultipleConnections(req, res) {
  try {
    const { dataSourceIds } = req.body;

    if (!Array.isArray(dataSourceIds) || dataSourceIds.length === 0) {
      return res.status(400).json({ error: 'dataSourceIds must be a non-empty array' });
    }

    logger.info('Batch connection test started', { dataSourceIds });

    const results = await Promise.all(
      dataSourceIds.map(async (id) => {
        try {
          const result = await dataIntegrationService.testConnection(id);
          return { dataSourceId: id, success: true, ...result };
        } catch (error) {
          logger.error('Batch connection test failed for data source:', { id, error: error.message });
          return { dataSourceId: id, success: false, message: error.message };
        }
      })
    );

    logger.info('Batch connection test completed', { resultsCount: results.length });
    res.json({ success: true, results });
  } catch (error) {
    logger.error('Error in batch connection test endpoint:', error);
    res.status(500).json({ success: false, message: 'Batch connection test failed', error: error.message });
  }
}

export async function syncMultipleDataSources(req, res) {
  try {
    const { dataSourceIds } = req.body;

    if (!Array.isArray(dataSourceIds) || dataSourceIds.length === 0) {
      return res.status(400).json({ error: 'dataSourceIds must be a non-empty array' });
    }

    logger.info('Batch sync started', { dataSourceIds });

    // Run syncs in parallel
    const results = await Promise.all(
      dataSourceIds.map(async (id) => {
        try {
          const result = await dataIntegrationService.performSync(id);
          return { dataSourceId: id, success: true, ...result };
        } catch (error) {
          logger.error('Batch sync error for data source:', { id, error: error.message });
          return { dataSourceId: id, success: false, message: error.message };
        }
      })
    );

    logger.info('Batch sync completed', { resultsCount: results.length });
    res.json({ success: true, results });
  } catch (error) {
    logger.error('Error in batch sync endpoint:', error);
    res.status(500).json({ success: false, message: 'Batch sync failed', error: error.message });
  }
}

export async function getIntegrationLogs(req, res) {
   const limit = parseInt(req.query.limit, 10) || 50;

  try {
    const result = await IntegratinLog.getRecentLogs(limit);

    // If using pg module, rows contain the actual data
    res.status(200).json({
      success: true,
      data: result.rows,
      message: `Fetched ${result.rows.length} recent logs`,
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent logs',
      error: error.message,
    });
  }
}
export const fetchSyncHistoryByDataSourceId = asyncHandler(async (req, res) => {
  const { dataSourceId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const result = await IntegratinLog.getSyncHistoryByDataSourceId(dataSourceId, parseInt(page), parseInt(limit));

  res.status(200).json({
    success: true,
    message: 'Sync history fetched successfully',
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    },
    data: result.data
  });
});
export const getPaginatedIntegrationLogs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      source_system,
      dateFrom,
      dateTo,
      sortBy = 'run_timestamp',
      order = 'DESC'
    } = req.query;

    // Build filters object
    const filters = {};
    if (status) filters.status = status;
    if (source_system) filters.source_system = source_system;
    if (dateFrom && dateTo) {
      filters.dateFrom = dateFrom;
      filters.dateTo = dateTo;
    }

    // Validate numeric params
    const pageNum = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    const limitNum = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;

    // Validate sort fields
    const validSortFields = ['id', 'source_system', 'record_count', 'status', 'run_timestamp', 'created_at'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'run_timestamp';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Call the model function directly
    const result = await IntegratinLog.getPaginatedLogs({
      page: pageNum,
      limit: limitNum,
      filters,
      sortBy: safeSortBy,
      order: safeOrder
    });

    res.status(200).json({
      success: true,
      message: 'Integration logs fetched successfully',
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      },
      data: result.data
    });
  } catch (error) {
    console.error('Error fetching paginated logs:', error);
    next(error);
  }
};

export const getLogRecordsByLogId = asyncHandler(async (req, res) => {
  const { logId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const result = await LogRecord.getByLogId(parseInt(logId, 10), {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 50
  });

  const normalized = Array.isArray(result.data)
    ? result.data.map(r => ({
        ...r,
        record: typeof r.record === 'string' ? (() => { try { return JSON.parse(r.record); } catch { return {}; } })() : r.record
      }))
    : [];

  // Fallback for legacy logs that lack stored records
  if (normalized.length === 0) {
    return res.status(200).json({
      success: true,
      pagination: { total: 0, page: parseInt(page, 10) || 1, limit: parseInt(limit, 10) || 50, totalPages: 0 },
      data: []
    });
  }

  res.status(200).json({
    success: true,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    },
    data: normalized
  });
});