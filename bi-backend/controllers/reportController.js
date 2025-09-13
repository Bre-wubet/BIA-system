import reportService from '../services/reportService.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import logger from '../config/logger.js';

// Create a new report
export const createReport = asyncHandler(async (req, res) => {
  const { name, type, category, description, query_config, schedule, recipients, created_by } = req.body;
  
  const reportData = {
    name,
    type,
    category,
    description,
    query_config,
    schedule,
    recipients,
    created_by: created_by || req.users?.id || 1
  };

  const report = await reportService.createReport(reportData);
  logger.info(`Report created: ${report.id} by user ${reportData.created_by}`);

  res.status(201).json({
    success: true,
    message: 'Report created successfully',
    data: report
  });
});

// Get a specific report
export const getReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const report = await reportService.getReport(id);

  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  res.json({ success: true, data: report });
});

// Get all reports
export const getAllReports = asyncHandler(async (req, res) => {
  const { type, category, limit = 50, offset = 0 } = req.query;
  const reports = await reportService.getAllReports({ type, category, limit, offset });

  res.json({ success: true, data: reports });
});

// Update a report
export const updateReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const report = await reportService.updateReport(id, updateData);
  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  logger.info(`Report updated: ${id} by user ${req.users?.id || 1}`);
  res.json({ success: true, message: 'Report updated successfully', data: report });
});

// Delete a report
export const deleteReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await reportService.deleteReport(id);

  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  logger.info(`Report deleted: ${id} by user ${req.users?.id || 1}`);
  res.json({ success: true, message: 'Report deleted successfully' });
});

// Duplicate a report
export const duplicateReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const duplicatedReport = await reportService.duplicateReport(id, req.users?.id || 1, name);
  if (!duplicatedReport) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  logger.info(`Report duplicated: ${id} to ${duplicatedReport.id} by user ${req.users?.id || 1}`);
  res.status(201).json({ success: true, message: 'Report duplicated successfully', data: duplicatedReport });
});

// Generate a report
export const generateReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { format = 'json', filters = {} } = req.query;

  const reportData = await reportService.generateReport(id, { format, filters });
  if (!reportData) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  logger.info(`Report generated: ${id} in ${format} format by user ${req.users?.id || 1}`);
  res.json({ success: true, data: reportData });
});

// Execute a report
export const executeReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { format = 'json', filters = {} } = req.body;

  const result = await reportService.executeReport(id, { format, filters });
  if (!result) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  logger.info(`Report executed: ${id} by user ${req.users?.id || 1}`);
  res.json({ success: true, message: 'Report executed successfully', data: result });
});

// Update report schedule
export const updateSchedule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { schedule } = req.body;

  const updated = await reportService.updateSchedule(id, schedule);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  logger.info(`Report schedule updated: ${id} by user ${req.users?.id || 1}`);
  res.json({ success: true, message: 'Report schedule updated successfully' });
});

// Remove report schedule
export const removeSchedule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await reportService.removeSchedule(id);

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  logger.info(`Report schedule removed: ${id} by user ${req.users?.id || 1}`);
  res.json({ success: true, message: 'Report schedule removed successfully' });
});

// Update report recipients
export const updateRecipients = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { recipients } = req.body;

  const updated = await reportService.updateRecipients(id, recipients);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  logger.info(`Report recipients updated: ${id} by user ${req.users?.id || 1}`);
  res.json({ success: true, message: 'Report recipients updated successfully' });
});

// Get report recipients
export const getRecipients = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const recipients = await reportService.getRecipients(id);

  if (!recipients) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  res.json({ success: true, data: recipients });
});

// Get report history
export const getReportHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  const history = await reportService.getReportHistory(id, { limit, offset });
  if (!history) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  res.json({ success: true, data: history });
});

// Get report logs
export const getReportLogs = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { level, limit = 50, offset = 0 } = req.query;

  const logs = await reportService.getReportLogs(id, { level, limit, offset });
  if (!logs) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  res.json({ success: true, data: logs });
});

// Get scheduled reports
export const getScheduledReports = asyncHandler(async (req, res) => {
  const scheduledReports = await reportService.getScheduledReports();
  res.json({ success: true, data: scheduledReports });
});

// Get report types
export const getReportTypes = asyncHandler(async (req, res) => {
  const types = await reportService.getReportTypes();
  res.json({ success: true, data: types });
});

// Get report categories
export const getReportCategories = asyncHandler(async (req, res) => {
  const categories = await reportService.getReportCategories();
  res.json({ success: true, data: categories });
});

// Get report statistics
export const getReportStats = asyncHandler(async (req, res) => {
  const stats = await reportService.getReportStats();
  res.json({ success: true, data: stats });
});

// Get report templates
export const getReportTemplates = asyncHandler(async (req, res) => {
  const { category, role } = req.query;
  const templates = await reportService.getReportTemplates({ category, role });
  res.json({ success: true, data: templates });
});

// Create report from template
export const createReportFromTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  
  const report = await reportService.createReportFromTemplate(id, req.users?.id || 1, { name, description });
  if (!report) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }

  logger.info(`Report created from template: ${id} -> ${report.id} by user ${req.users?.id || 1}`);
  res.status(201).json({ success: true, message: 'Report created from template successfully', data: report });
});

// Run report (new method for frontend compatibility)
export const runReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { parameters = {} } = req.body;

  const result = await reportService.runReport(id, { parameters });
  if (!result) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  logger.info(`Report run: ${id} by user ${req.users?.id || 1}`);
  res.json({ success: true, message: 'Report executed successfully', data: result });
});

// Export report
export const exportReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { format = 'pdf' } = req.query;

  const fileData = await reportService.exportReport(id, format);
  if (!fileData) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  const { filename, content, contentType } = fileData;
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  logger.info(`Report exported: ${id} in ${format} format by user ${req.users?.id || 1}`);
  res.send(content);
});

// Share report
export const shareReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isPublic, allowDownload, expiresAt, password } = req.body;

  const shareData = await reportService.shareReport(id, { isPublic, allowDownload, expiresAt, password });
  if (!shareData) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  logger.info(`Report shared: ${id} by user ${req.users?.id || 1}`);
  res.json({ success: true, message: 'Report shared successfully', data: shareData });
});

// Generate multiple reports
export const generateMultipleReports = asyncHandler(async (req, res) => {
  const { reportIds, format = 'json', filters = {} } = req.body;
  const results = await reportService.generateMultipleReports(reportIds, { format, filters });

  logger.info(`Multiple reports generated: ${reportIds.length} reports by user ${req.users?.id || 1}`);
  res.json({ success: true, message: 'Multiple reports generated successfully', data: results });
});

// Schedule multiple reports
export const scheduleMultipleReports = asyncHandler(async (req, res) => {
  const { reports } = req.body;
  const results = await reportService.scheduleMultipleReports(reports);

  logger.info(`Multiple reports scheduled: ${reports.length} reports by user ${req.users?.id || 1}`);
  res.json({ success: true, message: 'Multiple reports scheduled successfully', data: results });
});