import Report from '../models/Report.js';
import logger from '../config/logger.js';
import csvExporter from '../utils/exporters/exportToCSV.js';
import pdfExporter from '../utils/exportToPDF.js';
import excelExporter from '../utils/exportToExcel.js';

export function createReportService() {
  // Internal state
  const reportQueue = [];
  let isProcessing = false;

  // ---------------- Core CRUD ----------------
  async function createReport(reportData) {
    try {
      const report = await Report.createReport(reportData);
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
      let result;

      if (type) {
        result = await Report.findByType(type);
      } else if (category) {
        result = await Report.findByCategory(category);
      } else {
        result = await Report.getAllReports();
      }

      // Extract rows from database result
      const reports = result.rows || [];

      // Apply pagination
      if (limit && offset !== undefined) {
        return reports.slice(offset, offset + parseInt(limit));
      }

      return reports;
    } catch (error) {
      logger.error('Error getting reports:', error);
      throw error;
    }
  }

  async function updateReport(id, updateData) {
    try {
      const report = await Report.updateReport(id, updateData);
      logger.info(`Report updated: ${id}`);
      return report;
    } catch (error) {
      logger.error('Error updating report:', error);
      throw error;
    }
  }

  async function deleteReport(id) {
    try {
      const deleted = await Report.deleteReport(id);
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

  // Unified runner
  async function runReport(id, options = {}) {
    const { format = 'json', filters = {} } = options;

    try {
      // 1. Fetch report definition
      const report = await Report.findById(id);
      if (!report) {
        logger.warn(`Report with id ${id} not found`);
        return null;
      }

      // 2. Execute query based on report type
      const reportData = await executeReportQuery(report, filters);

      // 3. Format output
      return await formatReportOutput(reportData, format, report.name);
    } catch (error) {
      logger.error(`Error running report [${id}] with format ${options.format}:`, error);
      throw error;
    }
  }

  // For one-off generation (e.g., API call)
  async function generateReport(id, options = {}) {
    return runReport(id, options);
  }

  // For executions that need auditing/logging
  async function executeReport(id, options = {}) {
    const result = await runReport(id, options);
    await logReportExecution(id, 'executed', options);
    return result;
  }

  // ---------------- Query Dispatcher ----------------

  async function executeReportQuery(report, filters) {
    const { type, query_config } = report;

    switch (type) {
      case 'sales':
        return generateSalesReport(query_config, filters);
      case 'finance':
        return generateFinanceReport(query_config, filters);
      case 'hr':
        return generateHRReport(query_config, filters);
      case 'operations':
        return generateOperationsReport(query_config, filters);
      case 'analytics':
        return generateAnalyticsReport(query_config, filters);
      default:
        logger.info(`Falling back to generic report handler for type: ${type}`);
        return generateGenericReport(query_config, filters);
    }
  }

  // ---------------- Formatter ----------------
  async function formatReportOutput(reportData, format, reportName = 'Report') {
    const options = {
      title: reportName,
      author: 'ERP BI Analytics System',
      subject: `Report: ${reportName}`,
      generatedAt: new Date().toISOString()
    };

    switch (format.toLowerCase()) {
      case 'csv':
        return csvExporter.convertToCSV(reportData);
      case 'pdf':
        return await pdfExporter.convertToPDF(reportData, options);
      case 'xlsx':
      case 'excel':
        return await excelExporter.convertToExcel(reportData, options);
      case 'json':
      default:
        return JSON.stringify(reportData, null, 2);
    }
  }

// ---------------- Generators ----------------

// Sales Report
async function generateSalesReport(config, filters) {
  const { date_range, region } = filters;

  let query = `
    SELECT region,
           SUM(amount) AS total_sales,
           COUNT(*) AS total_orders
    FROM sales
    WHERE 1=1
  `;

  const values = [];
  let paramIndex = 1;

  if (date_range?.from && date_range?.to) {
    query += ` AND created_at BETWEEN $${paramIndex++} AND $${paramIndex++}`;
    values.push(date_range.from, date_range.to);
  }

  if (region?.length) {
    query += ` AND region = ANY($${paramIndex++})`;
    values.push(region);
  }

  query += ` GROUP BY region ORDER BY total_sales DESC`;

  const { rows } = await database.query(query, values);

  return {
    reportType: 'sales',
    generatedAt: new Date().toISOString(),
    data: rows
  };
}

// Finance Report
async function generateFinanceReport(config, filters) {
  const query = `
    SELECT SUM(revenue) - SUM(expense) AS net_profit,
           SUM(revenue) AS total_revenue,
           SUM(expense) AS total_expense
    FROM finance_transactions
    WHERE date BETWEEN $1 AND $2
  `;
  const { rows } = await database.query(query, [filters.from, filters.to]);

  return {
    reportType: 'finance',
    generatedAt: new Date().toISOString(),
    data: rows[0]
  };
}

// HR Report
async function generateHRReport(config, filters) {
  const { department } = filters;

  let query = `SELECT department, COUNT(*) AS total_employees FROM employees WHERE status = 'active'`;
  const values = [];

  if (department) {
    query += ` AND department = $1`;
    values.push(department);
  }

  query += ` GROUP BY department`;

  const { rows } = await database.query(query, values);

  return {
    reportType: 'hr',
    generatedAt: new Date().toISOString(),
    data: rows
  };
}

// Operations Report
async function generateOperationsReport(config, filters) {
  const query = `
    SELECT machine_id, AVG(uptime_percent) AS avg_efficiency
    FROM operations_log
    WHERE timestamp BETWEEN $1 AND $2
    GROUP BY machine_id
  `;
  const { rows } = await database.query(query, [filters.from, filters.to]);

  return {
    reportType: 'operations',
    generatedAt: new Date().toISOString(),
    data: rows
  };
}

// Analytics Report (Cross-module KPIs)
async function generateAnalyticsReport(config, filters) {
  // Example: join sales & marketing performance
  const query = `
    SELECT c.campaign_name,
           SUM(s.amount) AS sales_generated,
           COUNT(s.id) AS orders_count
    FROM campaigns c
    LEFT JOIN sales s ON c.id = s.campaign_id
    WHERE c.start_date >= $1 AND c.end_date <= $2
    GROUP BY c.campaign_name
  `;
  const { rows } = await database.query(query, [filters.from, filters.to]);

  return {
    reportType: 'analytics',
    generatedAt: new Date().toISOString(),
    data: rows
  };
}

// Fallback Generic Report (executes query_config directly)
async function generateGenericReport(config, filters) {
  // Assume config already contains raw SQL
  const { sql, params } = buildSQLFromConfig(config, filters);
  const { rows } = await database.query(sql, params);

  return {
    reportType: 'generic',
    generatedAt: new Date().toISOString(),
    data: rows
  };
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
    const result = await Report.getScheduledReports();
    return result.rows || [];
  }

  async function getReportTypes() {
    return Report.getReportTypes();
  }

  async function getReportCategories() {
    return Report.getCategories();
  }

  async function getReportStats() {
    try {
      const stats = await Report.getStats();
      return stats;
    } catch (error) {
      logger.error('Error getting report stats:', error);
      throw error;
    }
  }

  async function getReportTemplates({ category, role } = {}) {
    try {
      const result = await Report.getTemplates({ category, role });
      return result.rows || [];
    } catch (error) {
      logger.error('Error getting report templates:', error);
      throw error;
    }
  }

  async function createReportFromTemplate(templateId, userId, options = {}) {
    try {
      const template = await Report.getTemplate(templateId);
      if (!template) return null;

      const reportData = {
        name: options.name || template.name,
        description: options.description || template.description,
        type: template.type,
        category: template.category,
        query_config: template.query_config,
        created_by: userId
      };

      const report = await createReport(reportData);
      logger.info(`Report created from template: ${templateId} -> ${report.id}`);
      return report;
    } catch (error) {
      logger.error('Error creating report from template:', error);
      throw error;
    }
  }

  async function runReport(id, options = {}) {
    return executeReport(id, options);
  }

  async function exportReport(id, format) {
    try {
      const report = await getReport(id);
      if (!report) return null;

      const reportData = await executeReportQuery(report, {});
      const formattedData = await formatReportOutput(reportData, format, report.name);
      
      const filename = `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}.${format}`;
      const contentType = getContentType(format);
      
      return {
        filename,
        content: formattedData,
        contentType
      };
    } catch (error) {
      logger.error('Error exporting report:', error);
      throw error;
    }
  }

  async function shareReport(id, shareOptions) {
    try {
      const shareData = await Report.updateSharing(id, shareOptions);
      logger.info(`Report sharing updated: ${id}`);
      return shareData;
    } catch (error) {
      logger.error('Error sharing report:', error);
      throw error;
    }
  }

  function getContentType(format) {
    const contentTypes = {
      'pdf': 'application/pdf',
      'csv': 'text/csv',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'json': 'application/json'
    };
    return contentTypes[format] || 'application/octet-stream';
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
    getReportStats,
    getReportTemplates,
    createReportFromTemplate,
    runReport,
    exportReport,
    shareReport,
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
