import csvExporter from '../utils/exportToCSV.js';
import logger from '../config/logger.js';
import Dashboard from '../models/Dashboard.js';
import Report from '../models/Report.js';
import KPI from '../models/KPI.js';

// Centralized constants
const DATA_TYPES = ['dashboard', 'report', 'kpi', 'analytics'];
const FORMATS = ['csv', 'json'];

export function createExportService() {
  // internal state (like class fields)
  const exportQueue = [];
  const exportJobs = new Map();
  let isProcessing = false;

  // format handlers
  const formatHandlers = {
    csv: (data, options = {}) => csvExporter.convertToCSV(data, options),
    json: (data) => JSON.stringify(data, null, 2),
  };

  // ---- Core methods ----

  async function exportData(dataType, filters = {}, format = 'csv', includeHeaders = true) {
    if (!DATA_TYPES.includes(dataType)) {
      throw new Error(`Unsupported data type: ${dataType}`);
    }
    if (!FORMATS.includes(format)) {
      throw new Error(`Unsupported format: ${format}`);
    }

    try {
      const data = await getDataByType(dataType, filters);
      return formatHandlers[format](data, { includeHeaders });
    } catch (error) {
      logger.error(`Error exporting data [${dataType}]:`, error);
      throw new Error(`Export failed for ${dataType}`);
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
  };
}

// default singleton
const exportService = createExportService();
export default exportService;
