import PDFDocument from 'pdfkit';
import fs from 'fs';
import logger from '../config/logger.js';

// ---------------- Core Helpers ----------------
function createPDFBuffer(contentFn, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, ...options });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      contentFn(doc);

      doc.end();
    } catch (error) {
      logger.error('Error generating PDF:', error);
      reject(error);
    }
  });
}

function writeTable(doc, headers, rows, { x = 50, y = null, rowHeight = 20 } = {}) {
  if (y) doc.y = y;

  doc.font('Helvetica-Bold');
  headers.forEach((h, i) => doc.text(h, x + i * 120, doc.y, { width: 120 }));
  doc.moveDown(1);
  doc.font('Helvetica');

  rows.forEach(row => {
    row.forEach((cell, i) => {
      doc.text(String(cell ?? ''), x + i * 120, doc.y, { width: 120 });
    });
    doc.moveDown(1);
  });
}

// ---------------- Exporter API ----------------
async function convertToPDF(data, options = {}) {
  return createPDFBuffer(doc => {
    doc.fontSize(14).text('Data Export', { align: 'center' }).moveDown(1);

    if (Array.isArray(data)) {
      const headers = Object.keys(data[0] || {});
      const rows = data.map(row => headers.map(h => row[h]));
      writeTable(doc, headers, rows);
    } else if (typeof data === 'object') {
      Object.entries(data).forEach(([key, value]) => {
        doc.font('Helvetica-Bold').text(`${key}: `, { continued: true });
        doc.font('Helvetica').text(
          typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
        );
        doc.moveDown(0.5);
      });
    } else {
      doc.text(String(data));
    }
  }, options);
}

async function convertDashboardToPDF(dashboard, options = {}) {
  return createPDFBuffer(doc => {
    doc.fontSize(18).text(dashboard.name, { align: 'center' }).moveDown(1);
    doc.fontSize(12).text(`Description: ${dashboard.description || ''}`);
    doc.text(`Created At: ${dashboard.created_at}`);
    doc.text(`Updated At: ${dashboard.updated_at}`);
    doc.text(`Is Public: ${dashboard.is_public ? 'Yes' : 'No'}`);
    doc.text(`Is Default: ${dashboard.is_default ? 'Yes' : 'No'}`);
    doc.text(`Refresh Interval: ${dashboard.refresh_interval}`).moveDown(1);

    if (dashboard.widgets?.length) {
      doc.fontSize(14).text('Widgets').moveDown(0.5);
      writeTable(
        doc,
        ['ID', 'Type', 'Title', 'Config'],
        dashboard.widgets.map(w => [
          w.id,
          w.type,
          w.title || '',
          JSON.stringify(w.config || {})
        ])
      );
      doc.moveDown(1);
    }

    if (dashboard.kpis?.length) {
      doc.fontSize(14).text('KPIs').moveDown(0.5);
      writeTable(
        doc,
        ['Name', 'Category', 'Current Value', 'Target Value', 'Trend'],
        dashboard.kpis.map(k => [
          k.name,
          k.category,
          k.current_value,
          k.target_value,
          k.trend
        ])
      );
    }
  }, options);
}

async function convertAnalyticsToPDF(analytics, type, options = {}) {
  return createPDFBuffer(doc => {
    doc.fontSize(18).text('Analytics Report', { align: 'center' }).moveDown(1);

    switch (type) {
      case 'kpi':
        doc.fontSize(14).text('KPI Analytics Summary').moveDown(0.5);
        doc.text(`Total KPIs: ${analytics.totalKPIs}`);
        doc.text(`Categories: ${analytics.categories?.join(', ') || ''}`).moveDown(1);

        if (analytics.performance) {
          doc.fontSize(14).text('Performance Metrics').moveDown(0.5);
          writeTable(
            doc,
            ['Metric', 'Value'],
            Object.entries(analytics.performance)
          );
        }
        break;

      case 'predictive':
        doc.fontSize(14).text('Predictive Analytics Summary').moveDown(0.5);
        doc.text(`Total Models: ${analytics.totalModels}`);
        doc.text(`Active Models: ${analytics.activeModels}`);
        doc.text(`Average Accuracy: ${analytics.averageAccuracy}`).moveDown(1);

        if (analytics.modelPerformance) {
          doc.fontSize(14).text('Model Performance by Category').moveDown(0.5);
          writeTable(
            doc,
            ['Category', 'Total Models', 'Avg Accuracy', 'Active Models', 'Training Models'],
            analytics.modelPerformance.map(m => [
              m.category,
              m.total_models,
              m.avg_accuracy,
              m.active_models,
              m.training_models
            ])
          );
        }
        break;

      case 'cross-module':
        doc.fontSize(14).text('Cross-Module Analytics').moveDown(0.5);

        if (analytics.salesVsMarketing) {
          doc.fontSize(12).text('Sales vs Marketing').moveDown(0.5);
          doc.text(`Correlation: ${analytics.salesVsMarketing.correlation}`);
          doc.text('Insights:');
          analytics.salesVsMarketing.insights.forEach(i => doc.text(`- ${i}`));
          doc.moveDown(1);
        }

        if (analytics.financeVsOperations) {
          doc.fontSize(12).text('Finance vs Operations').moveDown(0.5);
          doc.text(`Correlation: ${analytics.financeVsOperations.correlation}`);
          doc.text('Insights:');
          analytics.financeVsOperations.insights.forEach(i => doc.text(`- ${i}`));
          doc.moveDown(1);
        }
        break;

      case 'anomalies':
        doc.fontSize(14).text('Anomaly Detection Summary').moveDown(0.5);
        doc.text(`Total Anomalies: ${analytics.totalAnomalies}`);
        doc.text(`High Severity: ${analytics.highSeverity}`);
        doc.text(`Medium Severity: ${analytics.mediumSeverity}`);
        doc.text(`Low Severity: ${analytics.lowSeverity}`).moveDown(1);

        if (analytics.anomalies) {
          doc.fontSize(12).text('Anomalies').moveDown(0.5);
          writeTable(
            doc,
            ['ID', 'Type', 'Severity', 'Description', 'Value', 'Expected', 'Deviation', 'Timestamp'],
            analytics.anomalies.map(a => [
              a.id,
              a.type,
              a.severity,
              a.description,
              a.value,
              a.expected,
              a.deviation,
              a.timestamp
            ])
          );
        }
        break;

      default:
        doc.fontSize(14).text('Generic Analytics').moveDown(0.5);
        Object.entries(analytics).forEach(([key, value]) => {
          doc.font('Helvetica-Bold').text(`${key}: `, { continued: true });
          doc.font('Helvetica').text(
            typeof value === 'object' ? JSON.stringify(value) : String(value)
          );
          doc.moveDown(0.5);
        });
    }
  }, options);
}

// ---------------- Export Singleton ----------------
const pdfExporter = {
  convertToPDF,
  convertDashboardToPDF,
  convertAnalyticsToPDF
};

export default pdfExporter;
