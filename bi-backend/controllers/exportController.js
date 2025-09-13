// controllers/exportController.js
import exportService from '../services/exportService.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import logger from '../config/logger.js';

// Export data with filters
export const exportData = asyncHandler(async (req, res) => {
  const { dataType, filters = {}, format = 'csv', includeHeaders = true } = req.body;

  const exportResult = await exportService.exportData(dataType, filters, format, includeHeaders);

  if (!exportResult) {
    return res.status(400).json({
      success: false,
      message: 'Invalid export request'
    });
  }

  logger.info(`Data exported: ${dataType} in ${format} format by user ${req.users?.id || 1}`);

  res.json({
    success: true,
    message: 'Data exported successfully',
    data: exportResult
  });
});

// Export dashboard data
export const exportDashboard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { format = 'csv', includeWidgets = true, includeData = true } = req.query;

  const exportResult = await exportService.exportDashboard(id, { format, includeWidgets, includeData });

  if (!exportResult) {
    return res.status(404).json({
      success: false,
      message: 'Dashboard not found'
    });
  }

  logger.info(`Dashboard exported: ${id} in ${format} format by user ${req.users?.id || 1}`);

  res.json({
    success: true,
    message: 'Dashboard exported successfully',
    data: exportResult
  });
});

// Export report data
export const exportReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { format = 'csv', includeMetadata = true, includeData = true } = req.query;

  const exportResult = await exportService.exportReport(id, { format, includeMetadata, includeData });

  if (!exportResult) {
    return res.status(404).json({
      success: false,
      message: 'Report not found'
    });
  }

  logger.info(`Report exported: ${id} in ${format} format by user ${req.users?.id || 1}`);

  res.json({
    success: true,
    message: 'Report exported successfully',
    data: exportResult
  });
});

// Export analytics data
export const exportAnalytics = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { format = 'csv', timeRange = '30d', filters = {} } = req.query;

  const exportResult = await exportService.exportAnalytics(type, { format, timeRange, filters });

  if (!exportResult) {
    return res.status(400).json({
      success: false,
      message: 'Invalid analytics type'
    });
  }

  logger.info(`Analytics exported: ${type} in ${format} format by user ${req.users?.id || 1}`);

  res.json({
    success: true,
    message: 'Analytics exported successfully',
    data: exportResult
  });
});

// Export KPI data
export const exportKPI = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { format = 'csv', includeHistory = false, timeRange = '30d' } = req.query;

  const exportResult = await exportService.exportKPI(id, { format, includeHistory, timeRange });

  if (!exportResult) {
    return res.status(404).json({
      success: false,
      message: 'KPI not found'
    });
  }

  logger.info(`KPI exported: ${id} in ${format} format by user ${req.users?.id || 1}`);

  res.json({
    success: true,
    message: 'KPI exported successfully',
    data: exportResult
  });
});

// Batch export multiple items
export const batchExport = asyncHandler(async (req, res) => {
  const { exports } = req.body; // Array of export requests

  const jobId = await exportService.batchExport(exports, req.users?.id || 1);

  if (!jobId) {
    return res.status(400).json({
      success: false,
      message: 'Invalid batch export request'
    });
  }

  logger.info(`Batch export started: ${jobId} with ${exports.length} items by user ${req.users?.id || 1}`);

  res.json({
    success: true,
    message: 'Batch export started successfully',
    data: { jobId }
  });
});

// Get batch export status
export const getBatchExportStatus = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const status = await exportService.getBatchExportStatus(jobId);

  if (!status) {
    return res.status(404).json({
      success: false,
      message: 'Export job not found'
    });
  }

  res.json({
    success: true,
    data: status
  });
});

// Get export templates
export const getExportTemplates = asyncHandler(async (req, res) => {
  const { type } = req.query;

  const templates = await exportService.getExportTemplates(type);

  res.json({
    success: true,
    data: templates
  });
});

// Create export template
export const createExportTemplate = asyncHandler(async (req, res) => {
  const { name, type, config, created_by } = req.body;

  const templateData = {
    name,
    type,
    config,
    created_by: created_by || req.users?.id || 1
  };

  const template = await exportService.createExportTemplate(templateData);

  logger.info(`Export template created: ${template.id} by user ${req.users?.id || 1}`);

  res.status(201).json({
    success: true,
    message: 'Export template created successfully',
    data: template
  });
});

// Update export template
export const updateExportTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const template = await exportService.updateExportTemplate(id, updateData);

  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Export template not found'
    });
  }

  logger.info(`Export template updated: ${id} by user ${req.users?.id || 1}`);

  res.json({
    success: true,
    message: 'Export template updated successfully',
    data: template
  });
});

// Delete export template
export const deleteExportTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await exportService.deleteExportTemplate(id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: 'Export template not found'
    });
  }

  logger.info(`Export template deleted: ${id} by user ${req.users?.id || 1}`);

  res.json({
    success: true,
    message: 'Export template deleted successfully'
  });
});

// Get export history
export const getExportHistory = asyncHandler(async (req, res) => {
  const { type, format, limit = 50, offset = 0 } = req.query;

  const history = await exportService.getExportHistory({ type, format, limit, offset });

  res.json({
    success: true,
    data: history
  });
});

// Get specific export history item
export const getExportHistoryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const historyItem = await exportService.getExportHistoryItem(id);

  if (!historyItem) {
    return res.status(404).json({
      success: false,
      message: 'Export history item not found'
    });
  }

  res.json({
    success: true,
    data: historyItem
  });
});

// Get export jobs
export const getExportJobs = asyncHandler(async (req, res) => {
  const { status, limit = 50, offset = 0 } = req.query;

  const jobs = await exportService.getExportJobs({ status, limit, offset });

  res.json({
    success: true,
    data: jobs
  });
});

// Get specific export job
export const getExportJob = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const job = await exportService.getExportJob(id);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Export job not found'
    });
  }

  res.json({
    success: true,
    data: job
  });
});

// Cancel export job
export const cancelExportJob = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const cancelled = await exportService.cancelExportJob(id);

  if (!cancelled) {
    return res.status(404).json({
      success: false,
      message: 'Export job not found or cannot be cancelled'
    });
  }

  logger.info(`Export job cancelled: ${id} by user ${req.users?.id || 1}`);

  res.json({
    success: true,
    message: 'Export job cancelled successfully'
  });
});

// Download exported file
export const downloadExport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const fileData = await exportService.downloadExport(id);

    if (!fileData) {
      return res.status(404).json({
        success: false,
        message: 'Export file not found'
      });
    }

    const { filename, content, contentType, fileSize } = fileData;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', fileSize);

    logger.info(`Export file downloaded: ${id} by user ${req.users?.id || 1}`);

    res.send(content);
  } catch (error) {
    logger.error(`Error downloading export ${id}:`, error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get export statistics
export const getExportStatistics = asyncHandler(async (req, res) => {
  const { timeRange = '30d' } = req.query;

  const statistics = await exportService.getExportStatistics(timeRange);

  res.json({
    success: true,
    data: statistics
  });
});

// Validate export request
export const validateExportRequest = asyncHandler(async (req, res) => {
  const { dataType, filters, format } = req.body;

  const validation = await exportService.validateExportRequest(dataType, filters, format);

  res.json({
    success: true,
    data: validation
  });
});

