import csvExporter from '../utils/exporters/exportToCSV.js';
import pdfExporter from '../utils/exportToPDF.js';
import excelExporter from '../utils/exportToExcel.js';
import logger from '../config/logger.js';
import Dashboard from '../models/Dashboard.js';
import Report from '../models/Report.js';
import KPI from '../models/KPI.js';
import Export from '../models/Export.js';
import path from 'path';
import fs from 'fs';

// Centralized constants
const DATA_TYPES = ['dashboard', 'report', 'kpi', 'analytics'];
const FORMATS = ['csv', 'pdf', 'xlsx', 'excel', 'json'];

export function createExportService() {
  // internal state (like class fields)
  const exportQueue = [];
  const exportJobs = new Map();
  let isProcessing = false;

  // format handlers
  const formatHandlers = {
    csv: (data, options = {}) => csvExporter.convertToCSV(data, options),
    pdf: async (data, options = {}) => await pdfExporter.convertToPDF(data, options),
    xlsx: async (data, options = {}) => await excelExporter.convertToExcel(data, options),
    excel: async (data, options = {}) => await excelExporter.convertToExcel(data, options),
    json: (data) => JSON.stringify(data, null, 2),
  };

  // ---- Core methods ----

  async function exportData(dataType, filters = {}, format = 'csv', includeHeaders = true, userId = null) {
    if (!DATA_TYPES.includes(dataType)) {
      throw new Error(`Unsupported data type: ${dataType}`);
    }
    if (!FORMATS.includes(format)) {
      throw new Error(`Unsupported format: ${format}`);
    }

    let jobId = null;
    try {
      // Create export record
      jobId = generateJobId();
      const exportRecord = await Export.createExport({
        jobId,
        userId,
        dataType,
        format,
        status: 'processing',
        filters,
        options: { includeHeaders }
      });

      // Update status to processing
      await Export.updateStatus(jobId, 'processing');

      const data = await getDataByType(dataType, filters);
      const formattedData = await formatHandlers[format](data, { includeHeaders });
      
      // Generate filename
      const filename = `${dataType}_export_${Date.now()}.${format}`;
      const filePath = await saveExportFile(formattedData, filename, format);

      // Update export record with completion
      await Export.updateStatus(jobId, 'completed', {
        filename,
        filePath,
        fileSize: Buffer.byteLength(formattedData)
      });

      logger.info(`Export completed: ${jobId} - ${filename}`);
      return { jobId, filename, filePath, data: formattedData };
    } catch (error) {
      logger.error(`Error exporting data [${dataType}]:`, error);
      
      // Update export record with error
      if (jobId) {
        await Export.updateStatus(jobId, 'failed', {
          errorMessage: error.message
        });
      }
      
      throw new Error(`Export failed for ${dataType}: ${error.message}`);
    }
  }

  async function getDataByType(dataType, filters) {
    switch (dataType) {
      case 'dashboard': return getDashboardData(filters);
      case 'report': return getReportData(filters);
      case 'kpi': return getKPIData(filters);
      case 'analytics': return getAnalyticsData(filters);
      default: throw new Error(`Unknown data type: ${dataType}`);
    }
  }

  async function exportDashboard(id, options = {}) {
    const { format = 'csv', includeWidgets = true, includeData = true } = options;

    const dashboard = await Dashboard.findById(id);
    if (!dashboard) return null;

    const exportData = {
      id: dashboard.id,
      name: dashboard.name,
      description: dashboard.description,
      created_at: dashboard.created_at,
      updated_at: dashboard.updated_at,
    };

    if (includeWidgets) exportData.widgets = dashboard.widgets || [];
    if (includeData) exportData.data = await getDashboardWidgetData(dashboard);

    return formatHandlers[format](exportData);
  }

  async function batchExport(exports, userId) {
    const jobId = generateJobId();
    const job = {
      id: jobId,
      userId,
      status: 'pending',
      total: exports.length,
      completed: 0,
      failed: 0,
      results: [],
      created_at: new Date().toISOString(),
    };

    exportJobs.set(jobId, job);
    addToQueue(jobId, exports);

    logger.info(`Batch export started: ${jobId} (${exports.length} items)`);
    return jobId;
  }

  // ---- Queue Management ----

  function generateJobId() {
    return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  function addToQueue(jobId, exports) {
    exportQueue.push({ jobId, exports });
    processQueue();
  }

  async function processQueue() {
    if (isProcessing || exportQueue.length === 0) return;
    isProcessing = true;

    try {
      while (exportQueue.length > 0) {
        const { jobId, exports } = exportQueue.shift();
        await processBatchExport(jobId, exports);
      }
    } catch (error) {
      logger.error('Error processing export queue:', error);
    } finally {
      isProcessing = false;
    }
  }

  async function processBatchExport(jobId, exports) {
    const job = exportJobs.get(jobId);
    if (!job) return;

    job.status = 'processing';
    job.updated_at = new Date().toISOString();

    try {
      for (const exportRequest of exports) {
        try {
          const result = await exportData(
            exportRequest.dataType,
            exportRequest.filters,
            exportRequest.format
          );

          job.results.push({ dataType: exportRequest.dataType, status: 'completed', result });
          job.completed++;
        } catch (error) {
          job.results.push({ dataType: exportRequest.dataType, status: 'failed', error: error.message });
          job.failed++;
        }
      }
      job.status = 'completed';
    } catch (error) {
      job.status = 'failed';
      logger.error(`Batch export failed: ${jobId}`, error);
    }

    job.updated_at = new Date().toISOString();
  }

  // ---- Mock Data Providers ----

  async function getDashboardData() {
    return { dashboards: [{ id: 1, name: 'Sales Dashboard', widgets: 5 }] };
  }

  async function getReportData() {
    return { reports: [{ id: 1, name: 'Monthly Sales Report', type: 'sales' }] };
  }

  async function getKPIData() {
    return { kpis: [{ id: 1, name: 'Sales Growth', value: 15.5, target: 10 }] };
  }

  async function getAnalyticsData() {
    return { analytics: { totalKPIs: 25, onTarget: 18 } };
  }

  async function getDashboardWidgetData(dashboard) {
    return { widgets: [{ id: 1, type: 'chart', data: [10, 20, 30] }] };
  }

  // ---- Utility Functions ----

  async function saveExportFile(data, filename, format) {
    const exportsDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    const filePath = path.join(exportsDir, filename);
    fs.writeFileSync(filePath, data);
    return filePath;
  }

  // ---- Export Job Management ----
  async function getExportJobs({ status, limit = 50, offset = 0, userId } = {}) {
    try {
      logger.info('Getting export jobs:', { status, limit, offset, userId });
      const exports = await Export.getAllExports({ status, limit, offset, userId });
      logger.info('Export jobs result:', { count: exports?.length, exports });
      return exports;
    } catch (error) {
      logger.error('Error getting export jobs:', error);
      throw error;
    }
  }

  async function getExportJob(jobId) {
    try {
      const exportRecord = await Export.findByJobId(jobId);
      return exportRecord;
    } catch (error) {
      logger.error('Error getting export job:', error);
      throw error;
    }
  }

  async function cancelExportJob(jobId) {
    try {
      const exportRecord = await Export.findByJobId(jobId);
      if (!exportRecord || exportRecord.status === 'completed' || exportRecord.status === 'failed') {
        return false;
      }
      
      await Export.updateStatus(jobId, 'cancelled');
      logger.info(`Export job cancelled: ${jobId}`);
      return true;
    } catch (error) {
      logger.error('Error cancelling export job:', error);
      throw error;
    }
  }

  // ---- Export History ----
  async function getExportHistory({ type, format, limit = 50, offset = 0, userId } = {}) {
    try {
      const exports = await Export.getAllExports({ 
        dataType: type, 
        format, 
        limit, 
        offset, 
        userId 
      });
      return exports;
    } catch (error) {
      logger.error('Error getting export history:', error);
      throw error;
    }
  }

  async function getExportHistoryItem(id) {
    try {
      const exportRecord = await Export.findById(id);
      return exportRecord;
    } catch (error) {
      logger.error('Error getting export history item:', error);
      throw error;
    }
  }

  // ---- Export Statistics ----
  async function getExportStatistics(timeRange = '30d', userId = null) {
    try {
      logger.info('Getting export statistics:', { timeRange, userId });
      const stats = await Export.getExportStats({ userId, timeRange });
      const exportsByType = await Export.getExportsByType({ timeRange });
      
      logger.info('Export stats result:', { stats, exportsByType });
      
      // Handle case where stats is undefined or null
      if (!stats) {
        logger.warn('Export stats returned undefined, using default values');
        return {
          total_exports: 0,
          completed_exports: 0,
          failed_exports: 0,
          processing_exports: 0,
          pending_exports: 0,
          averageProcessingTime: 'N/A',
          total_file_size: 0,
          pdf_exports: 0,
          csv_exports: 0,
          excel_exports: 0,
          json_exports: 0,
          exportsByType: {}
        };
      }
      
      return {
        ...stats,
        averageProcessingTime: stats.avg_processing_time_seconds 
          ? `${Math.round(stats.avg_processing_time_seconds / 60 * 100) / 100} minutes`
          : 'N/A',
        exportsByType: (exportsByType || []).reduce((acc, item) => {
          acc[item.data_type] = (acc[item.data_type] || 0) + parseInt(item.count);
          return acc;
        }, {})
      };
    } catch (error) {
      logger.error('Error getting export statistics:', error);
      throw error;
    }
  }

  // ---- Download Functionality ----
  async function downloadExport(exportId) {
    try {
      const exportRecord = await Export.findById(exportId);
      if (!exportRecord) {
        return null;
      }

      if (exportRecord.status !== 'completed') {
        throw new Error('Export not completed yet');
      }

      if (!exportRecord.file_path) {
        throw new Error('Export file not found');
      }

      const fs = require('fs');
      const path = require('path');
      
      if (!fs.existsSync(exportRecord.file_path)) {
        throw new Error('Export file no longer exists');
      }

      const fileContent = fs.readFileSync(exportRecord.file_path);
      const contentType = getContentType(exportRecord.format);

      return {
        filename: exportRecord.filename,
        content: fileContent,
        contentType,
        fileSize: exportRecord.file_size
      };
    } catch (error) {
      logger.error('Error downloading export:', error);
      throw error;
    }
  }

  function getContentType(format) {
    const contentTypes = {
      'pdf': 'application/pdf',
      'csv': 'text/csv',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'json': 'application/json'
    };
    return contentTypes[format] || 'application/octet-stream';
  }

  // ---- Export Templates ----
  async function getExportTemplates(type = null) {
    try {
      // Mock templates for now - in a real app, these would come from a database
      const templates = [
        {
          id: 1,
          name: 'Sales Report Export',
          description: 'Export sales data with filters',
          data_type: 'report',
          format: 'csv',
          filters: { date_range: 'last_30_days', status: 'completed' },
          options: { include_headers: true, delimiter: ',' }
        },
        {
          id: 2,
          name: 'Dashboard Export',
          description: 'Export dashboard data as PDF',
          data_type: 'dashboard',
          format: 'pdf',
          filters: {},
          options: { include_charts: true, page_size: 'A4' }
        },
        {
          id: 3,
          name: 'KPI Summary',
          description: 'Export KPI data as Excel',
          data_type: 'kpi',
          format: 'excel',
          filters: { period: 'monthly' },
          options: { include_trends: true, format_numbers: true }
        },
        {
          id: 4,
          name: 'Analytics Data',
          description: 'Export analytics data as JSON',
          data_type: 'analytics',
          format: 'json',
          filters: { category: 'user_behavior' },
          options: { pretty_print: true }
        }
      ];

      // Filter by type if specified
      if (type) {
        return templates.filter(template => template.data_type === type);
      }

      return templates;
    } catch (error) {
      logger.error('Error getting export templates:', error);
      throw error;
    }
  }

  // ---- Export Validation ----
  async function validateExportRequest(dataType, filters, format) {
    try {
      const validation = {
        isValid: true,
        errors: [],
        warnings: []
      };

      // Validate data type
      if (!DATA_TYPES.includes(dataType)) {
        validation.isValid = false;
        validation.errors.push(`Invalid data type: ${dataType}`);
      }

      // Validate format
      if (!FORMATS.includes(format)) {
        validation.isValid = false;
        validation.errors.push(`Invalid format: ${format}`);
      }

      // Validate filters
      if (filters && typeof filters !== 'object') {
        validation.isValid = false;
        validation.errors.push('Filters must be an object');
      }

      return validation;
    } catch (error) {
      logger.error('Error validating export request:', error);
      throw error;
    }
  }

  // ---- Public API ----
  return {
    exportData,
    exportDashboard,
    batchExport,
    getDataByType,
    getDashboardData,
    getReportData,
    getKPIData,
    getAnalyticsData,
    getExportJobs,
    getExportJob,
    cancelExportJob,
    getExportHistory,
    getExportHistoryItem,
    getExportStatistics,
    downloadExport,
    validateExportRequest,
    getExportTemplates
  };
}

// default singleton
const exportService = createExportService();
export default exportService;
