import Report from '../models/Report.js';
import logger from '../config/logger.js';
import csvExporter from '../utils/exportToCSV.js';

export function createReportService() {
  // Internal state
  const reportQueue = [];
  let isProcessing = false;

  // ---------------- Core CRUD ----------------
  async function createReport(reportData) {
    try {
      const report = await Report.create(reportData);
      logger.info(`Report created: ${report.id}`);
      return report;
    } catch (error) {
      logger.error('Error creating report:', error);
      throw error;
    }
  }

  async function getReport(id) {
    try {
      return await Report.findById(id);
    } catch (error) {
      logger.error('Error getting report:', error);
      throw error;
    }
  }

  async function getAllReports({ type, category, limit, offset }) {
    try {
      let reports;

      if (type) {
        reports = await Report.findByType(type);
      } else if (category) {
        reports = await Report.findByCategory(category);
      } else {
        reports = await Report.getAllReports();
      }

      // Apply pagination
      if (limit && offset !== undefined) {
        reports = reports.slice(offset, offset + parseInt(limit));
      }

      return reports;
    } catch (error) {
      logger.error('Error getting reports:', error);
      throw error;
    }
  }

  async function updateReport(id, updateData) {
    try {
      const report = await Report.update(id, updateData);
      logger.info(`Report updated: ${id}`);
      return report;
    } catch (error) {
      logger.error('Error updating report:', error);
      throw error;
    }
  }

  async function deleteReport(id) {
    try {
      const deleted = await Report.delete(id);
      if (deleted) logger.info(`Report deleted: ${id}`);
      return deleted;
    } catch (error) {
      logger.error('Error deleting report:', error);
      throw error;
    }
  }

  async function duplicateReport(id, userId, newName) {
    try {
      const original = await Report.findById(id);
      if (!original) return null;

      const duplicated = await Report.duplicate(id, userId, newName);
      logger.info(`Report duplicated: ${id} -> ${duplicated.id}`);
      return duplicated;
    } catch (error) {
      logger.error('Error duplicating report:', error);
      throw error;
    }
  }

  // ---------------- Execution ----------------
  async function generateReport(id, options = {}) {
    try {
      const { format = 'json', filters = {} } = options;
      const report = await Report.findById(id);

      if (!report) return null;

      const reportData = await executeReportQuery(report, filters);

      return format === 'csv'
        ? csvExporter.convertToCSV(reportData)
        : reportData;
    } catch (error) {
      logger.error('Error generating report:', error);
      throw error;
    }
  }

  async function executeReport(id, options = {}) {
    try {
      const { format = 'json', filters = {} } = options;
      const report = await Report.findById(id);

      if (!report) return null;

      const reportData = await executeReportQuery(report, filters);

      await logReportExecution(id, 'executed', { format, filters });

      return format === 'csv'
        ? csvExporter.convertToCSV(reportData)
        : reportData;
    } catch (error) {
      logger.error('Error executing report:', error);
      throw error;
    }
  }

  async function executeReportQuery(report, filters) {
    const { type, query_config } = report;

    switch (type) {
      case 'sales': return generateSalesReport(query_config, filters);
      case 'finance': return generateFinanceReport(query_config, filters);
      case 'hr': return generateHRReport(query_config, filters);
      case 'operations': return generateOperationsReport(query_config, filters);
      case 'analytics': return generateAnalyticsReport(query_config, filters);
      default: return generateGenericReport(query_config, filters);
    }
  }

  // ---------------- Generators (Mocks) ----------------
  async function generateSalesReport(config, filters) {
    return {
      reportType: 'sales',
      generatedAt: new Date().toISOString(),
      data: {
        totalSales: 1250000,
        salesGrowth: 15.5,
        topProducts: [
          { name: 'Product A', sales: 250000, growth: 12.3 },
          { name: 'Product B', sales: 180000, growth: 8.7 },
          { name: 'Product C', sales: 150000, growth: 22.1 }
        ],
        salesByRegion: [
          { region: 'North', sales: 450000 },
          { region: 'South', sales: 380000 },
          { region: 'East', sales: 320000 },
          { region: 'West', sales: 100000 }
        ]
      }
    };
  }

  async function generateFinanceReport(config, filters) {
    return { reportType: 'finance', generatedAt: new Date().toISOString(), data: { netProfit: 650000 } };
  }

  async function generateHRReport(config, filters) {
    return { reportType: 'hr', generatedAt: new Date().toISOString(), data: { totalEmployees: 150 } };
  }

  async function generateOperationsReport(config, filters) {
    return { reportType: 'operations', generatedAt: new Date().toISOString(), data: { efficiency: 87.5 } };
  }

  async function generateAnalyticsReport(config, filters) {
    return { reportType: 'analytics', generatedAt: new Date().toISOString(), data: { kpis: { totalKPIs: 25 } } };
  }

  async function generateGenericReport(config, filters) {
    return { reportType: 'generic', generatedAt: new Date().toISOString(), data: { config, filters } };
  }

  // ---------------- Scheduling ----------------
  async function updateSchedule(id, schedule) {
    try {
      const updated = await Report.updateSchedule(id, schedule);
      logger.info(`Report schedule updated: ${id}`);
      return updated;
    } catch (error) {
      logger.error('Error updating report schedule:', error);
      throw error;
    }
  }

  async function removeSchedule(id) {
    return updateSchedule(id, null);
  }

  async function updateRecipients(id, recipients) {
    try {
      const updated = await Report.updateRecipients(id, recipients);
      logger.info(`Report recipients updated: ${id}`);
      return updated;
    } catch (error) {
      logger.error('Error updating recipients:', error);
      throw error;
    }
  }

  async function getRecipients(id) {
    try {
      const report = await Report.findById(id);
      return report ? report.recipients : null;
    } catch (error) {
      logger.error('Error getting recipients:', error);
      throw error;
    }
  }

  async function getReportHistory(id, { limit = 20, offset = 0 } = {}) {
    // mock history
    const history = [
      { id: 1, reportId: id, executedAt: new Date().toISOString(), status: 'completed' }
    ];
    return history.slice(offset, offset + limit);
  }

  async function getReportLogs(id, { limit = 50, offset = 0 } = {}) {
    // mock logs
    const logs = [
      { id: 1, reportId: id, level: 'info', message: 'Report generated', timestamp: new Date().toISOString() }
    ];
    return logs.slice(offset, offset + limit);
  }

  async function getScheduledReports() {
    return Report.getScheduledReports();
  }

  async function getReportTypes() {
    return Report.getReportTypes();
  }

  async function getReportCategories() {
    return Report.getCategories();
  }

  // ---------------- Multiple / Batch ----------------
  async function generateMultipleReports(reportIds, options = {}) {
    const { format = 'json', filters = {} } = options;
    const results = [];

    for (const id of reportIds) {
      const result = await generateReport(id, { format, filters });
      if (result) results.push({ id, result });
    }

    logger.info(`Generated ${results.length} reports`);
    return results;
  }

  async function scheduleMultipleReports(reports) {
    const results = [];
    for (const { reportId, schedule } of reports) {
      const updated = await updateSchedule(reportId, schedule);
      results.push({ reportId, success: !!updated });
    }
    return results;
  }

  async function logReportExecution(reportId, action, details = {}) {
    logger.info(`Report ${action}: ${reportId}`, details);
    // persist in db if needed
  }

  // ---------------- Queue ----------------
  async function processReportQueue() {
    if (isProcessing || reportQueue.length === 0) return;

    isProcessing = true;
    try {
      while (reportQueue.length > 0) {
        const task = reportQueue.shift();
        await executeReport(task.id, task.options);
      }
    } catch (error) {
      logger.error('Error processing report queue:', error);
    } finally {
      isProcessing = false;
    }
  }

  function addToQueue(reportId, options = {}) {
    reportQueue.push({ id: reportId, options });
    processReportQueue();
  }

  // ---------------- Public API ----------------
  return {
    createReport,
    getReport,
    getAllReports,
    updateReport,
    deleteReport,
    duplicateReport,
    generateReport,
    executeReport,
    executeReportQuery,
    updateSchedule,
    removeSchedule,
    updateRecipients,
    getRecipients,
    getReportHistory,
    getReportLogs,
    getScheduledReports,
    getReportTypes,
    getReportCategories,
    generateMultipleReports,
    scheduleMultipleReports,
    logReportExecution,
    processReportQueue,
    addToQueue,
  };
}

// Default singleton
const reportService = createReportService();
export default reportService;
